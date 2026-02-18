import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * GET all products
 */
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * CREATE product
 */
router.post("/", async (req, res) => {
  try {
    const { name, price, category, description, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: { name, price, category, description, imageUrl },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * UPDATE product
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, imageUrl } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id }, // UUID string, no Number() conversion
      data: { name, price, category, description, imageUrl },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE product
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }, // UUID string
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
