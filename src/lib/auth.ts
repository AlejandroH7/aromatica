import jwt from "jsonwebtoken";

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

const JWT_SECRET = validateJWTSecret();

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getSessionUser(req: Request): TokenPayload | null {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return verifyToken(header.slice(7));
}
