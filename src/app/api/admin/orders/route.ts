import { NextResponse } from "next/server";
import { orderService } from "@/server/services/orderService";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
  const orders = await orderService.getAll();
  return NextResponse.json(orders);
}
