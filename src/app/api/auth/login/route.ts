import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { AuthError, authService } from "@/server/services/authService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const result = await authService.login(email, password);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
