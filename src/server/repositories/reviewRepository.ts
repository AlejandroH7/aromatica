import { prisma } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";

export interface NewReview {
  productId: number;
  author: string;
  bodyHtml: string;
  rating: number;
}

// DOMPurify configuration para permitir solo tags HTML seguros
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "title"],
  KEEP_CONTENT: true,
};

export const reviewRepository = {
  findByProduct(productId: number) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: NewReview) {
    // Sanitizar HTML para prevenir XSS
    const sanitizedBodyHtml = DOMPurify.sanitize(data.bodyHtml, PURIFY_CONFIG);

    return prisma.review.create({
      data: {
        ...data,
        bodyHtml: sanitizedBodyHtml,
      },
    });
  },
};
