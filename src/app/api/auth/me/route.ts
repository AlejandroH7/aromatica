import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { authService } from "@/server/services/authService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await authService.me(session.userId);
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json(user);
}
