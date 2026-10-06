import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { name, brand, description, priceCents, stock, imageUrl } = await req.json();

  if (!name || !brand || !Number.isInteger(priceCents) || !Number.isInteger(stock)) {
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
