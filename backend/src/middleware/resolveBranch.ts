import { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";

const normalizeHostname = (host?: string | string[]) => {
  const value = Array.isArray(host) ? host[0] : host;

  if (!value) return null;

  return value.split(",")[0].trim().split(":")[0].toLowerCase();
};

export const getRequestHostname = (req: Request) =>
  (req.app.get("trust proxy") ? normalizeHostname(req.headers["x-forwarded-host"]) : null) ||
  normalizeHostname(req.headers.host) ||
  normalizeHostname(req.hostname);

export default async function resolveBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const prismaClient = prisma as any;
    const hostname = getRequestHostname(req);

    if (!hostname) {
      return res.status(400).json({ error: "Unable to determine request hostname" });
    }

    const branch = await prismaClient.branch.findFirst({
      where: {
        hostname,
        isActive: true,
      },
    });

    if (!branch) {
      return res.status(404).json({ error: `No active branch configured for ${hostname}` });
    }

    req.branch = branch;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to resolve branch" });
  }
}
