"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductDTO } from "@/server/dto/productDto";
import { useCartStore } from "@/store/cart";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group flex flex-col">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden rounded-sm bg-sand shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="mt-5">
          <p className="text-[0.66rem] uppercase tracking-[0.26em] text-ink-muted">{product.brand}</p>
          <h3 className="mt-1.5 font-serif text-2xl font-light leading-tight text-ink transition-colors duration-200 group-hover:text-gold-dark">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-medium tracking-wide text-ink">{formatPrice(product.priceCents)}</span>
            <span
              className={`flex items-center gap-2 text-xs ${product.inStock ? "text-ink-muted" : "text-red-800"}`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-sage" : "bg-red-800"}`}
              />
              {product.inStock ? `${product.stock} disponibles` : "Agotado"}
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        disabled={!product.inStock}
        onClick={() =>
          addItem({
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            imageUrl: product.imageUrl,
          })
        }
        className="btn-secondary mt-5 w-full py-3"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
