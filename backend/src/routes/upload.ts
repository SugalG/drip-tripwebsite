import crypto from "crypto";
import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import multer from "multer";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads");

const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

const safeSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "branch";

const getBranchFolder = (req: Request) => safeSegment(req.branch?.id || req.branch?.slug || "branch");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const branchKey = getBranchFolder(req);
    const destination = path.join(UPLOAD_ROOT, branchKey);
    ensureDir(destination);
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images are supported"));
    }

    return cb(null, true);
  },
});

const sendUploadError = (res: Response, error: unknown) => {
  console.error("[upload.images] Product image upload failed", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Each image must be 5MB or smaller" });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Upload up to 3 product images at a time" });
    }
  }

  if (
    error instanceof Error &&
    error.message === "Only JPEG, PNG, and WebP images are supported"
  ) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: "Upload failed" });
};

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  upload.array("images", 3)(req, res, (uploadError) => {
    if (uploadError) {
      return sendUploadError(res, uploadError);
    }

    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const branchKey = getBranchFolder(req);
    const imageUrls = files.map((file) => `/uploads/${branchKey}/${file.filename}`);

    return res.json({ imageUrls });
  });
});

export default router;
