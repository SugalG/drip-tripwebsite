import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import requireAuth, { requireBranchAccess, requireRole } from "../middleware/requireAuth";

const router = Router();

const normalizeMapEmbedUrl = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) {
    return iframeSrcMatch[1];
  }

  return trimmed;
};

router.get("/current", (req, res) => {
  if (!req.branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  return res.json({
    id: req.branch.id,
    name: req.branch.name,
    slug: req.branch.slug,
    hostname: req.branch.hostname,
    address: req.branch.address,
    phone: req.branch.phone,
    email: req.branch.email,
    whatsappNumber: req.branch.whatsappNumber,
    mapEmbedUrl: req.branch.mapEmbedUrl,
    storeHours: req.branch.storeHours,
    settings: req.branch.settings,
  });
});

router.put(
  "/current",
  requireAuth,
  requireRole("BRANCH_ADMIN"),
  requireBranchAccess,
  async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;

    if (!req.branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const { name, address, phone, email, whatsappNumber, mapEmbedUrl, storeHours } = req.body;

    const updatedBranch = await prismaClient.branch.update({
      where: { id: req.branch.id },
      data: {
        name: typeof name === "string" ? name.trim() : undefined,
        address: typeof address === "string" ? address.trim() || null : undefined,
        phone: typeof phone === "string" ? phone.trim() || null : undefined,
        email: typeof email === "string" ? email.trim() || null : undefined,
        whatsappNumber:
          typeof whatsappNumber === "string" ? whatsappNumber.trim() || null : undefined,
        mapEmbedUrl: normalizeMapEmbedUrl(mapEmbedUrl),
        storeHours: typeof storeHours === "string" ? storeHours.trim() || null : undefined,
      },
    });

    return res.json({
      id: updatedBranch.id,
      name: updatedBranch.name,
      slug: updatedBranch.slug,
      hostname: updatedBranch.hostname,
      address: updatedBranch.address,
      phone: updatedBranch.phone,
      email: updatedBranch.email,
      whatsappNumber: updatedBranch.whatsappNumber,
      mapEmbedUrl: updatedBranch.mapEmbedUrl,
      storeHours: updatedBranch.storeHours,
      settings: updatedBranch.settings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update branch profile" });
  }
  }
);

export default router;
