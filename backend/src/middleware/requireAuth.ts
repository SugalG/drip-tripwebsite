import { NextFunction, Request, Response } from "express";
import { UserRole, verifyAuthToken } from "../lib/auth";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return next();
    }

    req.user = verifyAuthToken(token);
    return next();
  } catch {
    req.user = undefined;
    return next();
  }
}

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

export function requireBranchAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.branch) {
    return res.status(400).json({ message: "Branch context missing" });
  }

  if (req.user.role === "SUPERADMIN") {
    return next();
  }

  if (!req.user.branchId || req.user.branchId !== req.branch.id) {
    return res.status(403).json({ message: "Forbidden for this branch" });
  }

  return next();
}
