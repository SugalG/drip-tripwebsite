import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import requireAdmin from "../middleware/requireAdmin";

const router = Router();

const productOptionInclude = {
  flavors: {
    select: { id: true, name: true },
    orderBy: { name: "asc" as const },
  },
  ohms: {
    select: { id: true, value: true },
    orderBy: { value: "asc" as const },
  },
  colors: {
    select: { id: true, name: true },
    orderBy: { name: "asc" as const },
  },
};

const getIdParam = (req: Request): string | null => {
  const raw = req.params?.id;

  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
};

const normalizeStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

const resolveTargetBranchId = (req: Request) => {
  if (!req.branch || !req.user) {
    return null;
  }

  if (req.user.role === "SUPERADMIN") {
    const requestedBranchId =
      typeof req.body?.branchId === "string" && req.body.branchId.trim().length > 0
        ? req.body.branchId.trim()
        : req.branch.id;

    return requestedBranchId;
  }

  return req.user.branchId;
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;

    if (!req.branch) {
      return res.status(400).json({ error: "Branch context missing" });
    }

    const products = await prismaClient.product.findMany({
      where: { branchId: req.branch.id },
      orderBy: { createdAt: "desc" },
      include: productOptionInclude,
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });
    if (!req.branch) return res.status(400).json({ error: "Branch context missing" });

    const product = await prismaClient.product.findFirst({
      where: { id, branchId: req.branch.id },
      include: productOptionInclude,
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const branchId = resolveTargetBranchId(req);

    if (!branchId) {
      return res.status(400).json({ error: "Branch context missing" });
    }

    const { name, price, category, description, imageUrl, flavors, ohms, colors, coverIndex } =
      req.body;

    const imageArray = normalizeStringArray(imageUrl);
    const flavorArray = normalizeStringArray(flavors);
    const ohmArray = normalizeStringArray(ohms);
    const colorArray = normalizeStringArray(colors);

    let cover = Number(coverIndex);
    if (!Number.isFinite(cover)) cover = 0;
    if (cover < 0) cover = 0;
    if (cover > imageArray.length - 1) cover = 0;

    const product = await prismaClient.product.create({
      data: {
        branchId,
        name,
        price: Number(price),
        category,
        description,
        imageUrl: imageArray,
        coverIndex: cover,
        flavors: {
          create: flavorArray.map((f) => ({ name: f })),
        },
        ohms: {
          create: ohmArray.map((o) => ({ value: o })),
        },
        colors: {
          create: colorArray.map((c) => ({ name: c })),
        },
      },
      include: productOptionInclude,
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Duplicate product option for this product" });
    }

    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    const existingProduct = await prismaClient.product.findUnique({
      where: { id },
      select: { id: true, branchId: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (req.user?.role !== "SUPERADMIN" && existingProduct.branchId !== req.user?.branchId) {
      return res.status(403).json({ error: "Forbidden for this branch" });
    }

    const { name, price, category, description, imageUrl, flavors, ohms, colors, coverIndex } =
      req.body;

    const imageArray = normalizeStringArray(imageUrl);
    const flavorArray = normalizeStringArray(flavors);
    const ohmArray = normalizeStringArray(ohms);
    const colorArray = normalizeStringArray(colors);

    let cover = Number(coverIndex);
    if (!Number.isFinite(cover)) cover = 0;
    if (cover < 0) cover = 0;
    if (cover > imageArray.length - 1) cover = 0;

    const updatedProduct = await prismaClient.product.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        category,
        description,
        imageUrl: imageArray,
        coverIndex: cover,
        flavors: {
          deleteMany: {},
          create: flavorArray.map((f) => ({ name: f })),
        },
        ohms: {
          deleteMany: {},
          create: ohmArray.map((o) => ({ value: o })),
        },
        colors: {
          deleteMany: {},
          create: colorArray.map((c) => ({ name: c })),
        },
      },
      include: productOptionInclude,
    });

    res.json(updatedProduct);
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Duplicate product option for this product" });
    }

    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const prismaClient = prisma as any;
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    const existingProduct = await prismaClient.product.findUnique({
      where: { id },
      select: { id: true, branchId: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (req.user?.role !== "SUPERADMIN" && existingProduct.branchId !== req.user?.branchId) {
      return res.status(403).json({ error: "Forbidden for this branch" });
    }

    await prismaClient.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
