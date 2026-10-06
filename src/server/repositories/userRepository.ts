import bcrypt from "bcrypt";
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

  async create(data: NewUser) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  },
};
