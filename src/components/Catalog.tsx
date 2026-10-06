"use client";

import { useEffect, useState, type FormEvent } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductDTO } from "@/server/dto/productDto";

export default function Catalog() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(url: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      setError("No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("/api/products");
  }, []);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = term.trim();
    load(q ? `/api/products/search?q=${encodeURIComponent(q)}` : "/api/products");
  }

  return (
    <section id="catalogo" className="scroll-mt-16 bg-sand/60">
      <div className="page-container py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Catálogo</p>
          <h2 className="display mt-4 text-4xl sm:text-6xl">Nuestras fragancias</h2>
          <div className="rule mx-auto mt-6" />
        </div>

        <form onSubmit={handleSearch} className="mx-auto mt-12 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nombre o marca"
            aria-label="Buscar productos"
            className="field"
          />
          <button type="submit" className="btn-primary sm:px-8">
            Buscar
          </button>
        </form>

        {error && <p className="mt-12 text-center text-sm text-ink-muted">{error}</p>}
        {!error && !loading && products.length === 0 && (
          <p className="mt-12 text-center text-sm text-ink-muted">No encontramos fragancias con ese criterio.</p>
        )}

        {loading && products.length === 0 && !error ? (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-sand-dark/50" />
            ))}
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
