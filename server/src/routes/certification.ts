import { Router, Request, Response } from "express";
import { Audit } from "../models/Audit.js";
import { Certification } from "../models/Certification.js";

const router = Router();

function generateVerificationId(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MZN-${year}-${code}`;
}

function determineTier(score: number): "silver" | "gold" | "platinum" | null {
  if (score >= 90) return "platinum";
  if (score >= 75) return "gold";
  if (score >= 60) return "silver";
  return null;
}

// POST /api/certification — Issue a new certification
router.post("/", async (req: Request, res: Response) => {
  const { auditId, productName, productUrl, companyName, market } = req.body;

  if (!auditId || !productName || !productUrl || !companyName || !market) {
    return res.status(400).json({ error: "Missing required fields: auditId, productName, productUrl, companyName, market" });
  }

  try {
    const audit = await Audit.findById(auditId);
    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }

    const score = audit.results?.overallScore ?? audit.results?.score ?? 0;
    const tier = determineTier(score);

    if (!tier) {
      return res.status(400).json({
        error: "Score does not meet minimum certification threshold",
        score,
        minimumRequired: 60,
      });
    }

    let verificationId = generateVerificationId();
    while (await Certification.findOne({ verificationId })) {
      verificationId = generateVerificationId();
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

    const certification = await Certification.create({
      auditId,
      productName,
      productUrl,
      companyName,
      tier,
      score,
      issuedAt,
      expiresAt,
      verificationId,
      status: "active",
      market,
    });

    res.status(201).json(certification);
  } catch (error: any) {
    console.error("Certification error:", error);
    res.status(500).json({ error: "Failed to issue certification: " + error.message });
  }
});

// GET /api/certification/verify/:verificationId — Public verification
router.get("/verify/:verificationId", async (req: Request, res: Response) => {
  try {
    const certification = await Certification.findOne({
      verificationId: req.params.verificationId,
    });

    if (!certification) {
      return res.status(404).json({ error: "Certification not found" });
    }

    if (certification.status === "revoked") {
      return res.status(404).json({ error: "Certification has been revoked" });
    }

    if (certification.status === "expired" || certification.expiresAt < new Date()) {
      if (certification.status !== "expired") {
        certification.status = "expired";
        await certification.save();
      }
      return res.status(404).json({ error: "Certification has expired" });
    }

    res.json({
      verificationId: certification.verificationId,
      productName: certification.productName,
      productUrl: certification.productUrl,
      companyName: certification.companyName,
      tier: certification.tier,
      score: certification.score,
      issuedAt: certification.issuedAt,
      expiresAt: certification.expiresAt,
      status: certification.status,
      market: certification.market,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Verification failed: " + error.message });
  }
});

// GET /api/certification/registry — Public registry of active certifications
router.get("/registry", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: "active", expiresAt: { $gt: new Date() } };

    if (req.query.tier) {
      filter.tier = req.query.tier;
    }
    if (req.query.market) {
      filter.market = req.query.market;
    }
    if (req.query.company) {
      filter.companyName = { $regex: req.query.company, $options: "i" };
    }

    const [certifications, total] = await Promise.all([
      Certification.find(filter)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Certification.countDocuments(filter),
    ]);

    res.json({
      certifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch registry: " + error.message });
  }
});

// POST /api/certification/:id/revoke — Revoke a certification
router.post("/:id/revoke", async (req: Request, res: Response) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ error: "Certification not found" });
    }

    if (certification.status === "revoked") {
      return res.status(400).json({ error: "Certification is already revoked" });
    }

    certification.status = "revoked";
    await certification.save();

    res.json({ message: "Certification revoked", certification });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to revoke certification: " + error.message });
  }
});

export default router;
