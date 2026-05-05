import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { created, fail, ok } from "../utils/http";

const router = Router();
const packageStatusEnum = z.enum(["ACTIVE", "UPCOMING", "ARCHIVED"]);
const uploadDir = path.join(process.cwd(), "uploads", "packages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext || ".jpg"}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const packageSchema = z.object({
  title: z.string().min(2).max(140),
  slug: z.string().min(2).max(180),
  imageUrl: z.string().trim().url().or(z.literal("")).default(""),
  season: z.string().min(2).max(80),
  period: z.string().min(2).max(80),
  priceFrom: z.number().nonnegative(),
  durationDays: z.number().int().positive(),
  makkahHotel: z.string().min(2),
  madinahHotel: z.string().min(2),
  highlights: z.string().min(2),
  status: packageStatusEnum.default("ACTIVE"),
});

router.post("/upload", requireAuth, requireRole("ADMIN"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return fail(res, 400, "Please select an image file");
    }
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/packages/${req.file.filename}`;
    return ok(res, { imageUrl: fileUrl });
  } catch (error) {
    return fail(res, 500, "Failed to upload package image", String(error));
  }
});

// Get all packages
router.get("/", async (req, res) => {
  try {
    const { status, season } = req.query;
    const where: { status?: "ACTIVE" | "UPCOMING" | "ARCHIVED"; season?: string } = {};
    if (status && typeof status === "string") {
      const parsed = packageStatusEnum.safeParse(status);
      if (!parsed.success) {
        return fail(res, 400, "Invalid package status filter");
      }
      where.status = parsed.data;
    }
    if (season && typeof season === "string") where.season = season;

    const packages = await prisma.package.findMany({ where });
    return ok(res, packages);
  } catch (error) {
    return fail(res, 500, "Failed to fetch packages", String(error));
  }
});

// Get a single package
router.get("/:id", async (req, res) => {
  try {
    const identifier = String(req.params.id);
    const pkg = await prisma.package.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
    });
    if (!pkg) return fail(res, 404, "Package not found");
    return ok(res, pkg);
  } catch (error) {
    return fail(res, 500, "Failed to fetch package", String(error));
  }
});

// Create a package (Admin)
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = packageSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid package payload", parsed.error.flatten());
  }
  try {
    const newPackage = await prisma.package.create({
      data: parsed.data,
    });
    return created(res, newPackage);
  } catch (error) {
    return fail(res, 500, "Failed to create package", String(error));
  }
});

// Update a package (Admin)
router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = packageSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid package update payload", parsed.error.flatten());
  }
  try {
    const updatedPackage = await prisma.package.update({
      where: { id: String(req.params.id) },
      data: parsed.data,
    });
    return ok(res, updatedPackage);
  } catch (error) {
    return fail(res, 500, "Failed to update package", String(error));
  }
});

// Delete (or Archive) a package
router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const archivedPackage = await prisma.package.update({
      where: { id: String(req.params.id) },
      data: { status: "ARCHIVED" },
    });
    return ok(res, archivedPackage);
  } catch (error) {
    return fail(res, 500, "Failed to archive package", String(error));
  }
});

export default router;
