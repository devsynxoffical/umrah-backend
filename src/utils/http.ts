import { Response } from "express";

export function ok(res: Response, data: unknown) {
  return res.status(200).json({ success: true, data });
}

export function created(res: Response, data: unknown) {
  return res.status(201).json({ success: true, data });
}

export function fail(res: Response, status: number, message: string, details?: unknown) {
  return res.status(status).json({
    success: false,
    error: {
      message,
      details: details ?? null,
    },
  });
}
