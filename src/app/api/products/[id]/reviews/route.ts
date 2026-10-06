import { NextResponse } from "next/server";
import { reviewService } from "@/server/services/reviewService";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const productId = Number(params.id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const reviews = await reviewService.listByProduct(productId);
  return NextResponse.json(reviews);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const productId = Number(params.id);
  const { author, bodyHtml, rating } = await req.json();

  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  if (!author || !bodyHtml) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const review = await reviewService.create({
    productId,
    author,
    bodyHtml,
    rating: Number.isInteger(rating) ? rating : 5,
  });
  if (!review) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(review, { status: 201 });
}
