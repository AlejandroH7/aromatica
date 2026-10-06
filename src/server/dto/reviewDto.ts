import type { Review } from "@prisma/client";

export interface ReviewDTO {
  id: number;
  author: string;
  bodyHtml: string;
  rating: number;
  createdAt: string;
}

export function toReviewDTO(entity: Review): ReviewDTO {
  return {
    id: entity.id,
    author: entity.author,
    bodyHtml: entity.bodyHtml,
    rating: entity.rating,
    createdAt: entity.createdAt.toISOString(),
  };
}
