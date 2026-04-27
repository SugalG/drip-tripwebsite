import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import { hashPassword } from "../lib/auth";
import requireAuth, { requireRole } from "../middleware/requireAuth";

const router = Router();

const parseHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase();
  if (
    normalized.includes("://") ||
    normalized.includes("/") ||
    normalized.includes(":") ||
    /\s/.test(normalized)
  ) {
    return null;
  }

  const parts = normalized.split(".").filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  if (parts.length === 2) {
    return {
      hostname: normalized,
      domain: normalized,
      subdomain: null,
    };
  }

  return {
    hostname: normalized,
    domain: parts.slice(1).join("."),
    subdomain: parts[0],
  };
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

router.use(requireAuth, requireRole("SUPERADMIN"));

router.get("/branches", async (_req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;

    const branches = await prismaClient.branch.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        users: {
          where: { role: "BRANCH_ADMIN", isActive: true },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            lastLoginAt: true,
            isActive: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    return res.json(branches);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch branches" });
  }
});

router.post("/branches", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const {
      branchName,
      branchSlug,
      hostname,
      adminName,
      adminUsername,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!branchName || !branchSlug || !hostname || !adminUsername || !adminPassword) {
      return res.status(400).json({ error: "Missing required branch or admin fields" });
    }

    const parsedHost = parseHostname(hostname);
    if (!parsedHost) {
      return res.status(400).json({ error: "Hostname must be a valid domain or subdomain" });
    }

    const existingBranch = await prismaClient.branch.findFirst({
      where: {
        OR: [{ slug: normalizeSlug(branchSlug) }, { hostname: parsedHost.hostname }],
      },
      select: { id: true },
    });

    if (existingBranch) {
      return res.status(409).json({ error: "Branch slug or hostname already exists" });
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { username: adminUsername.trim() },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Admin username already exists" });
    }

    const passwordHash = hashPassword(adminPassword);

    const created = await prismaClient.$transaction(async (tx: any) => {
      const branch = await tx.branch.create({
        data: {
          name: branchName.trim(),
          slug: normalizeSlug(branchSlug),
          hostname: parsedHost.hostname,
          domain: parsedHost.domain,
          subdomain: parsedHost.subdomain,
        },
      });

      const admin = await tx.user.create({
        data: {
          name: typeof adminName === "string" ? adminName.trim() || null : null,
          username: adminUsername.trim(),
          email: typeof adminEmail === "string" ? adminEmail.trim() || null : null,
          passwordHash,
          role: "BRANCH_ADMIN",
          branchId: branch.id,
        },
      });

      return { branch, admin };
    });

    return res.status(201).json({
      branch: created.branch,
      admin: {
        id: created.admin.id,
        username: created.admin.username,
        email: created.admin.email,
        name: created.admin.name,
      },
    });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Branch or admin already exists" });
    }

    return res.status(500).json({ error: "Failed to create branch and branch admin" });
  }
});

router.put("/branches/:branchId", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const branchId = req.params.branchId;
    const { branchName, branchSlug, hostname } = req.body;

    if (!branchId) {
      return res.status(400).json({ error: "Branch id is required" });
    }

    if (!branchName || !branchSlug || !hostname) {
      return res.status(400).json({ error: "Branch name, slug, and hostname are required" });
    }

    const parsedHost = parseHostname(String(hostname));
    const slug = normalizeSlug(String(branchSlug));

    if (!parsedHost || !slug) {
      return res.status(400).json({
        error: "Use a plain hostname like dang.dripandtrip.local without protocol, port, or slash",
      });
    }

    const branch = await prismaClient.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const existingBranch = await prismaClient.branch.findFirst({
      where: {
        id: { not: branchId },
        OR: [{ slug }, { hostname: parsedHost.hostname }],
      },
      select: { id: true },
    });

    if (existingBranch) {
      return res.status(409).json({ error: "Branch slug or hostname already exists" });
    }

    const updatedBranch = await prismaClient.branch.update({
      where: { id: branchId },
      data: {
        name: String(branchName).trim(),
        slug,
        hostname: parsedHost.hostname,
        domain: parsedHost.domain,
        subdomain: parsedHost.subdomain,
      },
    });

    return res.json({ branch: updatedBranch });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Branch slug or hostname already exists" });
    }

    return res.status(500).json({ error: "Failed to update branch" });
  }
});

router.patch("/branches/:branchId/status", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const branchId = req.params.branchId;
    const { isActive } = req.body;

    if (!branchId || typeof isActive !== "boolean") {
      return res.status(400).json({ error: "Branch id and active status are required" });
    }

    const branch = await prismaClient.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const updatedBranch = await prismaClient.branch.update({
      where: { id: branchId },
      data: { isActive },
    });

    return res.json({ branch: updatedBranch });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update branch status" });
  }
});

router.post("/branches/:branchId/admins", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const branchId = req.params.branchId;
    const { adminName, adminUsername, adminEmail, adminPassword } = req.body;

    if (!branchId || !adminUsername || !adminPassword) {
      return res.status(400).json({ error: "Missing required admin fields" });
    }

    const branch = await prismaClient.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const existingBranchAdmin = await prismaClient.user.findFirst({
      where: {
        branchId: branch.id,
        role: "BRANCH_ADMIN",
        isActive: true,
      },
      select: { id: true },
    });

    if (existingBranchAdmin) {
      return res.status(409).json({ error: "This branch already has an assigned admin" });
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { username: adminUsername.trim() },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Admin username already exists" });
    }

    const admin = await prismaClient.user.create({
      data: {
        name: typeof adminName === "string" ? adminName.trim() || null : null,
        username: adminUsername.trim(),
        email: typeof adminEmail === "string" ? adminEmail.trim() || null : null,
        passwordHash: hashPassword(adminPassword),
        role: "BRANCH_ADMIN",
        branchId: branch.id,
      },
      select: { id: true, username: true, email: true, name: true, branchId: true },
    });

    return res.status(201).json({ admin });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Admin already exists" });
    }

    return res.status(500).json({ error: "Failed to create branch admin" });
  }
});

router.post("/users/:userId/reset-password", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const userId = req.params.userId;
    const { newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: "User id and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "BRANCH_ADMIN") {
      return res.status(404).json({ error: "Branch admin not found" });
    }

    await prismaClient.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(String(newPassword)) },
    });

    return res.json({ message: "Branch admin password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reset branch admin password" });
  }
});

export default router;
