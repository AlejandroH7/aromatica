import type { User } from "@prisma/client";

export interface UserDTO {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function toUserDTO(entity: User): UserDTO {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    role: entity.role,
  };
}
