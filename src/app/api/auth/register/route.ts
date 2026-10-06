import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { AuthError, authService } from "@/server/services/authService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  try {
    const result = await authService.register({ email, password, name, role });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return apiError(e);
  }
}
