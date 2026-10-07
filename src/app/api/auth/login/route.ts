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

  const { email, password } = body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  try {
    const { user, token } = await authService.login(email, password);
    // Mejora de Ivan: el JWT viaja solo en la cookie httpOnly; el body ya no lo expone a JavaScript.
    const res = NextResponse.json({ user });
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
