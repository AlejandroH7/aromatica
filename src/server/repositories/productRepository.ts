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
    return prisma.product.findMany({ orderBy: { id: "asc" } });
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

  search(term: string): Promise<ProductSearchRow[]> {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { brand: { contains: term, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        brand: true,
        description: true,
        priceCents: true,
        stock: true,
        imageUrl: true,
      },
      orderBy: { id: "asc" },
    });
  },
};
