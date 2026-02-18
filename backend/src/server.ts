import express from "express";
import cors from "cors";
import productRoutes from "./routes/products";
import uploadRoutes from "./routes/upload";
import loginRoutes from "./routes/login";
import cookieParser from "cookie-parser";


const app = express();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/login",loginRoutes)


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
