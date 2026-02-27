import { Router } from "express";
import prisma from "../lib/prisma";
import requireAdmin from "../middleware/requireAdmin";

const router = Router();

/**
 * Express v5 typings can widen params to string | string[].
 * Prisma expects a string UUID.
 */
const getIdParam = (req: any): string | null => {
  const raw = req.params?.id;

  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
};

/**
 * GET all products (include flavors) - PUBLIC
 */
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        flavors: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET product by id (include flavors) - PUBLIC
 */
router.get("/:id", async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        flavors: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * CREATE product - PROTECTED ✅
 * body example:
 * {
 *   "name": "Vape X",
 *   "price": 1200,
 *   "category": "E-Liquids",
 *   "description": "...",
 *   "imageUrl": ["url1","url2","url3"],
 *   "coverIndex": 0,
 *   "flavors": ["Mint","Grape"]
 * }
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, price, category, description, imageUrl, flavors, coverIndex } = req.body;

    // imageUrl should be string[]
    const imageArray: string[] = Array.isArray(imageUrl)
      ? imageUrl
      : imageUrl
      ? [imageUrl]
      : [];

    // flavors should be string[]
    const flavorArray: string[] = Array.isArray(flavors) ? flavors : [];

    // coverIndex validation
    let cover = Number(coverIndex);
    if (!Number.isFinite(cover)) cover = 0;
    if (cover < 0) cover = 0;
    if (cover > imageArray.length - 1) cover = 0;

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        category,
        description,
        imageUrl: imageArray,
        coverIndex: cover,
        flavors: {
          create: flavorArray.map((f) => ({ name: f })),
        },
      },
      include: {
        flavors: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Duplicate flavor for this product" });
    }

    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * UPDATE product - PROTECTED ✅
 * (replace all flavors)
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    const { name, price, category, description, imageUrl, flavors, coverIndex } = req.body;

    const imageArray: string[] = Array.isArray(imageUrl)
      ? imageUrl
      : imageUrl
      ? [imageUrl]
      : [];

    const flavorArray: string[] = Array.isArray(flavors) ? flavors : [];

    // coverIndex validation
    let cover = Number(coverIndex);
    if (!Number.isFinite(cover)) cover = 0;
    if (cover < 0) cover = 0;
    if (cover > imageArray.length - 1) cover = 0;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        category,
        description,
        imageUrl: imageArray,
        coverIndex: cover,
        flavors: {
          deleteMany: {}, // delete all existing flavors for this product
          create: flavorArray.map((f) => ({ name: f })),
        },
      },
      include: {
        flavors: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });

    res.json(updatedProduct);
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Duplicate flavor for this product" });
    }

    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE product - PROTECTED ✅
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = getIdParam(req);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    await prisma.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;