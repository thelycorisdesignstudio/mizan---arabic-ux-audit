import { Router, Request, Response } from "express";
import axios from "axios";
import { Audit } from "../models/Audit.js";
import { runAudit } from "../services/auditEngine.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { url, html } = req.body;

  try {
    let content = html;
    let targetUrl = url || "Pasted HTML";

    if (url && !html) {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      content = response.data;
    }

    if (!content) {
      return res.status(400).json({ error: "No content to audit" });
    }

    const results = runAudit(content, targetUrl);
    const audit = await Audit.create({ url: targetUrl, results });

    res.json({ id: audit._id, ...results });
  } catch (error: any) {
    console.error("Audit error:", error);
    res.status(500).json({ error: "Failed to perform audit: " + error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }
    res.json({ id: audit._id, ...audit.results });
  } catch (error: any) {
    res.status(404).json({ error: "Audit not found" });
  }
});

export default router;
