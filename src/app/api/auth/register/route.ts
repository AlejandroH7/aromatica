import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { AuthError, authService } from "@/server/services/authService";
import { sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  try {
    const result = await authService.register({ email, password, name });
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(sessionCookie(result.token));
    return response;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
