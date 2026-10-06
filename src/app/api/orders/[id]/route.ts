import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = Number((await params).id);
  const order = Number.isInteger(id)
    ? await orderService.getById(id, session.userId, session.role === "ADMIN")
    : null;
  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  return NextResponse.json(order);
}
