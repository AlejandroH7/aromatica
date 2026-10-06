import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await productService.list();
  return NextResponse.json(products);
}
