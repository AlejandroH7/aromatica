import { NextResponse } from "next/server";
import { getSessionUser, type TokenPayload } from "@/lib/auth";

export type AdminRequest = Request & { user?: TokenPayload };

export function withAdminAuth(
  handler: (req: AdminRequest, context?: any) => Promise<Response>
) {
  return async (req: AdminRequest, context?: any) => {
    const user = getSessionUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado. Proporciona un token JWT válido en el header Authorization" },
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
