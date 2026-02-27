import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ authenticated: false });

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return res.json({
      authenticated: true,
      user: { username: decoded.username, role: decoded.role },
    });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.json({ message: "Logged out" });
});

export default router;