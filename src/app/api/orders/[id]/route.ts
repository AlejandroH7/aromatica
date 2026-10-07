import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { OrderError, orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  try {
    // VERIFICACIÓN CRÍTICA: Validar ownership - Prevenir IDOR
    const order = await orderService.getByIdForUser(id, session.userId);
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
