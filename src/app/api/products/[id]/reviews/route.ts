import { NextResponse } from "next/server";
import { reviewService } from "@/server/services/reviewService";
import { getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const productId = Number((await params).id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const reviews = await reviewService.listByProduct(productId);
  return NextResponse.json(reviews);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  const attempt = rateLimit(`review:${session.userId}`, 5, 60 * 60 * 1000);
  if (!attempt.allowed) return NextResponse.json({ error: "Demasiadas reseñas" }, { status: 429 });
  const productId = Number((await params).id);
  const { bodyHtml, rating } = await req.json();

  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  if (typeof bodyHtml !== "string" || !bodyHtml.trim()) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const review = await reviewService.create({
    productId,
    userId: session.userId,
    bodyHtml: bodyHtml.trim().slice(0, 2000),
    author: session.name.slice(0, 80),
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 5,
  });
  if (!review) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(review, { status: 201 });
}
