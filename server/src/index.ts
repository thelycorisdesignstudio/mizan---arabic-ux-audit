import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import auditRoutes from "./routes/audit.js";
import figmaRoutes from "./routes/figma.js";
import metadataRoutes from "./routes/metadata.js";
import aiRoutes from "./routes/ai.js";
import certificationRoutes from "./routes/certification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  app.use("/api/certification", certificationRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Mizan server running on http://localhost:${PORT}`);
  });
}

startServer();
