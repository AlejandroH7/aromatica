import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";
import { withAdminAuth, type AdminRequest } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

export const POST = withAdminAuth(async (req: AdminRequest) => {
  try {
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
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
});
