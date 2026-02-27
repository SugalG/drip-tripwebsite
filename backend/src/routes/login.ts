import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Use env in production

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Hardcoded admin credentials
    if (username === "admin" && password === "dnt12345") {
      // Create JWT payload
      const payload = { username, role: "admin" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      // Set cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 60 * 60 * 1000,
      });

      return res.json({ message: "Login successful" });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
