import type { Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/db";

type ProductSearchRow = Pick<
  Product,
  "id" | "name" | "brand" | "description" | "priceCents" | "stock" | "imageUrl"
>;

export interface NewProduct {
  name: string;
  brand: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
}

export const productRepository = {
  findAll() {
    return prisma.product.findMany({ where: { active: true }, orderBy: { id: "asc" } });
  },

  findById(id: number) {
    return prisma.product.findUnique({ where: { id } });
  },

  create(data: NewProduct) {
    return prisma.product.create({ data });
  },

  update(id: number, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  remove(id: number) {
    return prisma.product.delete({ where: { id } });
  },

  search(term: string) {
    const pattern = `%${term}%`;
    return prisma.$queryRaw<ProductSearchRow[]>`
      SELECT id, name, brand, description, "priceCents", stock, "imageUrl"
      FROM "Product"
      WHERE active = true AND (name ILIKE ${pattern} OR brand ILIKE ${pattern})
      ORDER BY id
    `;
  },
};
