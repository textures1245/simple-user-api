import { Request, Response, NextFunction } from "express";
import { msg } from "../processor/resp";
import JWTAuth from "@/application/features/authentication/utils/jwt-auth";
import { User } from "@/domain/user";
import { UserPayload } from "@/interface/IUser";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json(msg("Authorization header missing", "401"));
  }

  const authHeaderValue = Array.isArray(authHeader)
    ? authHeader[0]
    : authHeader;

  if (!authHeaderValue.startsWith("Bearer ")) {
    return res.status(401).json(msg("Invalid authorization header", "401"));
  }

  const token = authHeaderValue.split(" ")[1];

  if (!token) {
    return res.status(401).json(msg("Token missing", "401"));
  }

  const payload = JWTAuth.validateToken(token);
  if (!payload) {
    return res.status(403).json(msg("Failed to authenticate token", "403"));
  }

  req.user = payload as UserPayload;

  next();
}

export default authMiddleware;
