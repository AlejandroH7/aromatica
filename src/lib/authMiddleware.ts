import { NextResponse } from "next/server";
import { getSessionUser, type TokenPayload } from "@/lib/auth";

export type AdminRequest = Request & { user?: TokenPayload };

export function withAdminAuth(
  handler: (req: AdminRequest, context?: any) => Promise<Response>
) {
  return async (req: AdminRequest, context?: any) => {
    // Mejora de Ivan: la sesión sale de la cookie httpOnly (getSessionUser), ya no del header Authorization.
    const user = getSessionUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesión para continuar" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden acceder a este endpoint" },
        { status: 403 }
      );
    }

    (req as AdminRequest).user = user;
    return handler(req, context);
  };
}
