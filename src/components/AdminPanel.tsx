"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import type { AdminOrderDTO } from "@/server/dto/orderDto";
import type { ProductDTO } from "@/server/dto/productDto";
import { useAuthStore } from "@/store/auth";

export default function AdminPanel() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<AdminOrderDTO[]>([]);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  // Mejora de Ivan: sin header Authorization; el navegador manda la cookie httpOnly en peticiones al mismo origen.
  const jsonHeaders = { "Content-Type": "application/json" };

  const load = useCallback(async () => {
    const [p, o] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/admin/orders"),
    ]);
    if (p.ok) setProducts(await p.json());
    if (o.ok) setOrders(await o.json());
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && user?.role === "ADMIN") load();
  }, [mounted, user, load]);

  async function savePrice(id: number) {
    const quetzales = Number(prices[id]);
    if (!Number.isFinite(quetzales) || quetzales <= 0) {
      setMessage("Ingresa un precio válido");
      return;
    }
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ priceCents: Math.round(quetzales * 100) }),
    });
    setMessage(res.ok ? "Precio actualizado" : "No se pudo actualizar el precio");
    setPrices((prev) => ({ ...prev, [id]: "" }));
    load();
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setMessage(res.ok ? "Producto eliminado" : "No se pudo eliminar (¿tiene órdenes asociadas?)");
    load();
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const v = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        name: v.name,
        brand: v.brand,
        description: v.description,
        priceCents: Math.round(Number(v.price) * 100),
        stock: Number(v.stock),
        imageUrl: v.imageUrl,
      }),
    });
    setMessage(res.ok ? "Producto creado" : "No se pudo crear el producto");
    if (res.ok) form.reset();
    load();
  }

  if (!mounted) return <main className="page-container py-16" />;

  if (user?.role !== "ADMIN") {
    return (
      <main className="page-container max-w-xl py-28 text-center">
        <p className="eyebrow">Administración</p>
        <h1 className="display mt-4 text-5xl">Acceso restringido</h1>
        <div className="rule mx-auto mt-6" />
        <p className="mt-6 text-sm text-ink-muted">Esta sección es solo para administradores.</p>
      </main>
    );
  }

  return (
    <main className="page-container pb-24">
      <div className="pt-8 sm:pt-12">
        <p className="eyebrow">Administración</p>
        <h1 className="display mt-4 text-5xl">Panel</h1>
        <div className="rule mt-6" />
      </div>

      {message && (
        <p role="status" className="notice mt-8">
          {message}
        </p>
      )}

      <section className="mt-14">
        <h2 className="font-serif text-3xl font-light text-ink">Productos</h2>
        <div className="mt-6 overflow-x-auto rounded-sm border border-sand-dark bg-paper shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sand-dark bg-sand/60">
              <tr>
                <th className="table-head px-4 py-3">Producto</th>
                <th className="table-head px-4 py-3">Marca</th>
                <th className="table-head px-4 py-3">Precio</th>
                <th className="table-head px-4 py-3">Stock</th>
                <th className="table-head px-4 py-3">Nuevo precio (Q)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-sand/40">
                  <td className="px-4 py-4 font-serif text-xl font-light text-ink">{p.name}</td>
                  <td className="px-4 text-ink-muted">{p.brand}</td>
                  <td className="px-4 font-medium text-ink">{formatPrice(p.priceCents)}</td>
                  <td className="px-4 text-ink-muted">{p.stock}</td>
                  <td className="w-60 px-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label={`Nuevo precio de ${p.name}`}
                        value={prices[p.id] ?? ""}
                        onChange={(e) => setPrices((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="field py-2"
                      />
                      <button type="button" onClick={() => savePrice(p.id)} className="btn-secondary px-4 py-2">
                        Guardar
                      </button>
                    </div>
                  </td>
                  <td className="px-4 text-right">
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="text-[0.68rem] uppercase tracking-[0.2em] text-red-800 transition-colors hover:text-red-950"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl font-light text-ink">Nuevo producto</h2>
        <form onSubmit={handleCreate} className="mt-6 grid max-w-3xl gap-5 rounded-sm bg-sand p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <label htmlFor="new-name" className="label">
              Nombre
            </label>
            <input id="new-name" name="name" placeholder="Nombre" aria-label="Nombre" required className="field" />
          </div>
          <div>
            <label htmlFor="new-brand" className="label">
              Marca
            </label>
            <input id="new-brand" name="brand" placeholder="Marca" aria-label="Marca" required className="field" />
          </div>
          <div>
            <label htmlFor="new-price" className="label">
              Precio (Q)
            </label>
            <input
              id="new-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio (Q)"
              aria-label="Precio"
              required
              className="field"
            />
          </div>
          <div>
            <label htmlFor="new-stock" className="label">
              Stock
            </label>
            <input
              id="new-stock"
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              aria-label="Stock"
              required
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-image" className="label">
              URL de imagen
            </label>
            <input
              id="new-image"
              name="imageUrl"
              placeholder="URL de imagen"
              aria-label="URL de imagen"
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-description" className="label">
              Descripción
            </label>
            <textarea
              id="new-description"
              name="description"
              placeholder="Descripción"
              aria-label="Descripción"
              rows={3}
              className="field"
            />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2 sm:w-fit">
            Crear producto
          </button>
        </form>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl font-light text-ink">Órdenes</h2>
        <div className="mt-6 overflow-x-auto rounded-sm border border-sand-dark bg-paper shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sand-dark bg-sand/60">
              <tr>
                <th className="table-head px-4 py-3">#</th>
                <th className="table-head px-4 py-3">Cliente</th>
                <th className="table-head px-4 py-3">Productos</th>
                <th className="table-head px-4 py-3">Total</th>
                <th className="table-head px-4 py-3">Estado</th>
                <th className="table-head px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-ink-muted">
                    Aún no hay órdenes.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-sand/40">
                  <td className="px-4 py-4 text-ink-muted">{o.id}</td>
                  <td className="px-4">
                    {o.user.name} <span className="text-ink-muted">({o.user.email})</span>
                  </td>
                  <td className="px-4 text-ink-muted">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 font-medium text-ink">{formatPrice(o.totalCents)}</td>
                  <td className="px-4">
                    <span className="rounded-full bg-sage-soft px-3 py-1 text-[0.66rem] uppercase tracking-[0.15em] text-ink-soft">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 text-ink-muted">{new Date(o.createdAt).toLocaleDateString("es-GT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
