import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import auditRoutes from "./routes/audit.js";
import figmaRoutes from "./routes/figma.js";
import metadataRoutes from "./routes/metadata.js";
import aiRoutes from "./routes/ai.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(express.json({ limit: "10mb" }));

  app.use("/api/audit", auditRoutes);
  app.use("/api/figma", figmaRoutes);
  app.use("/api/metadata", metadataRoutes);
  app.use("/api/ai", aiRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Mizan API server running on http://localhost:${PORT}`);
  });
}

startServer();
