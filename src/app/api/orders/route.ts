import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { getSessionUser } from "@/lib/auth";
import { orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getSessionUser(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  try {
    return NextResponse.json(await orderService.getMyOrders(session.userId));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  const session = getSessionUser(req);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  try {
    const { items, cardLast4 } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !/^\d{4}$/.test(cardLast4)) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }
    const order = await orderService.createFromCart(session.userId, items, cardLast4);
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "Stock insuficiente" }, { status: 409 });
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    if (e instanceof Error && e.message === "INVALID_QUANTITY") return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    return apiError(e);
  }
}
