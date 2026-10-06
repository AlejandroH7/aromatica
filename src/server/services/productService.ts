import { toProductDTO, type ProductDTO } from "@/server/dto/productDto";
import { productRepository, type NewProduct } from "@/server/repositories/productRepository";

export const productService = {
  async list(): Promise<ProductDTO[]> {
    const products = await productRepository.findAll();
    return products.map(toProductDTO);
  },

  async get(id: number): Promise<ProductDTO | null> {
    const product = await productRepository.findById(id);
    return product ? toProductDTO(product) : null;
  },

  async create(data: NewProduct): Promise<ProductDTO> {
    const product = await productRepository.create(data);
    return toProductDTO(product);
  },

  async updatePrice(id: number, priceCents: number): Promise<ProductDTO> {
    const product = await productRepository.update(id, { priceCents });
    return toProductDTO(product);
  },

  async updateStock(id: number, stock: number): Promise<ProductDTO> {
    const product = await productRepository.update(id, { stock });
    return toProductDTO(product);
  },

  async remove(id: number): Promise<void> {
    await productRepository.remove(id);
  },

  async search(term: string): Promise<ProductDTO[]> {
    const products = await productRepository.search(term);
    return products.map(toProductDTO);
  },
};
