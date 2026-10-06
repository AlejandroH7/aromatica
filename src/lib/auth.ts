import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET debe existir y tener al menos 32 caracteres");
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "2h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
  } catch {
    return null;
  }
}

export function getSessionUser(req: Request): TokenPayload | null {
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const cookieToken = req.headers.get("cookie")?.match(/(?:^|;\s*)aromatica_session=([^;]+)/)?.[1] ?? null;
  return verifyToken(bearer ?? cookieToken ?? "");
}

export function sessionCookie(token: string) {
  return {
    name: "aromatica_session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 2,
  };
}

export function clearSessionCookie() {
  return { name: "aromatica_session", value: "", httpOnly: true, path: "/", maxAge: 0 };
}

export function isAdmin(req: Request) {
  return getSessionUser(req)?.role === "ADMIN";
}
