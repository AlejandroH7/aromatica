import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const include = {
  items: { include: { product: true } },
  payment: true,
};

export const orderRepository = {
  findByUser(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include,
      orderBy: { id: "desc" },
    });
  },

  findAll() {
    return prisma.order.findMany({
      include: { ...include, user: true },
      orderBy: { id: "desc" },
    });
  },

  findById(id: number, userId?: number) {
    return prisma.order.findFirst({ where: { id, ...(userId === undefined ? {} : { userId }) }, include });
  },

  createFromCart(userId: number, items: { productId: number; quantity: number }[], cardLast4: string) {
    return prisma.$transaction(async (tx) => {
      const merged = new Map<number, number>();
      for (const item of items) {
        if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("INVALID_QUANTITY");
        merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
      }
      const normalizedItems = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
      const products = await tx.product.findMany({ where: { id: { in: normalizedItems.map((item) => item.productId) }, active: true } });
      const byId = new Map(products.map((product) => [product.id, product]));
      let totalCents = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      for (const item of normalizedItems) {
        const product = byId.get(item.productId);
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        if (item.quantity > 99) throw new Error("INVALID_QUANTITY");
        const updated = await tx.product.updateMany({ where: { id: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
        totalCents += product.priceCents * item.quantity;
        orderItems.push({ product: { connect: { id: product.id } }, quantity: item.quantity, unitPriceCents: product.priceCents });
      }
      return tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalCents,
          items: { create: orderItems },
          payment: { create: { cardLast4, amountCents: totalCents } },
        },
        include,
      });
    });
  },
};
