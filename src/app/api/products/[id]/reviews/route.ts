import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
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
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const productId = Number(params.id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { author, bodyHtml, rating } = body ?? {};
  if (typeof bodyHtml !== "string" || !bodyHtml.trim()) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "La calificación debe ser un entero entre 1 y 5" }, { status: 400 });
  }

  // userId sale de la sesión, nunca del body.
  const review = await reviewService.create({
    productId,
    userId: session.userId,
    author: typeof author === "string" && author.trim() ? author.trim() : session.name,
    bodyHtml,
    rating,
  });
  if (!review) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(review, { status: 201 });
}
