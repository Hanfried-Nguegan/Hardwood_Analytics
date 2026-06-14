import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { resolve } from "path";

const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
const secret = envFile
  .split("\n")
  .find((line) => line.startsWith("JWT_SECRET="))
  ?.split("=")[1]
  ?.trim();

if (!secret) throw new Error("JWT_SECRET not found in .env");

const token = jwt.sign(
  {
    user_id: "test-user-123",
    email: "test@hardwood.dev",
    username: "testuser",
  },
  secret,
  { expiresIn: "7d" }
);

console.log(token);