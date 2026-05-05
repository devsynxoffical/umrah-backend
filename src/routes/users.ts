import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();
const roleSchema = z.enum(["USER", "VIP", "ADMIN"]);

// Get all users (Admin)
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinedAt: true,
        isActive: true,
        bookings: true,
      },
    });
    // Add computed total bookings for each user
    const formattedUsers = users.map(user => ({
      ...user,
      totalBookings: user.bookings.length
    }));
    return ok(res, formattedUsers);
  } catch (error) {
    return fail(res, 500, "Failed to fetch users", String(error));
  }
});

// Get single user
router.get("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        joinedAt: true,
        isActive: true,
        bookings: true,
      },
    });
    if (!user) return fail(res, 404, "User not found");
    return ok(res, user);
  } catch (error) {
    return fail(res, 500, "Failed to fetch user", String(error));
  }
});

// Update User Status/Role (Admin)
router.put("/:id/role", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = roleSchema.safeParse(req.body?.role);
  if (!parsed.success) {
    return fail(res, 400, "Invalid role value");
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role: parsed.data },
    });
    return ok(res, {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    return fail(res, 500, "Failed to update user role", String(error));
  }
});

export default router;
