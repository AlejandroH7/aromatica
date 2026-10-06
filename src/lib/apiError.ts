import { NextResponse } from "next/server";

export function apiError(e: unknown) {
  const err = e instanceof Error ? e : new Error(String(e));
  return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
}
