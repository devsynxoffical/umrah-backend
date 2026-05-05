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
  corsOrigin: process.env.CORS_ORIGIN || "https://deviy.cloud",
  frontendUrl: process.env.FRONTEND_URL || "https://deviy.cloud",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

export { config, requireEnv };
