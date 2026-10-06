import { toAdminOrderDTO, toOrderDTO, type AdminOrderDTO, type OrderDTO } from "@/server/dto/orderDto";
import { orderRepository } from "@/server/repositories/orderRepository";

export const orderService = {
  async getMyOrders(userId: number): Promise<OrderDTO[]> {
    const orders = await orderRepository.findByUser(userId);
    return orders.map(toOrderDTO);
  },

  async getAll(): Promise<AdminOrderDTO[]> {
    const orders = await orderRepository.findAll();
    return orders.map(toAdminOrderDTO);
  },

  async getById(id: number): Promise<OrderDTO | null> {
    const order = await orderRepository.findById(id);
    return order ? toOrderDTO(order) : null;
  },
};
