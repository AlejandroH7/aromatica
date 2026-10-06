import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = Number(params.id);
  const order = Number.isInteger(id) ? await orderService.getById(id) : null;
  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // VERIFICACIÓN CRÍTICA: Validar ownership - Prevenir IDOR
  if (order.userId !== session.id) {
    return NextResponse.json(
      { error: "No autorizado para acceder a esta orden" },
      { status: 403 }
    );
  }

  return NextResponse.json(order);
}
