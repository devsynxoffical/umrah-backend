import dotenv from "dotenv";

dotenv.config({ override: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : ["https://deviy.cloud", "http://deviy.cloud"],
  frontendUrl: process.env.FRONTEND_URL || "https://deviy.cloud",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "sk_test_REPLACE_ME_WITH_REAL_STRIPE_SECRET_KEY",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_REPLACE_ME_WITH_REAL_WEBHOOK_SECRET",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

export { config, requireEnv };
