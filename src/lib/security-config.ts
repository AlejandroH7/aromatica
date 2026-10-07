/**
 * Security configuration validation
 * Executes at server startup to prevent running with weak secrets
 */

export function validateSecurityConfig(): void {
  const errors: string[] = [];

  // Validate JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push(
      "❌ JWT_SECRET is missing. Set it in .env with a strong value."
    );
  } else if (jwtSecret.length < 32) {
    errors.push(
      `❌ JWT_SECRET is too weak (${jwtSecret.length} chars, need 32+)`
    );
  }

  // Validate PAYMENT_API_KEY (llave secreta del proveedor de pagos, solo servidor)
  if (!process.env.PAYMENT_API_KEY) {
    errors.push(
      "❌ PAYMENT_API_KEY is missing. Set it in .env (server-only, never NEXT_PUBLIC_)."
    );
  }

  // Validate NODE_ENV
  if (!process.env.NODE_ENV) {
    errors.push("❌ NODE_ENV is not set");
  }

  if (errors.length > 0) {
    console.error("\n" + "=".repeat(60));
    console.error("🔒 SECURITY VALIDATION FAILED");
    console.error("=".repeat(60));
    errors.forEach(err => console.error(err));
    console.error("\n💡 To generate a strong JWT_SECRET:");
    console.error("   openssl rand -base64 32");
    console.error("=".repeat(60) + "\n");
    process.exit(1);
  }

  console.log("✅ Security configuration validated");
}

/**
 * Llave secreta del proveedor de pagos. Solo debe llamarse desde código de servidor.
 */
export function getPaymentApiKey(): string {
  const key = process.env.PAYMENT_API_KEY;
  if (!key) {
    throw new Error(
      "FATAL: PAYMENT_API_KEY environment variable is not set. " +
      "Set it in .env (server-only, without the NEXT_PUBLIC_ prefix)."
    );
  }
  return key;
}
