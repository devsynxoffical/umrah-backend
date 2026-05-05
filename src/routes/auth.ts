import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../db";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/auth";
import { created, fail, ok } from "../utils/http";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; role: string; email: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] },
  );
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid signup payload", parsed.error.flatten());
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail(res, 409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    return created(res, { user, token });
  } catch (error) {
    return fail(res, 500, "Failed to sign up", String(error));
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, "Invalid login payload", parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return fail(res, 401, "Invalid credentials");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return fail(res, 401, "Invalid credentials");
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    return ok(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    return fail(res, 500, "Failed to login", String(error));
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, joinedAt: true, isActive: true },
    });
    if (!user) {
      return fail(res, 404, "User not found");
    }
    return ok(res, user);
  } catch (error) {
    return fail(res, 500, "Failed to load user profile", String(error));
  }
});

export default router;
