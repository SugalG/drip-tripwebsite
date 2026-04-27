import crypto from "crypto";
import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import multer from "multer";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }

    return cb(null, true);
  },
});

router.post("/", requireAdmin, upload.array("images", 3), async (req: Request, res: Response) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const branchKey = getBranchFolder(req);
    const imageUrls = files.map((file) => `/uploads/${branchKey}/${file.filename}`);

    return res.json({ imageUrls });
  } catch (error) {
    console.error("Local upload error:", error);

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Each image must be 5MB or smaller" });
    }

    if (error instanceof Error && error.message === "Only image uploads are allowed") {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
