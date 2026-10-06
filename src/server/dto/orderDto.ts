import type { Order, OrderItem, Payment, Product, User } from "@prisma/client";

export interface OrderItemDTO {
  productId: number;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderDTO {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  items: OrderItemDTO[];
  payment: { cardLast4: string; amountCents: number; status: string } | null;
}

type OrderEntity = Order & {
  items: (OrderItem & { product: Product })[];
  payment: Payment | null;
};

export function toOrderDTO(entity: OrderEntity): OrderDTO {
  return {
    id: entity.id,
    status: entity.status,
    totalCents: entity.totalCents,
    createdAt: entity.createdAt.toISOString(),
    items: entity.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
    payment: entity.payment
      ? {
          cardLast4: entity.payment.cardLast4,
          amountCents: entity.payment.amountCents,
          status: entity.payment.status,
        }
      : null,
  };
}

export interface AdminOrderDTO extends OrderDTO {
  user: { id: number; email: string; name: string };
}

export function toAdminOrderDTO(entity: OrderEntity & { user: User }): AdminOrderDTO {
  return {
    ...toOrderDTO(entity),
    user: { id: entity.user.id, email: entity.user.email, name: entity.user.name },
  };
}
