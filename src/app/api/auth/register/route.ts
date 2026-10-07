import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { setSessionCookie } from "@/lib/auth";
import { AuthError, authService } from "@/server/services/authService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // "role" del body se ignora a propósito: todo registro es CUSTOMER.
  const { email, password, name } = body ?? {};

  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string" || !email || !password || !name) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  try {
    const { user, token } = await authService.register({
      email,
      password,
      name,
      role: "CUSTOMER"
    });

    // Mejora de Ivan: igual que login, la sesión queda en cookie httpOnly y el token no va en el body.
    const res = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.status }
      );
    }
    return apiError(e);
  }
}
