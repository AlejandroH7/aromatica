import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getPaymentApiKey } from "@/lib/security-config";
import { toAdminOrderDTO, toOrderDTO, type AdminOrderDTO, type OrderDTO } from "@/server/dto/orderDto";
import { orderRepository } from "@/server/repositories/orderRepository";

export interface NewOrderItem {
  productId: number;
  quantity: number;
}

export interface NewOrder {
  userId: number;
  items: NewOrderItem[];
  cardLast4: string;
}

export class OrderError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "OrderError";
  }
}

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

  async getByIdForUser(id: number, userId: number): Promise<OrderDTO | null> {
    const order = await orderRepository.findById(id);
    if (!order) return null;
    if (order.userId !== userId) {
      throw new OrderError("No autorizado para acceder a esta orden", 403);
    }
    return toOrderDTO(order);
  },

  // Todo el pedido es atómico. El descuento de stock es un UPDATE condicional
  // (stock >= quantity), así dos compras concurrentes no pueden dejarlo negativo
  // aunque PostgreSQL esté en READ COMMITTED.
  // Los precios nunca vienen del cliente: unitPriceCents sale de product.priceCents
  // y totalCents es la suma, ambos leídos dentro de la misma transacción.
  async create({ userId, items, cardLast4 }: NewOrder): Promise<Order> {
    // La llave del proveedor de pagos solo se lee aquí, en el servidor.
    // El cobro es simulado (status APPROVED); al integrar el proveedor real, usar esta llave.
    getPaymentApiKey();

    return prisma.$transaction(async (tx) => {
      const pricedItems: { productId: number; quantity: number; unitPriceCents: number }[] = [];

      for (const item of items) {
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          const exists = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true } });
          if (!exists) throw new OrderError("Producto no encontrado", 404);
          throw new OrderError("Stock insuficiente", 409);
        }

        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { priceCents: true },
        });
        pricedItems.push({ productId: item.productId, quantity: item.quantity, unitPriceCents: product.priceCents });
      }

      const totalCents = pricedItems.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          items: {
            create: pricedItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
          },
        },
      });

      await tx.payment.create({
        data: { orderId: order.id, cardLast4, amountCents: totalCents, status: "APPROVED" },
      });

      return order;
    });
  },
};
