import { NextResponse } from "next/server";
import { productService } from "@/server/services/productService";
import { withAdminAuth, type AdminRequest } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

export const PATCH = withAdminAuth(
  async (req: AdminRequest, { params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const { priceCents, stock } = await req.json();

    try {
      let product = await productService.get(id);
      if (!product) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }
      if (Number.isInteger(priceCents)) {
        product = await productService.updatePrice(id, priceCents);
      }
      if (Number.isInteger(stock)) {
        product = await productService.updateStock(id, stock);
      }
      return NextResponse.json(product);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 500 });
    }
  }
);

export const DELETE = withAdminAuth(
  async (_req: AdminRequest, { params }: { params: { id: string } }) => {
    const id = Number(params.id);

    try {
      await productService.remove(id);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 409 });
    }
  }
);
