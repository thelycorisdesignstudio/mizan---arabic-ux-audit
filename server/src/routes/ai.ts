import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

function getAzureConfig() {
  return {
    endpoint: (process.env.AZURE_OPENAI_ENDPOINT || "https://tarjama-oai.openai.azure.com").replace(/\/$/, ""),
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
  };
}

async function chatCompletions(messages: any[], maxTokens: number) {
  const cfg = getAzureConfig();
  if (!cfg.apiKey) throw new Error("AZURE_OPENAI_API_KEY is not configured");
  const url = `${cfg.endpoint}/openai/deployments/${cfg.deployment}/chat/completions?api-version=${cfg.apiVersion}`;
  const { data } = await axios.post(
    url,
    { messages, max_tokens: maxTokens },
    { headers: { "api-key": cfg.apiKey, "Content-Type": "application/json" }, timeout: 60000 }
  );
  return data?.choices?.[0]?.message?.content || "";
}

const SYSTEM_PROMPT = `You are Mizan AI, a world-class Arabic UX Expert and Consultant.
Your goal is to help users optimize their digital products for the Arabic-speaking world.

Key areas of expertise:
1. RTL Mirroring: Logical properties, icon directionality, layout symmetry.
2. Linguistic Intelligence: Register consistency (MSA vs Dialect), cultural nuances.
3. Accessibility: Arabic ARIA labels, focus management in RTL.
4. Readability: Arabic typography, line-height (min 1.7), font fallbacks.
5. Search Normalization: Hamza, Ta Marbuta, Alif Maqsura handling.
6. SEO/AEO: Regional hreflang, semantic markup for AI answer engines.
7. GEO Intelligence: Local trust signals (TDRA/SAMA), regional currencies.

Always provide detailed, actionable, and culturally sensitive advice. Use a professional and helpful tone.
If asked about Mizan OS, explain that it is an automated Arabic UX Audit platform that covers all these areas.`;

const VISION_PROMPT = `Analyze this screenshot for Arabic UX issues.
If it's a mobile app, pay attention to bottom navigation, touch targets, and RTL mirroring.
Evaluate these 8 checkpoints:
1. RTL Patterns (mirroring, alignment, icons, CSS logical properties)
2. Content Governance (formal/informal register consistency, mixed registers)
3. Accessibility (visual cues, contrast, touch targets, ARIA labels)
4. Readability (font choice, line height >= 1.7, script clarity, font fallbacks)
5. Search Behaviour (hamza/ta-marbuta/diacritics normalization)
6. Approval Workflow (localization signals, cultural relevance)
7. SEO & AEO (hreflang, metadata, Answer Engine Optimization for Arabic)
8. GEO Intelligence (Geographic trust signals, local badges, regional nuances)

Return ONLY a valid JSON object with this exact structure:
{
  "scores": { "rtl": <number 0-100>, "governance": <number>, "a11y": <number>, "readability": <number>, "search": <number>, "workflow": <number>, "seo": <number>, "geo": <number> },
  "overallScore": <number 0-100>,
  "issues": {
    "rtl": [{"type": "fail|warn|pass", "text": "description"}],
    "governance": [{"type": "fail|warn|pass", "text": "description"}],
    "a11y": [{"type": "fail|warn|pass", "text": "description"}],
    "readability": [{"type": "fail|warn|pass", "text": "description"}],
    "search": [{"type": "fail|warn|pass", "text": "description"}],
    "workflow": [{"type": "fail|warn|pass", "text": "description"}],
    "seo": [{"type": "fail|warn|pass", "text": "description"}],
    "geo": [{"type": "fail|warn|pass", "text": "description"}]
  },
  "recommendations": [{"priority": "critical|high|medium", "title": "short title", "body": "actionable description"}]
}

Provide specific, actionable findings for each checkpoint. Include at least 6 recommendations.`;

router.post("/chat", async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.text });
        } else if (msg.role === "ai") {
          messages.push({ role: "assistant", content: msg.text });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const text = await chatCompletions(messages, 2048);

    res.json({ text: text || "I could not process that request. Please try again." });
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to process message: " + error.message });
  }
});

router.post("/vision-audit", async (req: Request, res: Response) => {
  const { image, mimeType, filename } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image data is required" });
  }

  try {
    const text = await chatCompletions(
      [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/png"};base64,${image}`,
              },
            },
            { type: "text", text: VISION_PROMPT },
          ],
        },
      ],
      4096
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const data = JSON.parse(jsonMatch[0]);
    res.json(data);
  } catch (error: any) {
    console.error("Vision audit error:", error);
    res.status(500).json({ error: "Vision analysis failed: " + error.message });
  }
});

export default router;
