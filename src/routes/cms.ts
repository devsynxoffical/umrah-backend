import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { created, fail, ok } from "../utils/http";

const router = Router();

const contentSchema = z.object({
  screen: z.string().min(2).max(80),
  section: z.string().min(1).max(120),
  contentKey: z.string().min(1).max(120),
  contentType: z.enum(["TEXT", "RICHTEXT", "URL", "JSON"]).default("TEXT"),
  value: z.string().min(0),
  isPublished: z.boolean().default(true),
});

const contentUpdateSchema = contentSchema.partial();
const bulkSchema = z.object({
  screen: z.string().min(2).max(80),
  items: z.array(contentSchema.omit({ screen: true })),
  replace: z.boolean().default(false),
});

router.get("/public/:screen", async (req, res) => {
  try {
    const screen = String(req.params.screen);
    const items = await prisma.cmsContent.findMany({
      where: { screen, isPublished: true },
      orderBy: [{ section: "asc" }, { contentKey: "asc" }],
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, 500, "Failed to fetch public CMS content", String(error));
  }
});

router.get("/:screen", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const screen = String(req.params.screen);
    const items = await prisma.cmsContent.findMany({
      where: { screen },
      orderBy: [{ section: "asc" }, { contentKey: "asc" }],
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, 500, "Failed to fetch CMS content", String(error));
  }
});

router.get("/:screen/export", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const screen = String(req.params.screen);
    const items = await prisma.cmsContent.findMany({
      where: { screen },
      orderBy: [{ section: "asc" }, { contentKey: "asc" }],
    });
    return ok(res, {
      screen,
      exportedAt: new Date().toISOString(),
      items: items.map((item) => ({
        section: item.section,
        contentKey: item.contentKey,
        contentType: item.contentType,
        value: item.value,
        isPublished: item.isPublished,
      })),
    });
  } catch (error) {
    return fail(res, 500, "Failed to export CMS content", String(error));
  }
});

router.post("/import", requireAuth, requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
  const parsed = bulkSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid CMS import payload", parsed.error.flatten());
  }

  const { screen, items, replace } = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (replace) {
        await tx.cmsContent.deleteMany({ where: { screen } });
      }

      let upserted = 0;
      for (const item of items) {
        await tx.cmsContent.upsert({
          where: {
            screen_section_contentKey: {
              screen,
              section: item.section,
              contentKey: item.contentKey,
            },
          },
          update: {
            contentType: item.contentType,
            value: item.value,
            isPublished: item.isPublished,
            updatedBy: req.user?.email || "admin",
          },
          create: {
            ...item,
            screen,
            updatedBy: req.user?.email || "admin",
          },
        });
        upserted += 1;
      }
      return { upserted };
    });

    return ok(res, {
      screen,
      imported: result.upserted,
      replaced: replace,
    });
  } catch (error) {
    return fail(res, 500, "Failed to import CMS content", String(error));
  }
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
  const parsed = contentSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid CMS payload", parsed.error.flatten());
  }

  try {
    const payload = parsed.data;
    const item = await prisma.cmsContent.upsert({
      where: {
        screen_section_contentKey: {
          screen: payload.screen,
          section: payload.section,
          contentKey: payload.contentKey,
        },
      },
      update: {
        contentType: payload.contentType,
        value: payload.value,
        isPublished: payload.isPublished,
        updatedBy: req.user?.email || "admin",
      },
      create: {
        ...payload,
        updatedBy: req.user?.email || "admin",
      },
    });
    return created(res, item);
  } catch (error) {
    return fail(res, 500, "Failed to save CMS content", String(error));
  }
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
  const parsed = contentUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid CMS update payload", parsed.error.flatten());
  }

  try {
    const item = await prisma.cmsContent.update({
      where: { id: String(req.params.id) },
      data: {
        ...parsed.data,
        updatedBy: req.user?.email || "admin",
      },
    });
    return ok(res, item);
  } catch (error) {
    return fail(res, 500, "Failed to update CMS content", String(error));
  }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.cmsContent.delete({ where: { id: String(req.params.id) } });
    return ok(res, { deleted: true });
  } catch (error) {
    return fail(res, 500, "Failed to delete CMS content", String(error));
  }
});

export default router;
