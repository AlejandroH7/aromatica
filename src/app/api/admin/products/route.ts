import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
  const { name, brand, description, priceCents, stock, imageUrl } = await req.json();

  if (!name || !brand || !Number.isInteger(priceCents) || priceCents <= 0 || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: "Datos del producto inválidos" }, { status: 400 });
  }

  const product = await productService.create({
    name,
    brand,
    description: description ?? "",
    priceCents,
    stock,
    imageUrl: imageUrl ?? "",
  });
  return NextResponse.json(product, { status: 201 });
}
