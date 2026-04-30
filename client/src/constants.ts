import { Checkpoint, Issue, Recommendation } from './types';
import { 
  Globe, ShieldCheck, Layout as LayoutIcon, BarChart3, Award, 
  Terminal, Zap, BookOpen, Map, Shield, CreditCard,
  FileSearch, TrendingUp, Filter, Plus, Send,
  MoreVertical, ThumbsUp, Flag, Check, Calendar, Clock, Link as LinkIcon,
  Search, CheckSquare, Code, MessageSquare, Globe2, Languages
} from 'lucide-react';

export const CHECKPOINTS: Checkpoint[] = [
  { id: 'rtl', name: 'RTL Patterns', desc: 'Layout direction, icon mirroring, component alignment', weight: 20, icon: Globe2 },
  { id: 'governance', name: 'Content Governance', desc: 'Glossary consistency, tone, terminology standards', weight: 15, icon: ShieldCheck },
  { id: 'a11y', name: 'Accessibility', desc: 'Reading order, focus flow, screen reader support', weight: 20, icon: CheckSquare },
  { id: 'readability', name: 'Readability', desc: 'Typography, spacing, Arabic font rendering, microcopy', weight: 20, icon: Languages },
  { id: 'search', name: 'Search Behaviour', desc: 'Normalization, spelling variants, hamza/alef handling', weight: 15, icon: Search },
  { id: 'workflow', name: 'Approval Workflow', desc: 'Bilingual versioning, controlled publishing, QA gates', weight: 10, icon: Code },
  { id: 'seo', name: 'SEO & AEO', desc: 'hreflang, metadata, Answer Engine Optimization for Arabic', weight: 10, icon: Globe },
  { id: 'geo', name: 'GEO Intelligence', desc: 'Geographic optimization, local trust signals, regional nuances', weight: 10, icon: Map },
];

export const ISSUES: Record<string, Issue[]> = {
  rtl: [
    { type: 'fail', text: 'Navigation icons not mirrored — back arrow points the wrong direction in Arabic context' },
    { type: 'fail', text: 'Images within RTL containers are not mirrored — directional visual content is reversed' },
    { type: 'fail', text: 'Checkout flow uses LTR component sequence despite RTL page direction' },
    { type: 'warn', text: 'Modal close buttons positioned top-right — should be top-left for Arabic' },
    { type: 'pass', text: 'Main page direction is correctly set via dir="rtl"' },
  ],
  governance: [
    { type: 'fail', text: 'Mixed formal/informal Arabic register — 3 tones detected in the same user flow' },
    { type: 'warn', text: '"Product" translated inconsistently: منتج and بضاعة used interchangeably' },
    { type: 'pass', text: 'Core brand name localized consistently across all pages' },
    { type: 'pass', text: 'CTA button labels use consistent Arabic terminology' },
  ],
  a11y: [
    { type: 'fail', text: 'Screen reader reading order follows DOM source order, not visual Arabic flow' },
    { type: 'fail', text: 'ARIA labels exist only in English — Arabic interface has no Arabic ARIA attributes' },
    { type: 'fail', text: 'Focus trap on modals does not account for RTL tab sequence' },
    { type: 'warn', text: 'Missing aria-label on interactive elements with Arabic text but no explicit labels' },
    { type: 'warn', text: 'Colour contrast on Arabic body text is 3.2:1 — below WCAG AA (4.5:1)' },
  ],
  readability: [
    { type: 'fail', text: 'Body text falls back to a Latin font for Arabic characters — no Arabic-optimised typeface loaded' },
    { type: 'warn', text: 'Line height of 1.4 is insufficient for Arabic — minimum 1.8 recommended' },
    { type: 'warn', text: 'Error messages in Arabic are truncated on mobile viewports' },
    { type: 'pass', text: 'Heading weight is adequate for Arabic character density' },
    { type: 'pass', text: 'Number formatting (Arabic-Indic vs Western) is user-configurable' },
  ],
  search: [
    { type: 'fail', text: 'No hamza normalization — أ, إ, and ا treated as distinct characters, breaking search recall' },
    { type: 'fail', text: 'Tashkeel (diacritics) not stripped from search index — significantly reduces recall' },
    { type: 'fail', text: 'Ta marbuta (ة vs ه) not normalized at query time' },
    { type: 'warn', text: 'Search autocomplete has no Arabic keyboard layout optimization' },
  ],
  workflow: [
    { type: 'warn', text: 'No bilingual diff view — translators cannot compare Arabic and English side-by-side' },
    { type: 'pass', text: 'Arabic content changes require a separate approval step' },
    { type: 'pass', text: 'Publishing supports language-specific release gates' },
    { type: 'pass', text: 'Version history tracks Arabic content changes separately' },
  ],
  seo: [
    { type: 'fail', text: 'Missing hreflang="ar" tags — search engines cannot identify regional Arabic variants' },
    { type: 'warn', text: 'Arabic meta descriptions exceed recommended character limits for RTL display' },
    { type: 'fail', text: 'AEO: Content structure lacks semantic markup for Arabic Answer Engines' },
  ],
  geo: [
    { type: 'warn', text: 'Generic currency symbols used — should use local SAR/AED for GCC markets' },
    { type: 'fail', text: 'Missing local trust signals (TDRA/SAMA badges) for the target market' },
  ],
};

export const DEMO_SCORES: Record<string, number> = {
  rtl: 42,
  governance: 58,
  a11y: 31,
  readability: 67,
  search: 29,
  workflow: 74,
};

export const RECOMMENDATIONS: Recommendation[] = [
  { priority: 'critical', title: 'Fix Search Normalization', body: 'Implement hamza, tashkeel, and ta marbuta normalization in your search pipeline. This single fix can improve recall by 40–60% for Arabic users.' },
  { priority: 'critical', title: 'Add Arabic ARIA Labels', body: 'Your accessibility tree is entirely in English. Add lang="ar" and Arabic ARIA labels throughout the Arabic interface.' },
  { priority: 'critical', title: 'Mirror RTL Directional Icons', body: 'Back arrows, chevrons, and navigation icons must flip in RTL context. Use CSS logical properties or dedicated RTL icon variants.' },
  { priority: 'high', title: 'Load Arabic-Optimised Font', body: 'Replace font fallback with Noto Naskh Arabic, Cairo, or IBM Plex Arabic. Set line-height: 1.8 minimum for body text.' },
  { priority: 'high', title: 'Establish Content Glossary', body: 'Create a locked Arabic terminology glossary for product, category, and action terms. Enforce it in your CMS approval flow.' },
  { priority: 'medium', title: 'Fix RTL Tab Order', body: 'Keyboard navigation should flow right-to-left in Arabic interfaces. Override with tabindex where the DOM order diverges.' },
];

export const LOGS = [
  'Resolving host and fetching HTML…',
  'Parsing DOM structure and language attributes…',
  'Extracting Arabic text nodes…',
  'Running RTL layout analysis…',
  'Scanning accessibility tree and ARIA labels…',
  'Analysing Arabic typography stack…',
  'Testing search normalization patterns…',
  'Checking content governance signals…',
  'Evaluating publishing workflow metadata…',
  'Computing checkpoint scores…',
  'Generating prioritised recommendations…',
  '✓ Audit complete',
];

export const ASSERTIONS: any[] = [
  { id: 'rtl-dir', category: 'rtl', text: 'root element carries dir="rtl"', enabled: true },
  { id: 'rtl-margin', category: 'rtl', text: 'no hardcoded margin-left without RTL override', enabled: true },
  { id: 'rtl-icons', category: 'rtl', text: 'directional icons have mirrored variants', enabled: true },
  { id: 'typo-font', category: 'typography', text: 'Arabic body font is Arabic-optimised', enabled: true },
  { id: 'typo-lh', category: 'typography', text: 'computed line-height ≥ 1.7', enabled: true },
  { id: 'a11y-aria', category: 'a11y', text: 'ARIA labels exist in Arabic', enabled: true },
  { id: 'search-hamza', category: 'search', text: 'hamza normalization active', enabled: true },
  { id: 'gov-register', category: 'governance', text: 'no mixed-register Arabic copy', enabled: true },
  { id: 'loc-lang', category: 'localization', text: 'lang="ar" on root', enabled: true },
  { id: 'seo-hreflang', category: 'seo', text: 'hreflang tags present for Arabic variants', enabled: true },
  { id: 'seo-aeo', category: 'seo', text: 'semantic markup for Answer Engine Optimization', enabled: true },
  { id: 'geo-trust', category: 'geo', text: 'local trust signals and badges present', enabled: true },
  { id: 'rtl-logical', category: 'rtl', text: 'uses CSS logical properties instead of hardcoded margins', enabled: true },
];

export const MARKETS = [
  { id: 'uae', name: 'UAE', dialect: 'Gulf Arabic', formality: 'High', flag: '🇦🇪' },
  { id: 'ksa', name: 'KSA', dialect: 'Najdi/Hijazi', formality: 'High', flag: '🇸🇦' },
  { id: 'egypt', name: 'Egypt', dialect: 'Egyptian', formality: 'Medium', flag: '🇪🇬' },
  { id: 'qatar', name: 'Qatar', dialect: 'Gulf Arabic', formality: 'High', flag: '🇶🇦' },
];

export const PATTERNS: any[] = [
  { id: 'nav-rtl', name: 'RTL Navigation', desc: 'Main navigation bar mirroring', problem: 'Back arrows pointing right in RTL', solution: 'Flip icon and reverse order', markets: ['All'], checkpointId: 'rtl' },
  { id: 'form-align', name: 'Arabic Form Alignment', desc: 'Right-aligned labels and inputs', problem: 'Left-aligned labels with Arabic text', solution: 'text-align: right and flex-direction: row-reverse', markets: ['All'], checkpointId: 'rtl' },
];

export const REGULATIONS: any[] = [
  { id: 'tra-uae', market: 'UAE', name: 'TRA Digital Standards', requirement: 'Mandatory Arabic interface for gov services', status: 'enforced', penalty: 'Service suspension', sourceUrl: 'https://tdra.gov.ae' },
  { id: 'ndmo-ksa', market: 'KSA', name: 'NDMO Data Localization', requirement: 'Arabic data residency compliance', status: 'enforced', penalty: 'Heavy fines', sourceUrl: 'https://ndmo.gov.sa' },
];

export const BENCHMARKS: any[] = [
  { id: 'b1', name: 'Emirates NBD', category: 'Banking', market: 'UAE', score: 88, delta: 2, criticalIssues: ['Search Normalization'] },
  { id: 'b2', name: 'STC Pay', category: 'Fintech', market: 'KSA', score: 92, delta: 5, criticalIssues: [] },
  { id: 'b3', name: 'Noon', category: 'E-commerce', market: 'UAE', score: 76, delta: -3, criticalIssues: ['Mixed Register', 'Icon Mirroring'] },
];
