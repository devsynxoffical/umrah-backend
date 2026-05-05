import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import Stripe from "stripe";
import { config } from "../config";
import { requireAuth, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { fail, ok } from "../utils/http";

const router = Router();
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia",
});
const checkoutSchema = z.object({
  packageId: z.string().uuid(),
  travelers: z.number().int().positive(),
  formValues: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    phone: z.string().min(6),
    passport: z.string().min(4),
  }),
  pricing: z.object({
    total: z.number().positive(),
  }),
});

// Create a Stripe Checkout Session
router.post("/create-checkout-session", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid checkout payload", parsed.error.flatten());
  }
  const { packageId, travelers, formValues, pricing } = parsed.data;

  try {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return fail(res, 404, "Package not found");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pkg.title,
              description: `${pkg.season} Season • ${pkg.period} • ${travelers} traveler(s)`,
            },
            unit_amount: Math.round(pricing.total * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/packages/${pkg.id}`,
      customer_email: formValues.email,
      metadata: {
        packageId,
        userId: req.user!.userId,
        travelers: travelers.toString(),
        fullName: formValues.fullName,
        phone: formValues.phone,
        passport: formValues.passport,
      },
    });

    if (!session.url) {
      return fail(res, 500, "Stripe did not return a checkout URL");
    }

    return ok(res, { url: session.url });
  } catch (error: unknown) {
    console.error("Stripe Session Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return fail(res, 500, message);
  }
});

router.get("/checkout-session/:sessionId", async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return ok(res, {
      id: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      customerEmail: session.customer_email,
    });
  } catch (error) {
    return fail(res, 404, "Checkout session not found", String(error));
  }
});

// Get all payments (Admin)
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { booking: true },
    });
    return ok(res, payments);
  } catch (error) {
    return fail(res, 500, "Failed to fetch payments", String(error));
  }
});

export default router;
