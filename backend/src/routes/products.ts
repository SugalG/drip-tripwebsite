import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * GET all products (include flavors)
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
 * GET product by id (include flavors)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
 * CREATE product
 */
router.post("/", async (req, res) => {
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

    // ✅ coverIndex validation
    let cover = Number(coverIndex);
    if (!Number.isFinite(cover)) cover = 0;
    if (cover < 0) cover = 0;
    if (cover > imageArray.length - 1) cover = 0; // reset if invalid

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        category,
        description,
        imageUrl: imageArray,
        coverIndex: cover, // ✅ added
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
 * UPDATE product (replace all flavors)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, imageUrl, flavors, coverIndex } = req.body;

    const imageArray: string[] = Array.isArray(imageUrl)
      ? imageUrl
      : imageUrl
      ? [imageUrl]
      : [];

    const flavorArray: string[] = Array.isArray(flavors) ? flavors : [];

    // ✅ coverIndex validation
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
        coverIndex: cover, // ✅ added
        flavors: {
          deleteMany: {},
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
 * DELETE product
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;