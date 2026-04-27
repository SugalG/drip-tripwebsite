import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import branchesRoutes from "./routes/branches";
import loginRoutes from "./routes/login";
import productRoutes from "./routes/products";
import uploadRoutes from "./routes/upload";
import resolveBranch from "./middleware/resolveBranch";
import { authenticate } from "./middleware/requireAuth";

const app = express();
const uploadsDir = path.resolve(__dirname, "../uploads");
const PORT = Number(process.env.PORT) || 7010;

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOriginSuffixes = (process.env.CORS_ALLOWED_ORIGIN_SUFFIXES || "")
  .split(",")
  .map((suffix) => suffix.trim().toLowerCase())
  .filter(Boolean);

const isAllowedOrigin = (origin: string) => {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const parsedOrigin = new URL(origin);
    const hostname = parsedOrigin.hostname.toLowerCase();

    if (
      allowedOriginSuffixes.some(
        (suffix) => hostname === suffix.replace(/^\./, "") || hostname.endsWith(suffix)
      )
    ) {
      return true;
    }

    if (process.env.NODE_ENV !== "production") {
      return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
    }
  } catch {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir, {
  dotfiles: "deny",
  maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
}));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", resolveBranch, authenticate);
app.use("/api/branches", branchesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
