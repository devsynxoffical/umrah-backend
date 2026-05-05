import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { created, fail, ok } from "../utils/http";

const router = Router();
const bookingStatusEnum = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

const bookingSchema = z.object({
  packageId: z.string().uuid(),
  travelers: z.number().int().positive(),
  totalAmount: z.number().nonnegative(),
  departureDate: z.string().datetime().or(z.date().transform((val) => val.toISOString())).optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  passportNumber: z.string().min(4),
  status: bookingStatusEnum.default("PENDING"),
});

// Get all bookings (Admin)
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status } = req.query;
    const where: { status?: "PENDING" | "CONFIRMED" | "CANCELLED" } = {};
    if (status && typeof status === "string") {
      const parsed = bookingStatusEnum.safeParse(status);
      if (!parsed.success) {
        return fail(res, 400, "Invalid booking status filter");
      }
      where.status = parsed.data;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: true,
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, bookings);
  } catch (error) {
    return fail(res, 500, "Failed to fetch bookings", String(error));
  }
});

// Get user's bookings
router.get("/user/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const targetUserId = String(req.params.userId);
    if (req.user?.role !== "ADMIN" && req.user?.userId !== targetUserId) {
      return fail(res, 403, "Not allowed to view these bookings");
    }
    const bookings = await prisma.booking.findMany({
      where: { userId: targetUserId },
      include: { package: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, bookings);
  } catch (error) {
    return fail(res, 500, "Failed to fetch user bookings", String(error));
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      include: { package: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, bookings);
  } catch (error) {
    return fail(res, 500, "Failed to fetch your bookings", String(error));
  }
});

// Create a booking
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid booking payload", parsed.error.flatten());
  }
  try {
    const newBooking = await prisma.booking.create({
      data: {
        ...parsed.data,
        userId: req.user!.userId,
        departureDate: parsed.data.departureDate ? new Date(parsed.data.departureDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
        status: "CONFIRMED", // For now, auto-confirm
      },
    });
    return created(res, newBooking);
  } catch (error) {
    console.error("Booking creation error:", error);
    return fail(res, 500, "Failed to create booking", String(error));
  }
});

// Update booking status
router.put("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = bookingStatusEnum.safeParse(req.body?.status);
  if (!parsed.success) {
    return fail(res, 400, "Invalid booking status");
  }
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: String(req.params.id) },
      data: { status: parsed.data },
    });
    return ok(res, updatedBooking);
  } catch (error) {
    return fail(res, 500, "Failed to update booking status", String(error));
  }
});

export default router;
