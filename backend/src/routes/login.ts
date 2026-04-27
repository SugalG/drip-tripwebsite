import { Request, Router } from "express";
import prisma from "../lib/prisma";
import { signAuthToken, verifyPassword } from "../lib/auth";

const router = Router();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const getAttemptKey = (req: Request) => {
  const username =
    typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "unknown";
  return `${req.ip || "unknown"}:${username}`;
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  attempt.count += 1;
  return attempt.count > MAX_LOGIN_ATTEMPTS;
};

const clearAttempts = (key: string) => {
  loginAttempts.delete(key);
};

router.post("/", async (req, res) => {
  try {
    const prismaClient = prisma as any;
    const { username, password } = req.body;
    const attemptKey = getAttemptKey(req);

    if (isRateLimited(attemptKey)) {
      return res.status(429).json({
        message: "Too many login attempts. Please wait a few minutes and try again.",
      });
    }

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await prismaClient.user.findUnique({
      where: { username },
      include: {
        branch: {
          select: { id: true, isActive: true, name: true },
        },
      },
    });

    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    clearAttempts(attemptKey);

    if (user.role === "BRANCH_ADMIN") {
      if (!user.branchId || !user.branch?.isActive) {
        return res.status(403).json({ message: "Assigned branch is unavailable" });
      }

      if (!req.branch || req.branch.id !== user.branchId) {
        return res.status(403).json({
          message: `Please log in from the ${user.branch?.name || "assigned"} branch domain`,
        });
      }
    }

    await prismaClient.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAuthToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      branchId: user.branchId,
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branchId,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
