import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not set");
}

export const generateJWT = (
  userId: string,
  email: string,
  username?: string,
): string => {
  const payload: JWTPayload = {
    user_id: userId,
    email,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days hardcoded
  };
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};
