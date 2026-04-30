import { Router, Request, Response } from "express";
import axios from "axios";
import { Audit } from "../models/Audit.js";
import { runFigmaAudit } from "../services/auditEngine.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { figmaUrl } = req.body;
  const token = process.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "FIGMA_ACCESS_TOKEN not configured" });
  }

  try {
    const match = figmaUrl.match(/file\/([^\/]+)/);
    if (!match) throw new Error("Invalid Figma URL");
    const fileKey = match[1];

    const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { "X-Figma-Token": token },
    });

    const figmaData = response.data;
    const results = runFigmaAudit(figmaData, figmaUrl);

    const audit = await Audit.create({ url: figmaUrl, results });

    res.json({ id: audit._id, ...results });
  } catch (error: any) {
    console.error("Figma audit error:", error);
    res.status(500).json({ error: "Figma analysis failed: " + error.message });
  }
});

export default router;
