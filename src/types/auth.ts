import { Request } from "express";

export type AuthUser = {
  userId: string;
  role: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
