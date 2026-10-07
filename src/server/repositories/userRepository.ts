import { prisma } from "@/lib/db";

export interface NewUser {
  email: string;
  password: string;
  name: string;
  role?: "CUSTOMER" | "ADMIN";
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  // Guarda lo que recibe: el hash se hace en authService.register.
  create(data: NewUser) {
    return prisma.user.create({ data });
  },
};
