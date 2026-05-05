import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();
const visaStatusSchema = z.enum(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"]);

// Get all visas
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const visas = await prisma.visaApplication.findMany();
    return ok(res, visas);
  } catch (error) {
    return fail(res, 500, "Failed to fetch visas", String(error));
  }
});

// Update Visa Status
router.put("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = visaStatusSchema.safeParse(req.body?.status);
  if (!parsed.success) {
    return fail(res, 400, "Invalid visa status");
  }
  try {
    const updatedVisa = await prisma.visaApplication.update({
      where: { id: String(req.params.id) },
      data: { status: parsed.data },
    });
    return ok(res, updatedVisa);
  } catch (error) {
    return fail(res, 500, "Failed to update visa status", String(error));
  }
});

export default router;
