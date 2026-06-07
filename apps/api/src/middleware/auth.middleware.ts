import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../types/auth";
import { verifyJWT } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const decoded = verifyJWT(token);

  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.user = decoded;
  next();
};
