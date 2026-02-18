import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Extend Express Request to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// POST /api/upload
router.post("/", upload.single("image"), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to base64
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "vape-store",
      // Optional: transformations
      format: "jpg",
      quality: "auto",
    });

    return res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
