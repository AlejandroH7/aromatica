"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { selectTotal, useCartStore } from "@/store/cart";

export default function CartView() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectTotal);
  const { removeItem, setQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <main className="page-container py-16" />;

  return (
    <main className="page-container max-w-4xl pb-24">
      <div className="pt-8 sm:pt-12">
        <p className="eyebrow">Tu pedido</p>
        <h1 className="display mt-4 text-5xl">Carrito</h1>
        <div className="rule mt-6" />
      </div>

      {items.length === 0 ? (
        <div className="mt-14 rounded-sm bg-sand px-6 py-16 text-center">
          <p className="font-serif text-3xl font-light text-ink">Tu carrito está vacío</p>
          <p className="mt-3 text-sm text-ink-muted">Descubre nuestras fragancias y elige la tuya.</p>
          <Link href="/#catalogo" className="btn-secondary mt-8">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-12 divide-y divide-sand-dark border-y border-sand-dark">
            {items.map((item) => (
              <li
                key={item.productId}
                className="grid grid-cols-[5rem_1fr] items-center gap-x-5 gap-y-4 py-6 sm:grid-cols-[6rem_1fr_auto_auto_auto]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="aspect-[4/5] w-full rounded-sm object-cover shadow-soft"
                />
                <div className="min-w-0">
                  <p className="font-serif text-2xl font-light text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{formatPrice(item.priceCents)}</p>
                </div>
                <div className="col-start-2 flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:col-start-auto sm:contents">
                  <div className="flex items-center rounded-sm border border-sand-dark bg-paper">
                    <button
                      type="button"
                      aria-label="Disminuir"
                      onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="px-3.5 py-2 text-ink transition-colors hover:bg-sand"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="px-3.5 py-2 text-ink transition-colors hover:bg-sand"
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-20 text-right text-sm font-medium text-ink">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                  <button type="button" onClick={() => removeItem(item.productId)} className="link-quiet">
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-stretch gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline justify-between gap-6 sm:justify-start">
              <span className="eyebrow text-ink-muted">Total</span>
              <span className="font-serif text-4xl font-light text-ink">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="btn-primary">
              Ir a pagar
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
