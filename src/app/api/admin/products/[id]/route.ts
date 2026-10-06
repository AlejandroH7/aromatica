import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
  const id = Number((await params).id);
  const { priceCents, stock } = await req.json();

  try {
    let product = await productService.get(id);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    if (Number.isInteger(priceCents) && priceCents > 0) {
      product = await productService.updatePrice(id, priceCents);
    }
    if (Number.isInteger(stock) && stock >= 0) {
      product = await productService.updateStock(id, stock);
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(_req)) return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
  const id = Number((await params).id);

  try {
    await productService.remove(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 409 });
  }
}
