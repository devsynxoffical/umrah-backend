import { Router } from "express";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.get("/admin-summary", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const [users, packages, bookings, payments] = await Promise.all([
      prisma.user.count(),
      prisma.package.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.booking.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    return ok(res, {
      users,
      packages,
      bookings,
      revenue: payments._sum.amount || 0,
    });
  } catch (error) {
    return fail(res, 500, "Failed to fetch admin summary", String(error));
  }
});

router.get("/user-summary", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const [bookingsCount, upcoming] = await Promise.all([
      prisma.booking.count({ where: { userId: req.user!.userId } }),
      prisma.booking.findFirst({
        where: { userId: req.user!.userId, status: { in: ["PENDING", "CONFIRMED"] } },
        orderBy: { departureDate: "asc" },
        include: { package: true },
      }),
    ]);

    return ok(res, {
      bookingsCount,
      nextBooking: upcoming,
    });
  } catch (error) {
    return fail(res, 500, "Failed to fetch user summary", String(error));
  }
});

export default router;
