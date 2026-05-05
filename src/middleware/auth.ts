import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { fail } from "../utils/http";
import { AuthenticatedRequest, AuthUser } from "../types/auth";

type TokenPayload = AuthUser & { iat?: number; exp?: number };

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, 401, "Authorization token is required");
  }

  const token = header.slice(7).trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch {
    return fail(res, 401, "Invalid or expired token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return fail(res, 401, "Not authenticated");
    }
    if (!roles.includes(req.user.role)) {
      return fail(res, 403, "You do not have permission for this action");
    }
    return next();
  };
}
