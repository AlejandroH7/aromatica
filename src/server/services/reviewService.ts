import { toReviewDTO, type ReviewDTO } from "@/server/dto/reviewDto";
import { productRepository } from "@/server/repositories/productRepository";
import { reviewRepository, type NewReview } from "@/server/repositories/reviewRepository";

export const reviewService = {
  async listByProduct(productId: number): Promise<ReviewDTO[]> {
    const reviews = await reviewRepository.findByProduct(productId);
    return reviews.map(toReviewDTO);
  },

  async create(input: NewReview): Promise<ReviewDTO | null> {
    const product = await productRepository.findById(input.productId);
    if (!product) return null;

    const review = await reviewRepository.create(input);
    return toReviewDTO(review);
  },
};
