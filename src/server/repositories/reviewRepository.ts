import { prisma } from "@/lib/db";

export interface NewReview {
  productId: number;
  author: string;
  bodyHtml: string;
  rating: number;
}

export const reviewRepository = {
  findByProduct(productId: number) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: NewReview) {
    return prisma.review.create({ data });
  },
};
