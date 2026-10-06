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
