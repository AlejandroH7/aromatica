import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { getSessionUser } from "@/lib/auth";
import { OrderError, orderService } from "@/server/services/orderService";

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
    const { items, cardLast4 } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || typeof cardLast4 !== "string" || !/^\d{4}$/.test(cardLast4)) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    for (const item of items) {
      if (!Number.isInteger(item?.productId) || !Number.isInteger(item?.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
      }
    }

    // Solo se toman productId y quantity: precios y total los calcula el servidor desde la BD.
    const order = await orderService.create({
      userId: session.userId,
      items: items.map((i: { productId: number; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      cardLast4,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
