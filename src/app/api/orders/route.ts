import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const orders = await orderService.getMyOrders(session.userId);
    return NextResponse.json(orders);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { items, totalCents, cardLast4 } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !cardLast4) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente de ${product.name}` }, { status: 409 });
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        totalCents,
        items: {
          create: items.map((i: { productId: number; quantity: number; unitPriceCents: number }) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPriceCents: i.unitPriceCents,
          })),
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        cardLast4,
        amountCents: totalCents,
        status: "APPROVED",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
