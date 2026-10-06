import type { Product } from "@prisma/client";

export interface ProductDTO {
  id: number;
  name: string;
  brand: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  inStock: boolean;
}

type ProductRow = Pick<
  Product,
  "id" | "name" | "brand" | "description" | "priceCents" | "stock" | "imageUrl"
>;

export function toProductDTO(entity: ProductRow): ProductDTO {
  return {
    id: entity.id,
    name: entity.name,
    brand: entity.brand,
    description: entity.description,
    priceCents: entity.priceCents,
    stock: entity.stock,
    imageUrl: entity.imageUrl,
    inStock: entity.stock > 0,
  };
}
