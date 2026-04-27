import { Router } from "express";
import prisma from "../lib/prisma";
import requireAuth from "../middleware/requireAuth";
import { hashPassword, verifyPassword } from "../lib/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const prismaClient = prisma as any;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ authenticated: false });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        branch: {
          select: { id: true, name: true, slug: true, hostname: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch,
      },
    });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  return res.json({ message: "Logged out" });
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const prismaClient = prisma as any;
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: currentUser.userId },
      select: { id: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!verifyPassword(String(currentPassword), user.passwordHash)) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    await prismaClient.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(String(newPassword)) },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;
