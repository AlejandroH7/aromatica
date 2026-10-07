"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductDTO } from "@/server/dto/productDto";
import type { ReviewDTO } from "@/server/dto/reviewDto";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

export default function ProductDetail({ id }: { id: string }) {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadReviews = useCallback(async () => {
    const res = await fetch(`/api/products/${id}/reviews`);
    if (res.ok) setReviews(await res.json());
  }, [id]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      setProduct(await res.json());
      loadReviews();
    })();
  }, [id, loadReviews]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!user) {
      setFormError("Inicia sesión para publicar una reseña");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        // Mejora de Ivan: la sesión viaja en la cookie httpOnly, no en el header Authorization.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author || user?.name, bodyHtml: body, rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "No se pudo enviar la reseña");
        return;
      }
      setBody("");
      await loadReviews();
    } catch {
      setFormError("No se pudo conectar con el servidor");
    } finally {
      setSending(false);
    }
  }

  if (notFound) {
    return (
      <main className="page-container py-28 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-5xl">Producto no encontrado</h1>
        <div className="rule mx-auto mt-6" />
        <Link href="/" className="btn-secondary mt-10">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-container py-28 text-center text-sm text-ink-muted">
        <span className="animate-pulse">Cargando...</span>
      </main>
    );
  }

  return (
    <main className="page-container pb-24">
      <Link href="/" className="link-quiet inline-block py-4">
        ← Catálogo
      </Link>

      <div className="mt-4 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/5] overflow-hidden rounded-sm bg-sand shadow-lift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="eyebrow">{product.brand}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">{product.name}</h1>
          <div className="rule mt-6" />
          <p className="mt-8 max-w-md text-base leading-relaxed text-ink-muted">{product.description}</p>
          <p className="mt-10 font-serif text-4xl font-light text-ink">{formatPrice(product.priceCents)}</p>
          <p
            className={`mt-3 flex items-center gap-2 text-sm ${product.inStock ? "text-ink-muted" : "text-red-800"}`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-sage" : "bg-red-800"}`}
            />
            {product.inStock ? `${product.stock} unidades disponibles` : "Agotado"}
          </p>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
              });
              setAdded(true);
            }}
            className="btn-primary mt-10 w-full sm:w-auto sm:self-start"
          >
            Agregar al carrito
          </button>
          {added && (
            <Link href="/cart" className="link-quiet mt-4 text-gold-dark">
              Agregado · Ver carrito →
            </Link>
          )}
        </div>
      </div>

      <section className="mt-24 border-t border-gold/30 pt-14 sm:mt-32">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Opiniones</p>
            <h2 className="display mt-4 text-4xl">Reseñas</h2>

            <div className="mt-10 divide-y divide-sand-dark">
              {reviews.length === 0 && (
                <p className="text-sm text-ink-muted">Aún no hay reseñas. Sé el primero.</p>
              )}
              {reviews.map((r) => (
                <article key={r.id} className="py-7 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-serif text-xl text-ink">{r.author}</span>
                    <span className="text-sm tracking-widest text-gold" aria-label={`${r.rating} de 5`}>
                      {"★".repeat(r.rating)}
                      <span className="text-sand-dark">{"★".repeat(Math.max(0, 5 - r.rating))}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted whitespace-pre-wrap break-words">
                    {r.bodyHtml}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 self-start rounded-sm bg-sand p-6 sm:p-8">
            <h3 className="font-serif text-3xl font-light text-ink">Escribe una reseña</h3>
            <div>
              <label htmlFor="review-author" className="label">
                Nombre
              </label>
              <input
                id="review-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={user ? user.name : "Tu nombre"}
                aria-label="Tu nombre"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="review-body" className="label">
                Tu opinión
              </label>
              <textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Cuéntanos qué te pareció"
                aria-label="Tu reseña"
                rows={4}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="review-rating" className="label">
                Calificación
              </label>
              <select
                id="review-rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                aria-label="Calificación"
                className="field"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            </div>
            {formError && (
              <p role="alert" className="notice">
                {formError}
              </p>
            )}
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? "Enviando..." : "Publicar reseña"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
