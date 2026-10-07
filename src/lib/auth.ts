import jwt from "jsonwebtoken";
import type { NextResponse } from "next/server";
import { validateSecurityConfig } from "@/lib/security-config";

// Mejora de Ivan: durante `next build` (imagen Docker) no hay secretos; se validan al ejecutar, no al compilar.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// Falla al arrancar si la configuración de seguridad es débil o falta.
if (!isBuildPhase) validateSecurityConfig();

function validateJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. " +
      "Set it in .env file with a strong secret (min 32 characters). " +
      "Generate one with: openssl rand -base64 32"
    );
  }

  if (secret.length < 32) {
    throw new Error(
      `FATAL: JWT_SECRET is too weak (${secret.length} chars). ` +
      "Minimum 32 characters required. " +
      "Generate a strong one with: openssl rand -base64 32"
    );
  }

  return secret;
}

// Mejora de Ivan: el secreto se resuelve al primer uso para que `next build` no falle sin .env.
let jwtSecret: string | null = null;
function getJWTSecret(): string {
  jwtSecret ??= validateJWTSecret();
  return jwtSecret;
}

// Mejora de Ivan: una sola duración para el JWT y la cookie, así expiran juntos.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
export const SESSION_COOKIE = "aromatica_session";

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

// Mejora de Ivan: la sesión se lee solo de la cookie httpOnly; JS del navegador ya no puede leer ni robar el token.
export function getSessionUser(req: Request): TokenPayload | null {
  const token = readCookie(req, SESSION_COOKIE);
  return token ? verifyToken(token) : null;
}

// Mejora de Ivan: cookie httpOnly + SameSite=Lax (mitiga XSS y CSRF); Secure solo en producción para permitir http://localhost.
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

// Mejora de Ivan: logout real, el navegador borra la cookie de sesión (Max-Age=0).
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
