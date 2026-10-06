import { NextResponse } from "next/server";
import { orderService } from "@/server/services/orderService";
import { withAdminAuth, type AdminRequest } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async (_req: AdminRequest) => {
  try {
    const orders = await orderService.getAll();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { error: "No se pudo obtener las órdenes" },
      { status: 500 }
    );
  }
});
