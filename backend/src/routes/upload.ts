import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.array("images", 3), async (req: Request, res: Response) => {
  try {
    // ✅ Narrow req.files safely (Express type allows multiple shapes)
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const base64 = file.buffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "vape-store",
          format: "jpg",
          quality: "auto",
        });

        return result.secure_url;
      })
    );

    return res.json({ imageUrls });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;