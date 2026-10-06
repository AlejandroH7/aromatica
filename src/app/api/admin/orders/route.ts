import { NextResponse } from "next/server";
import { orderService } from "@/server/services/orderService";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await orderService.getAll();
  return NextResponse.json(orders);
}
