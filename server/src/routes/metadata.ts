import { Router, Request, Response } from "express";
import { Audit } from "../models/Audit.js";
import { runMetadataAudit } from "../services/auditEngine.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { filename, content } = req.body;
  try {
    const results = runMetadataAudit(content, filename);
    const audit = await Audit.create({ url: `Metadata: ${filename}`, results });
    res.json({ id: audit._id, ...results });
  } catch (error: any) {
    res.status(500).json({ error: "Metadata analysis failed: " + error.message });
  }
});

export default router;
