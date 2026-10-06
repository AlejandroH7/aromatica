import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { AuthError, authService } from "@/server/services/authService";
import { sessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = req.headers.get("x-forwarded-for") ?? "unknown";
  const attempt = rateLimit(`login:${key}`, 10, 15 * 60 * 1000);
  if (!attempt.allowed) return NextResponse.json({ error: "Demasiados intentos" }, { status: 429, headers: { "Retry-After": String(attempt.retryAfter) } });
  const { email, password } = await req.json();

  try {
    const result = await authService.login(email, password);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(sessionCookie(result.token));
    return response;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
