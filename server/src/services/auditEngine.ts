import * as cheerio from "cheerio";

function getSelector(el: any, $: any): string {
  if (!el || !el.name) return "";
  const tag = el.name;
  const id = $(el).attr("id");
  const classes = $(el).attr("class");
  let selector = tag;
  if (id) selector += `#${id}`;
  if (classes) {
    const classList = classes.trim().split(/\s+/).filter(Boolean);
    if (classList.length > 0) {
      selector += `.${classList.join(".")}`;
    }
  }
  return selector;
}

export function runAudit(html: string, url: string) {
  const $ = cheerio.load(html);
  const issues: Record<string, any[]> = {
    rtl: [],
    governance: [],
    a11y: [],
    readability: [],
    search: [],
    workflow: [],
    seo: [],
    geo: [],
  };

  const scores: Record<string, number> = {
    rtl: 100,
    governance: 100,
    a11y: 100,
    readability: 100,
    search: 100,
    workflow: 100,
    seo: 100,
    geo: 100,
  };

  const htmlDir = $("html").attr("dir");
  const bodyDir = $("body").attr("dir");
  const isRTL = htmlDir === "rtl" || bodyDir === "rtl";
  const lang = $("html").attr("lang");

  if (!isRTL) {
    issues.rtl.push({
      type: "fail",
      text: 'Root element or body is missing dir="rtl" attribute.',
      selector: "html, body",
      snippet: `<html dir="${htmlDir || ""}">...`,
    });
    scores.rtl -= 40;
  } else {
    issues.rtl.push({ type: "pass", text: 'Root element correctly specifies dir="rtl".' });
  }

  if (!lang?.startsWith("ar")) {
    issues.rtl.push({
      type: "warn",
      text: 'Page language is not explicitly set to Arabic (lang="ar").',
      selector: "html",
      snippet: `<html lang="${lang || ""}">`,
    });
    scores.rtl -= 10;
  }

  const directionalImages = $("div[dir='rtl'] img, body[dir='rtl'] img");
  if (directionalImages.length > 0) {
    const el = directionalImages.first();
    issues.rtl.push({
      type: "fail",
      text: "Images within RTL containers are not mirrored — directional visual content is reversed.",
      selector: getSelector(el[0], $),
      snippet: $.html(el).substring(0, 100) + "...",
    });
    scores.rtl -= 15;
  }

  let hardcodedStyles = 0;
  let firstHardcoded: any = null;
  $(
    "[style*='left'], [style*='right'], [style*='margin-left'], [style*='padding-left'], [style*='margin-right'], [style*='padding-right']"
  ).each((_i: number, el: any) => {
    const style = $(el).attr("style");
    if (style && !style.includes("rtl")) {
      hardcodedStyles++;
      if (!firstHardcoded) firstHardcoded = el;
    }
  });

  if (hardcodedStyles > 0) {
    issues.rtl.push({
      type: hardcodedStyles > 5 ? "fail" : "warn",
      text: `Detected ${hardcodedStyles} elements with hardcoded directional CSS (margin-left, padding-right, etc.). Use logical properties like margin-inline-start instead.`,
      selector: getSelector(firstHardcoded, $),
      snippet: $.html(firstHardcoded).substring(0, 100) + "...",
    });
    scores.rtl -= hardcodedStyles > 5 ? 20 : 10;
  }

  const arabicTextNodes: { text: string; el: any }[] = [];
  $("*")
    .contents()
    .each((_i: number, el: any) => {
      if (el.type === "text") {
        const text = $(el).text().trim();
        if (/[؀-ۿ]/.test(text)) {
          arabicTextNodes.push({ text, el: el.parent });
        }
      }
    });

  const formalMarkers = ["سوف", "لقد", "إن", "هذا"];
  const informalMarkers = ["عشان", "إيه", "شو", "بدي"];

  let formalCount = 0;
  let informalCount = 0;
  let mixedEl: any = null;

  arabicTextNodes.forEach((node) => {
    let hasFormal = false;
    let hasInformal = false;
    formalMarkers.forEach((m) => {
      if (node.text.includes(m)) {
        formalCount++;
        hasFormal = true;
      }
    });
    informalMarkers.forEach((m) => {
      if (node.text.includes(m)) {
        informalCount++;
        hasInformal = true;
      }
    });
    if (hasFormal && hasInformal) mixedEl = node.el;
  });

  if (formalCount > 0 && informalCount > 0) {
    issues.governance.push({
      type: "fail",
      text: 'Mixed formal and informal Arabic registers detected. Examples: "سوف" (formal) vs "عشان" (informal).',
      selector: mixedEl ? getSelector(mixedEl, $) : undefined,
      snippet: mixedEl ? $.html(mixedEl).substring(0, 100) + "..." : undefined,
    });
    scores.governance -= 30;
  } else if (arabicTextNodes.length > 0) {
    issues.governance.push({ type: "pass", text: "Consistent Arabic register maintained across text nodes." });
  } else {
    issues.governance.push({ type: "warn", text: "No significant Arabic text found to analyze register." });
    scores.governance -= 20;
  }

  const ariaLabels = $("[aria-label]");
  let nonArabicAriaEl: any = null;
  let nonArabicAriaCount = 0;
  ariaLabels.each((_i: number, el: any) => {
    const label = $(el).attr("aria-label");
    if (label && !/[؀-ۿ]/.test(label)) {
      nonArabicAriaCount++;
      if (!nonArabicAriaEl) nonArabicAriaEl = el;
    }
  });

  if (nonArabicAriaCount > 0) {
    issues.a11y.push({
      type: "fail",
      text: `${nonArabicAriaCount} elements found with English ARIA labels on an Arabic page.`,
      selector: getSelector(nonArabicAriaEl, $),
      snippet: $.html(nonArabicAriaEl).substring(0, 100) + "...",
    });
    scores.a11y -= 30;
  }

  const inputsWithoutLabels = $("input:not([id]), input:not([aria-label])");
  if (inputsWithoutLabels.length > 0) {
    const el = inputsWithoutLabels.first();
    issues.a11y.push({
      type: "warn",
      text: "Multiple input fields are missing explicit Arabic labels or ARIA descriptions.",
      selector: getSelector(el[0], $),
      snippet: $.html(el).substring(0, 100) + "...",
    });
    scores.a11y -= 15;
  }

  const interactiveArabic = $("button, a").filter((_i: number, el: any) => {
    const text = $(el).text().trim();
    return /[؀-ۿ]/.test(text) && !$(el).attr("aria-label");
  });

  if (interactiveArabic.length > 0) {
    issues.a11y.push({
      type: "warn",
      text: "Missing aria-label on interactive elements with Arabic text but no explicit labels.",
    });
    scores.a11y -= 10;
  }

  const inlineStyles = $("[style*='font-family']");
  let badFontEl: any = null;
  let badFonts = 0;
  inlineStyles.each((_i: number, el: any) => {
    const style = $(el).attr("style");
    if (
      style &&
      (style.includes("Arial") || style.includes("Helvetica")) &&
      !style.includes("Arabic") &&
      !style.includes("Noto") &&
      !style.includes("Cairo")
    ) {
      badFonts++;
      if (!badFontEl) badFontEl = el;
    }
  });

  if (badFonts > 0) {
    issues.readability.push({
      type: "fail",
      text: `Detected ${badFonts} instances of Latin-primary fonts (Arial, Helvetica) used for Arabic text. This causes Arabic to fall back to generic system fonts which often look disjointed. Use Arabic-optimized fonts like Noto Naskh Arabic.`,
      selector: getSelector(badFontEl, $),
      snippet: $.html(badFontEl).substring(0, 100) + "...",
    });
    scores.readability -= 25;
  }

  let lowLineHeightEl: any = null;
  let lowLineHeight = 0;
  $("[style*='line-height']").each((_i: number, el: any) => {
    const style = $(el).attr("style");
    const match = style?.match(/line-height:\s*([0-9.]+)/);
    if (match && parseFloat(match[1]) < 1.7) {
      lowLineHeight++;
      if (!lowLineHeightEl) lowLineHeightEl = el;
    }
  });

  if (lowLineHeight > 0) {
    issues.readability.push({
      type: "warn",
      text: `Detected ${lowLineHeight} elements with line-height below 1.7. Arabic script requires more vertical space for legibility and to prevent diacritics from overlapping.`,
      selector: getSelector(lowLineHeightEl, $),
      snippet: $.html(lowLineHeightEl).substring(0, 100) + "...",
    });
    scores.readability -= 15;
  }

  const styleTags = $("style");
  let missingArabicInStyle = false;
  styleTags.each((_i: number, el: any) => {
    const css = $(el).text();
    if (
      css.includes("font-family") &&
      !css.includes("Arabic") &&
      !css.includes("Noto") &&
      !css.includes("Cairo") &&
      !css.includes("sans-serif")
    ) {
      missingArabicInStyle = true;
    }
  });
  if (missingArabicInStyle) {
    issues.readability.push({
      type: "warn",
      text: "Detected font-family declarations in <style> tags that do not include Arabic-specific fallbacks. This may cause rendering issues on systems without the primary font.",
      selector: "style",
      snippet: "<style>...</style>",
    });
    scores.readability -= 10;
  }

  const searchInputs = $("input[type='search'], input[name*='search'], input[placeholder*='بحث']");
  if (searchInputs.length === 0) {
    issues.search.push({ type: "warn", text: "No search input detected. Unable to verify Arabic search normalization." });
    scores.search -= 30;
  } else {
    const hasNormalization =
      /normalize|replace|hamza|tashkeel|diacritic|['"ال'][اأإآ]/.test(html) ||
      /normalized|normalization/.test(html.toLowerCase());
    if (!hasNormalization) {
      issues.search.push({
        type: "fail",
        text: "Search normalization issues detected: hamza (أ, إ, ا), ta marbuta (ة vs ه), and diacritics are not handled.",
        selector: getSelector(searchInputs.first()[0], $),
        snippet: $.html(searchInputs.first()).substring(0, 100) + "...",
      });
      scores.search -= 40;
    } else {
      issues.search.push({ type: "pass", text: "Search normalization patterns detected in client-side scripts." });
    }
  }

  const hreflang = $("link[hreflang]");
  const hasArabicHreflang = hreflang.toArray().some((el) => $(el).attr("hreflang")?.startsWith("ar"));

  if (!hasArabicHreflang) {
    issues.workflow.push({
      type: "fail",
      text: "Missing hreflang tags for Arabic variants (ar, ar-AE, etc).",
      selector: "head",
      snippet: '<link rel="alternate" ...>',
    });
    scores.workflow -= 25;
  } else {
    issues.workflow.push({ type: "pass", text: "Arabic hreflang tags correctly implemented." });
  }

  const metaLocale = $("meta[property='og:locale']").attr("content");
  if (!metaLocale?.startsWith("ar")) {
    issues.workflow.push({ type: "warn", text: "OpenGraph locale meta tag is missing or not set to an Arabic locale." });
    scores.workflow -= 10;
  }

  const hreflangTags = $("link[hreflang]");
  const arVariants = hreflangTags.toArray().filter((el) => {
    const hl = $(el).attr("hreflang")?.toLowerCase();
    return hl === "ar" || hl?.startsWith("ar-");
  });

  const expectedVariants = ["ar", "ar-ae", "ar-sa", "ar-eg", "ar-kw", "ar-qa"];
  const foundVariants = arVariants.map((el) => $(el).attr("hreflang")?.toLowerCase());
  const missing = expectedVariants.filter((v) => !foundVariants.includes(v));

  if (arVariants.length === 0) {
    issues.seo.push({
      type: "fail",
      text: "Critical SEO Issue: Missing all Arabic hreflang tags (ar, ar-AE, ar-SA, etc.). Search engines cannot correctly index regional content.",
      selector: "head",
      snippet: '<link rel="alternate" ...>',
    });
    scores.seo -= 40;
  } else if (missing.length > 0) {
    issues.seo.push({
      type: "warn",
      text: `Incomplete Arabic SEO: Found some hreflang tags, but missing key regional variants: ${missing.join(", ")}. This impacts visibility in specific MENA markets.`,
      selector: "head",
      snippet: $.html(arVariants[0]).substring(0, 100) + "...",
    });
    scores.seo -= 15;
  } else {
    issues.seo.push({
      type: "pass",
      text: `Excellent SEO: Comprehensive Arabic hreflang tags detected for all major regional variants (${foundVariants.join(", ")}).`,
    });
  }

  const hasSchema = html.includes("application/ld+json");
  if (!hasSchema) {
    issues.seo.push({
      type: "fail",
      text: "AEO: Missing semantic schema markup (JSON-LD) for Answer Engine Optimization.",
      selector: "head",
      snippet: '<script type="application/ld+json">...</script>',
    });
    scores.seo -= 30;
  }

  const hasLocalTrust = html.includes("badge") || html.includes("trust") || html.includes("certified");
  if (!hasLocalTrust) {
    issues.geo.push({ type: "fail", text: "Missing local trust signals (TDRA, SAMA, or regional trust badges)." });
    scores.geo -= 30;
  } else {
    issues.geo.push({ type: "pass", text: "Local trust signals and badges detected." });
  }

  const currencySymbols = ["AED", "SAR", "QAR", "KWD", "OMR", "BHD"];
  const hasLocalCurrency = currencySymbols.some((c) => html.includes(c));
  if (!hasLocalCurrency) {
    issues.geo.push({ type: "warn", text: "No local GCC currency symbols (AED, SAR, etc.) detected in content." });
    scores.geo -= 15;
  }

  Object.keys(scores).forEach((k) => {
    scores[k] = Math.max(0, Math.min(100, scores[k]));
  });

  const weights: Record<string, number> = {
    rtl: 0.15,
    governance: 0.15,
    a11y: 0.15,
    readability: 0.15,
    search: 0.1,
    workflow: 0.1,
    seo: 0.1,
    geo: 0.1,
  };

  let overallScore = 0;
  Object.keys(weights).forEach((k) => {
    overallScore += scores[k] * weights[k];
  });

  const recommendations = [];
  if (scores.rtl < 80)
    recommendations.push({
      priority: "critical",
      title: "Fix RTL Directionality",
      body: 'Ensure dir="rtl" is set on the html tag and mirror directional icons.',
    });
  if (scores.a11y < 80)
    recommendations.push({
      priority: "critical",
      title: "Localize ARIA Labels",
      body: "Translate all aria-label and aria-description attributes into Arabic.",
    });
  if (scores.search < 80)
    recommendations.push({
      priority: "high",
      title: "Implement Search Normalization",
      body: "Ensure your backend handles hamza and ta-marbuta variations in search queries.",
    });
  if (scores.readability < 80)
    recommendations.push({
      priority: "high",
      title: "Optimize Arabic Typography",
      body: "Use Arabic-specific fonts like Noto Naskh or Cairo and set line-height to 1.7+.",
    });
  if (scores.governance < 80)
    recommendations.push({
      priority: "medium",
      title: "Standardize Content Register",
      body: "Choose either Modern Standard Arabic or a specific dialect and stick to it.",
    });
  if (scores.workflow < 80)
    recommendations.push({
      priority: "medium",
      title: "Add Hreflang Tags",
      body: "Implement hreflang tags to help search engines find your Arabic content.",
    });

  while (recommendations.length < 6) {
    recommendations.push({
      priority: "medium",
      title: "General UX Polish",
      body: "Continue monitoring user feedback to refine the Arabic experience.",
    });
  }

  return {
    url,
    timestamp: new Date().toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    scores,
    overallScore: Math.round(overallScore),
    issues,
    recommendations: recommendations.slice(0, 6),
  };
}

export function runFigmaAudit(data: any, url: string) {
  const issues: Record<string, any[]> = {
    rtl: [],
    governance: [],
    a11y: [],
    readability: [],
    search: [],
    workflow: [],
  };

  const scores: Record<string, number> = { rtl: 100, governance: 100, a11y: 100, readability: 100, search: 100, workflow: 100 };

  let textNodes = 0;
  let arabicText = 0;
  let rtlAutoLayout = 0;
  let ltrAutoLayout = 0;

  const traverse = (node: any) => {
    if (node.layoutMode === "HORIZONTAL") {
      if (node.primaryAxisAlignItems === "MAX") rtlAutoLayout++;
      else ltrAutoLayout++;
    }

    if (node.type === "TEXT") {
      textNodes++;
      const chars = node.characters || "";
      if (/[؀-ۿ]/.test(chars)) arabicText++;

      const fontName = node.style?.fontFamily;
      if (fontName && (fontName.includes("Arial") || fontName.includes("Helvetica"))) {
        issues.readability.push({
          type: "warn",
          text: `Layer "${node.name}" uses Latin-primary font "${fontName}" for Arabic text.`,
        });
        scores.readability -= 5;
      }
    }
    if (node.children) node.children.forEach(traverse);
  };
  traverse(data.document);

  if (arabicText > 0) {
    issues.governance.push({ type: "pass", text: `Detected ${arabicText} Arabic text layers.` });
  } else {
    issues.governance.push({ type: "fail", text: "No Arabic text layers found in design." });
    scores.governance -= 60;
  }

  if (ltrAutoLayout > rtlAutoLayout && arabicText > 0) {
    issues.rtl.push({ type: "fail", text: "Design uses LTR Auto-layout for Arabic content. Mirroring is required." });
    scores.rtl -= 40;
  } else if (rtlAutoLayout > 0) {
    issues.rtl.push({ type: "pass", text: "RTL Auto-layout patterns detected in design." });
  }

  Object.keys(scores).forEach((k) => (scores[k] = Math.max(0, Math.min(100, scores[k]))));

  return {
    url,
    timestamp: new Date().toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    scores,
    overallScore: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6),
    issues,
    recommendations: [
      {
        priority: "critical",
        title: "Mirror Auto-Layouts",
        body: 'Switch horizontal Auto-layout direction to "Right to Left" for all Arabic screens.',
      },
      {
        priority: "high",
        title: "Arabic Font Tokens",
        body: "Define specific typography tokens for Arabic (e.g., Cairo or Noto Naskh) instead of using Latin defaults.",
      },
      {
        priority: "medium",
        title: "Component Mirroring",
        body: "Ensure icons with directionality (arrows, progress bars) are mirrored in your Figma components.",
      },
    ],
  };
}

export function runMetadataAudit(content: string, filename: string) {
  const issues: Record<string, any[]> = {
    rtl: [],
    governance: [],
    a11y: [],
    readability: [],
    search: [],
    workflow: [],
  };

  const scores: Record<string, number> = { rtl: 100, governance: 100, a11y: 100, readability: 100, search: 100, workflow: 100 };

  const isArabicLocale = content.includes('"ar"') || content.includes("'ar'") || content.includes("<string>ar</string>");
  const hasRTLSupport = content.includes("supportsRtl") || content.includes('android:supportsRtl="true"');

  if (isArabicLocale) {
    issues.workflow.push({ type: "pass", text: "Arabic locale explicitly defined in metadata." });
  } else {
    issues.workflow.push({ type: "fail", text: "Arabic locale missing from supported languages." });
    scores.workflow -= 50;
  }

  if (hasRTLSupport) {
    issues.rtl.push({ type: "pass", text: "RTL support flag is enabled in manifest." });
  } else if (filename.endsWith(".xml")) {
    issues.rtl.push({ type: "fail", text: "android:supportsRtl is missing or set to false." });
    scores.rtl -= 60;
  }

  Object.keys(scores).forEach((k) => (scores[k] = Math.max(0, Math.min(100, scores[k]))));

  return {
    url: `Metadata: ${filename}`,
    timestamp: new Date().toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    scores,
    overallScore: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6),
    issues,
    recommendations: [
      {
        priority: "critical",
        title: "Enable RTL Flag",
        body: 'Set supportsRtl="true" in your Android manifest or equivalent in iOS Info.plist.',
      },
      {
        priority: "high",
        title: "Localize Store Assets",
        body: "Ensure your app bundle includes localized strings for Arabic (ar.lproj or values-ar).",
      },
    ],
  };
}
