import "dotenv/config";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const PASSWORD_SEPARATOR = ".";
const configuredJwtSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !configuredJwtSecret) {
  throw new Error("JWT_SECRET must be set in production");
}

export const JWT_SECRET = configuredJwtSecret || "dev-only-secret-change-me";

export type UserRole = "SUPERADMIN" | "BRANCH_ADMIN";

export type AuthTokenPayload = {
  userId: string;
  username: string;
  role: UserRole;
  branchId: string | null;
};

const scrypt = (value: string, salt: string) =>
  crypto.scryptSync(value, salt, 64).toString("hex");

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}${PASSWORD_SEPARATOR}${scrypt(password, salt)}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, expectedHash] = storedHash.split(PASSWORD_SEPARATOR);

  if (!salt || !expectedHash) {
    return false;
  }

  const computedHash = scrypt(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as AuthTokenPayload & { iat?: number; exp?: number };
