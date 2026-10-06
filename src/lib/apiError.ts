import { NextResponse } from "next/server";

export function apiError(e: unknown) {
  console.error(e);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
