import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const product = Number.isInteger(id) ? await productService.get(id) : null;

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(product);
}
