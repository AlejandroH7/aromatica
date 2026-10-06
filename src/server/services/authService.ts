import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { toUserDTO, type UserDTO } from "@/server/dto/userDto";
import { userRepository, type NewUser } from "@/server/repositories/userRepository";

export interface AuthResult {
  user: UserDTO;
  token: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function buildResult(user: Parameters<typeof toUserDTO>[0]): AuthResult {
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  return { user: toUserDTO(user), token };
}

export const authService = {
  async register(input: NewUser): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AuthError("El correo ya está registrado", 409);
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      ...input,
      password: hashedPassword,
    });
    return buildResult(user);
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError("Credenciales inválidas", 401);
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthError("Credenciales inválidas", 401);
    }
    return buildResult(user);
  },

  async me(userId: number): Promise<UserDTO | null> {
    const user = await userRepository.findById(userId);
    return user ? toUserDTO(user) : null;
  },
};
