import { Router, Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../db";
import { config } from "../config";

const router = Router();
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia",
});

const endpointSecret = config.stripeWebhookSecret;

router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret || ""
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown webhook signature error";
    console.error(`Webhook Error: ${message}`);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as unknown;
      
      // Create booking and payment records
      const metadata = (session as { metadata?: Record<string, string> }).metadata || {};
      const { packageId, travelers, userId } = metadata;
      
      try {
        const bookingUserId = userId;
        if (!bookingUserId || !packageId) {
          throw new Error("Missing booking metadata");
        }
        const amountTotal = ((session as { amount_total?: number }).amount_total || 0) / 100;

        // Best-effort duplicate prevention for retried webhook deliveries.
        const duplicateBooking = await prisma.booking.findFirst({
          where: {
            userId: bookingUserId,
            packageId,
            totalAmount: amountTotal,
            status: "CONFIRMED",
          },
          orderBy: { createdAt: "desc" },
        });
        if (duplicateBooking) {
          const existingSessionId = (session as { id?: string }).id || "unknown-session";
          console.log(`Skipping duplicate booking for session ${existingSessionId}`);
          break;
        }

        const booking = await prisma.booking.create({
          data: {
            travelers: parseInt(travelers || "1"),
            totalAmount: amountTotal,
            status: "CONFIRMED",
            departureDate: new Date(),
            packageId,
            userId: bookingUserId,
          },
        });

        await prisma.payment.create({
          data: {
            amount: ((session as { amount_total?: number }).amount_total || 0) / 100,
            method: "STRIPE",
            status: "COMPLETED",
            bookingId: booking.id,
          },
        });

        const sessionId = (session as { id?: string }).id || "unknown-session";
        console.log(`Booking ${booking.id} created successfully for session ${sessionId}`);
      } catch (error) {
        console.error("Failed to create booking from webhook:", error);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

export default router;
