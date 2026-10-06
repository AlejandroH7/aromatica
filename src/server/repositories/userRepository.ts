import { prisma } from "@/lib/db";

export interface NewUser {
  email: string;
  password: string;
  name: string;
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: NewUser) {
    return prisma.user.create({ data });
  },
};
