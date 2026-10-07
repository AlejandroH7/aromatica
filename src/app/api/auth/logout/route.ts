import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  // Mejora de Ivan: logout real; antes solo respondía ok y el token seguía siendo válido en el navegador.
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
