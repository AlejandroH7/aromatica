import { prisma } from "@/lib/db";

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

  findById(id: number) {
    return prisma.order.findUnique({ where: { id }, include });
  },
};
