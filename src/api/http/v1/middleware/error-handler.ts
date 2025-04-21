import type { NextFunction, Response, Request } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  resp: Response,
  _next: NextFunction
): any => {
  return resp.status(err.httpCode || 500).json({
    message: err.message || "Internal Server Error",
    status: err.statusCode || "500",
  });
};