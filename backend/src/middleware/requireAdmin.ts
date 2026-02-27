import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

type JwtPayload = {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
};

export default function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // optional: attach user to request
    (req as any).user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}