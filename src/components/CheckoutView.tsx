"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { formatPrice } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import { selectTotal, useCartStore } from "@/store/cart";

const paymentSchema = z.object({
  cardName: z.string().min(1, "Ingresa el nombre en la tarjeta"),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Número de tarjeta inválido")),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Vencimiento inválido (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
});

export default function CheckoutView() {
  const { user } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectTotal);
  const clear = useCartStore((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = paymentSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPriceCents: i.priceCents,
          })),
          totalCents: total,
          cardLast4: parsed.data.cardNumber.slice(-4),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el pago");
        return;
      }
      clear();
      setOrderId(data.id);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return <main className="page-container py-16" />;

  if (orderId !== null) {
    return (
      <main className="page-container max-w-xl py-24 text-center sm:py-32">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 text-xl text-gold-dark">
          ✓
        </div>
        <p className="eyebrow mt-8">Pago aprobado</p>
        <h1 className="display mt-4 text-5xl">Gracias por tu compra</h1>
        <div className="rule mx-auto mt-6" />
        <p className="mt-8 text-ink-muted">
          Tu número de orden es <span className="font-serif text-3xl font-light text-ink">#{orderId}</span>
        </p>
        <Link href="/" className="btn-secondary mt-10">
          Volver al inicio
        </Link>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-container max-w-xl py-28 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-4 text-5xl">Inicia sesión para pagar</h1>
        <div className="rule mx-auto mt-6" />
        <Link href="/login" className="btn-primary mt-10">
          Ingresar
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-container max-w-xl py-28 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-4 text-5xl">Tu carrito está vacío</h1>
        <div className="rule mx-auto mt-6" />
        <Link href="/#catalogo" className="btn-secondary mt-10">
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="page-container pb-24">
      <div className="pt-8 sm:pt-12">
        <p className="eyebrow">Finalizar compra</p>
        <h1 className="display mt-4 text-5xl">Checkout</h1>
        <div className="rule mt-6" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <section className="self-start rounded-sm bg-sand p-6 sm:p-8">
          <h2 className="font-serif text-3xl font-light text-ink">Tu pedido</h2>
          <ul className="mt-6 divide-y divide-sand-dark">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span className="text-ink">
                  {i.name} <span className="text-ink-muted">× {i.quantity}</span>
                </span>
                <span className="font-medium text-ink">{formatPrice(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-gold/40 pt-5">
            <span className="eyebrow text-ink-muted">Total</span>
            <span className="font-serif text-4xl font-light text-ink">{formatPrice(total)}</span>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-light text-ink">Pago con tarjeta</h2>
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div>
              <label htmlFor="cardName" className="label">
                Nombre en la tarjeta
              </label>
              <input id="cardName" name="cardName" autoComplete="cc-name" className="field" />
            </div>
            <div>
              <label htmlFor="cardNumber" className="label">
                Número de tarjeta
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                className="field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="label">
                  Vencimiento
                </label>
                <input id="expiry" name="expiry" placeholder="MM/YY" autoComplete="cc-exp" className="field" />
              </div>
              <div>
                <label htmlFor="cvv" className="label">
                  CVV
                </label>
                <input id="cvv" name="cvv" inputMode="numeric" autoComplete="cc-csc" className="field" />
              </div>
            </div>

            {error && (
              <p role="alert" className="notice">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? "Procesando..." : `Pagar ${formatPrice(total)}`}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
