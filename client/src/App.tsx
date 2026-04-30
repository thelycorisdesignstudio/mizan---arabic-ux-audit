import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ChevronLeft, CheckCircle2, AlertCircle, XCircle, Download, ArrowRight, Share2, 
  RefreshCcw, Upload, FileText, Figma, Sun, Moon, ChevronUp, 
  Users, ShieldCheck, Globe, Layout as LayoutIcon, Settings, BarChart3, MessageSquare,
  Search, CheckSquare, Code, Terminal, Zap, BookOpen, Map, Shield, CreditCard,
  Award, FileJson, Languages, FileSearch, TrendingUp, Filter, Plus, Send,
  MoreVertical, ThumbsUp, Flag, Check, Calendar, Clock, Link as LinkIcon,
  Bot, LifeBuoy, HelpCircle, Sparkles, Info, Copy, Menu, X as XIcon
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
import { CHECKPOINTS, LOGS, ASSERTIONS, MARKETS, PATTERNS, REGULATIONS, BENCHMARKS, ISSUES, RECOMMENDATIONS } from './constants';
import {
  AuditResults, Issue, Recommendation, Collaborator, Comment,
  Assertion, Pattern, Regulation, BenchmarkProduct,
  CulturalIntelligence, RiskMetrics, CertificationResult, CertificationTier, CodeFix
} from './types';
import jsPDF from 'jspdf';
import { domToCanvas } from 'modern-screenshot';

export default function App() {
  const [screen, setScreen] = useState<'input' | 'loading' | 'results' | 'collaboration' | 'regression' | 'intelligence' | 'design-system' | 'certification' | 'governance' | 'benchmark' | 'pillar-detail' | 'features' | 'support' | 'ticket' | 'docs' | 'ai-expert'>('input');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [url, setUrl] = useState('');
  const [htmlPaste, setHtmlPaste] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [results, setResults] = useState<AuditResults | null>(null);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLanguageToggle = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditId = params.get('id');
    if (auditId) {
      fetchAudit(auditId);
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) analyzeImage(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const analyzeImage = async (file: File) => {
    setScreen('loading');
    setActiveLogs(['Processing image...', 'Analyzing mobile/web UX patterns...']);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const response = await fetch('/api/ai/vision-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, mimeType: file.type, filename: file.name }),
        });

        if (!response.ok) throw new Error('Vision analysis failed');
        const data = await response.json();

        setResults({
          id: 'vision-' + Date.now(),
          url: 'Visual Audit: ' + (file.name || 'Pasted Image'),
          timestamp: new Date().toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          ...data
        });
        setScreen('results');
      };
    } catch (err: any) {
      setError("Vision analysis failed: " + err.message);
      setScreen('input');
    }
  };

  const fetchAudit = async (id: string) => {
    setScreen('loading');
    try {
      const response = await fetch(`/api/audit/${id}`);
      if (!response.ok) throw new Error('Audit not found');
      const data = await response.json();
      setResults(data);
      setScreen('results');
    } catch (err: any) {
      setError(err.message);
      setScreen('input');
    }
  };

  useEffect(() => {
    if (screen === 'input') {
      const ctx = gsap.context(() => {
        gsap.from(".gsap-reveal", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".gsap-reveal",
            start: "top 85%",
          }
        });

        gsap.from(".gsap-card", {
          y: 60,
          opacity: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".gsap-card",
            start: "top 90%",
          }
        });
      });
      return () => ctx.revert();
    }
  }, [screen]);

  const startAudit = async (targetUrl?: string, html?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl && !html) {
      const el = document.getElementById('audit-input-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setError(null);
    setScreen('loading');
    setActiveLogs([]);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, html })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to perform audit');
      }

      const data = await response.json();
      
      // Simulate logs for visual effect even though analysis is done
      for (let i = 0; i < LOGS.length; i++) {
        setActiveLogs(prev => [...prev, LOGS[i]]);
        await new Promise(r => setTimeout(r, 400));
      }

      setResults(data);
      setScreen('results');
      window.history.pushState({}, '', `?id=${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setScreen('input');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    analyzeImage(file);
  };

  const handleMetadataUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreen('loading');
    setActiveLogs(['Reading metadata file...', 'Analyzing app manifest for Arabic support...']);

    try {
      const content = await file.text();
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content })
      });

      if (!response.ok) throw new Error('Failed to analyze metadata');
      const data = await response.json();
      setResults(data);
      setScreen('results');
    } catch (err: any) {
      setError(err.message);
      setScreen('input');
    }
  };

  const handleFigmaAudit = async () => {
    if (!figmaUrl) return;
    setScreen('loading');
    setActiveLogs(['Connecting to Figma API...', 'Extracting component layers...', 'Analyzing layout direction...']);
    
    try {
      const response = await fetch('/api/figma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Figma analysis failed');
      }

      const data = await response.json();
      setResults(data);
      setScreen('results');
    } catch (err: any) {
      setError(err.message);
      setScreen('input');
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById('audit-report');
    if (!element || isExporting) return;

    setIsExporting(true);
    // Add a temporary class to force print styles for capture
    element.classList.add('exporting-pdf');
    
    try {
      // Give a small delay for any layout shifts to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await domToCanvas(element, { 
        scale: 2,
        backgroundColor: '#ffffff',
        width: 1200,
        style: {
          padding: '60px',
          width: '1200px',
          borderRadius: '0px',
          background: 'white'
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const canvasWidthInMm = pdfWidth;
      const canvasHeightInMm = (imgProps.height * canvasWidthInMm) / imgProps.width;
      
      let heightLeft = canvasHeightInMm;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, canvasWidthInMm, canvasHeightInMm);
      heightLeft -= pdfHeight;

      // Subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - canvasHeightInMm;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, canvasWidthInMm, canvasHeightInMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Mizan_Audit_Report_${results?.id || 'export'}.pdf`);
      showToast('Audit report exported successfully!');
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      element.classList.remove('exporting-pdf');
      setIsExporting(false);
    }
  };

  const shareAudit = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsSharing(true);
    showToast('Audit link copied to clipboard!');
    setTimeout(() => setIsSharing(false), 2000);
  };

  const reset = () => {
    setScreen('input');
    setUrl('');
    setHtmlPaste('');
    setFigmaUrl('');
    setResults(null);
    setActiveLogs([]);
    setError(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div 
      className={`min-h-screen relative overflow-x-hidden selection:bg-mizan-blue/10 font-manrope-300 ${
        lang === 'ar' ? 'rtl' : 'ltr'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="bg-layer fixed inset-0 pointer-events-none z-0 overflow-hidden" />
      
      <header className="sticky top-0 z-50 transition-colors duration-300">
        <nav className="bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-black/5 dark:border-dark-border h-14 sm:h-16 flex items-center rtl-mirror rtl-mirror-icons">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={reset}>
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-8 sm:h-8">
                <rect width="64" height="64" rx="16" fill="url(#mizan-grad)"/>
                <path d="M32 14L44 26H38V38H44L32 50L20 38H26V26H20L32 14Z" fill="white" fillOpacity="0.95"/>
                <path d="M28 30H36V34H28V30Z" fill="white" fillOpacity="0.6"/>
                <circle cx="32" cy="32" r="4" fill="white"/>
                <defs>
                  <linearGradient id="mizan-grad" x1="0" y1="0" x2="64" y2="64">
                    <stop stopColor="#0071E3"/>
                    <stop offset="1" stopColor="#009E91"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-base sm:text-lg font-bold tracking-tight dark:text-white">Mizan</span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-mizan-text3 dark:text-dark-text3">Arabic UX Audit</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] lg:text-[12px] text-mizan-text dark:text-dark-text uppercase tracking-widest font-medium">
                <button onClick={reset} className={`${screen === 'input' ? 'text-mizan-blue' : 'hover:text-mizan-blue'} transition-colors`}>{lang === 'en' ? 'Overview' : 'نظرة عامة'}</button>
                <button onClick={() => setScreen('features')} className={`${screen === 'features' ? 'text-mizan-blue' : 'hover:text-mizan-blue'} transition-colors`}>{lang === 'en' ? 'Features' : 'المميزات'}</button>
                <button onClick={() => setScreen('intelligence')} className={`${screen === 'intelligence' ? 'text-mizan-blue' : 'hover:text-mizan-blue'} transition-colors`}>{lang === 'en' ? 'Cultural Intelligence' : 'الذكاء الثقافي'}</button>
                <button onClick={() => setScreen('support')} className={`${screen === 'support' ? 'text-mizan-blue' : 'hover:text-mizan-blue'} transition-colors`}>{lang === 'en' ? 'Support' : 'الدعم'}</button>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handleLanguageToggle}
                  className="hidden sm:block px-3 py-1 rounded-full border border-black/5 dark:border-dark-border text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  {lang === 'en' ? 'العربية' : 'English'}
                </button>
                <button
                  onClick={handleDarkModeToggle}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-mizan-text3 dark:text-dark-text2"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  onClick={() => startAudit()}
                  className="hidden sm:block bg-mizan-blue hover:bg-mizan-blue-dark text-white px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-mizan-blue/20"
                >
                  Audit Now
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl border-b border-black/5 dark:border-dark-border overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <div className="flex flex-col gap-4 text-sm font-semibold text-mizan-text dark:text-dark-text">
                  <button onClick={() => { reset(); setMobileMenuOpen(false); }} className={`text-left ${screen === 'input' ? 'text-mizan-blue' : ''}`}>{lang === 'en' ? 'Overview' : 'نظرة عامة'}</button>
                  <button onClick={() => { setScreen('features'); setMobileMenuOpen(false); }} className={`text-left ${screen === 'features' ? 'text-mizan-blue' : ''}`}>{lang === 'en' ? 'Features' : 'المميزات'}</button>
                  <button onClick={() => { setScreen('intelligence'); setMobileMenuOpen(false); }} className={`text-left ${screen === 'intelligence' ? 'text-mizan-blue' : ''}`}>{lang === 'en' ? 'Cultural Intelligence' : 'الذكاء الثقافي'}</button>
                  <button onClick={() => { setScreen('certification'); setMobileMenuOpen(false); }} className={`text-left ${screen === 'certification' ? 'text-mizan-blue' : ''}`}>{lang === 'en' ? 'Certification' : 'الشهادة'}</button>
                  <button onClick={() => { setScreen('support'); setMobileMenuOpen(false); }} className={`text-left ${screen === 'support' ? 'text-mizan-blue' : ''}`}>{lang === 'en' ? 'Support' : 'الدعم'}</button>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-dark-border">
                  <button
                    onClick={handleLanguageToggle}
                    className="px-3 py-1.5 rounded-full border border-black/5 dark:border-dark-border text-[10px] font-bold uppercase tracking-widest"
                  >
                    {lang === 'en' ? 'العربية' : 'English'}
                  </button>
                  <button
                    onClick={() => { startAudit(); setMobileMenuOpen(false); }}
                    className="flex-1 bg-mizan-blue text-white py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest text-center"
                  >
                    Audit Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {screen === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {/* Hero Section - Apple Features Style */}
              <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-8 sm:mb-10 flex items-center justify-center shadow-xl shadow-mizan-blue/20"
                  >
                    <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20">
                      <rect width="64" height="64" rx="16" fill="url(#hero-grad)"/>
                      <path d="M32 14L44 26H38V38H44L32 50L20 38H26V26H20L32 14Z" fill="white" fillOpacity="0.95"/>
                      <path d="M28 30H36V34H28V30Z" fill="white" fillOpacity="0.6"/>
                      <circle cx="32" cy="32" r="4" fill="white"/>
                      <defs>
                        <linearGradient id="hero-grad" x1="0" y1="0" x2="64" y2="64">
                          <stop stopColor="#0071E3"/>
                          <stop offset="1" stopColor="#009E91"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  <h1 className="gsap-reveal text-mizan-text dark:text-white text-3xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6 sm:mb-8">
                    {lang === 'en' ? 'Arabic UX Audit.' : 'تدقيق تجربة المستخدم العربية.'}<br />
                    {lang === 'en' ? 'Built for the MENA region.' : 'مصمم لمنطقة الشرق الأوسط.'}
                  </h1>

                  <p className="gsap-reveal text-mizan-text3 dark:text-dark-text3 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-8 sm:mb-10">
                    {lang === 'en' 
                      ? 'Mizan OS is the world\'s first automated audit engine specifically designed for Arabic digital products. From RTL mirroring to linguistic register analysis, we ensure your product feels native to millions.'
                      : 'ميزان OS هو أول محرك تدقيق مؤتمت في العالم مصمم خصيصاً للمنتجات الرقمية العربية. من محاكاة RTL إلى تحليل السجل اللغوي، نضمن أن يشعر ملايين المستخدمين بأن منتجك أصلي.'}
                  </p>

                  <div className="gsap-reveal">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('audit-input-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-mizan-blue hover:underline text-xl font-medium flex items-center gap-2 mx-auto"
                    >
                      {lang === 'en' ? 'Start your audit' : 'ابدأ التدقيق الآن'} <ArrowRight size={20} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </section>

              {/* UAE Leadership Quotes */}
              <section className="py-16 sm:py-24 border-t border-black/5 dark:border-dark-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <h2 className="gsap-reveal text-center text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight dark:text-white mb-4">
                    {lang === 'en' ? 'Inspired by Visionary Leadership' : 'مستوحى من القيادة الحكيمة'}
                  </h2>
                  <p className="gsap-reveal text-center text-mizan-text3 dark:text-dark-text3 text-lg font-medium mb-20 max-w-3xl mx-auto leading-relaxed">
                    {lang === 'en'
                      ? 'The UAE\'s journey from desert to global powerhouse was built on vision, cultural pride, and relentless ambition. These principles guide our mission to set the standard for Arabic digital excellence.'
                      : 'رحلة الإمارات من الصحراء إلى قوة عالمية بُنيت على الرؤية والفخر الثقافي والطموح الدؤوب. هذه المبادئ توجه مهمتنا لوضع المعيار للتميز الرقمي العربي.'}
                  </p>

                  {/* Founding Vision — Sheikh Zayed */}
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">🇦🇪</span>
                      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-mizan-blue">{lang === 'en' ? 'Founding Vision — UAE' : 'الرؤية التأسيسية — الإمارات'}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          quote: lang === 'en'
                            ? '"A nation without a past is a nation without a present or a future."'
                            : '"أمة بلا ماض هي أمة بلا حاضر أو مستقبل."',
                          context: lang === 'en'
                            ? 'Cultural authenticity as the foundation of digital systems'
                            : 'الأصالة الثقافية كأساس للأنظمة الرقمية',
                        },
                        {
                          quote: lang === 'en'
                            ? '"We have learned from our past that our future will be built on hard work and dedication."'
                            : '"لقد تعلمنا من ماضينا أن مستقبلنا سيُبنى على العمل الجاد والإخلاص."',
                          context: lang === 'en'
                            ? 'Future-focused systems rooted in heritage'
                            : 'أنظمة مستقبلية متجذرة في التراث',
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={`zayed-${i}`}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.6 }}
                          className="bg-white dark:bg-dark-surface rounded-[28px] p-10 border border-black/5 dark:border-dark-border shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="absolute top-4 right-6 text-8xl font-bold text-mizan-blue/[0.04] dark:text-mizan-blue/[0.08] leading-none select-none">&ldquo;</div>
                          <p className="text-mizan-text dark:text-dark-text text-lg font-medium leading-relaxed mb-6 relative z-10" style={{ fontStyle: 'italic' }}>
                            {item.quote}
                          </p>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                              <span className="text-white text-sm font-bold">Z</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold dark:text-white">{lang === 'en' ? 'Sheikh Zayed bin Sultan Al Nahyan' : 'الشيخ زايد بن سلطان آل نهيان'}</div>
                              <div className="text-[11px] text-mizan-text3 dark:text-dark-text3 font-semibold">{lang === 'en' ? 'Founding Father of the UAE (1918–2004)' : 'الأب المؤسس لدولة الإمارات (١٩١٨–٢٠٠٤)'}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-black/5 dark:border-dark-border">
                            <p className="text-xs font-semibold text-mizan-teal uppercase tracking-widest">{item.context}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Current UAE Leadership — Sheikh Mohamed bin Zayed */}
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">🇦🇪</span>
                      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-mizan-blue">{lang === 'en' ? 'Current UAE Leadership' : 'القيادة الحالية للإمارات'}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          quote: lang === 'en'
                            ? '"Investing in people is the most valuable investment we can make."'
                            : '"الاستثمار في البشر هو أثمن استثمار يمكننا القيام به."',
                          context: lang === 'en'
                            ? 'Standardization through empowering talent'
                            : 'التوحيد من خلال تمكين الكفاءات',
                        },
                        {
                          quote: lang === 'en'
                            ? '"Our ambition is limitless, and our journey towards excellence never stops."'
                            : '"طموحنا بلا حدود، ورحلتنا نحو التميز لا تتوقف."',
                          context: lang === 'en'
                            ? 'Long-term ecosystem excellence'
                            : 'التميز في المنظومة على المدى الطويل',
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={`mbz-${i}`}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.6 }}
                          className="bg-white dark:bg-dark-surface rounded-[28px] p-10 border border-black/5 dark:border-dark-border shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="absolute top-4 right-6 text-8xl font-bold text-mizan-blue/[0.04] dark:text-mizan-blue/[0.08] leading-none select-none">&ldquo;</div>
                          <p className="text-mizan-text dark:text-dark-text text-lg font-medium leading-relaxed mb-6 relative z-10" style={{ fontStyle: 'italic' }}>
                            {item.quote}
                          </p>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mizan-blue to-blue-700 flex items-center justify-center shadow-lg shadow-mizan-blue/20">
                              <span className="text-white text-sm font-bold">M</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold dark:text-white">{lang === 'en' ? 'His Highness Sheikh Mohamed bin Zayed Al Nahyan' : 'صاحب السمو الشيخ محمد بن زايد آل نهيان'}</div>
                              <div className="text-[11px] text-mizan-text3 dark:text-dark-text3 font-semibold">{lang === 'en' ? 'President of the United Arab Emirates' : 'رئيس دولة الإمارات العربية المتحدة'}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-black/5 dark:border-dark-border">
                            <p className="text-xs font-semibold text-mizan-teal uppercase tracking-widest">{item.context}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Dubai Legacy — Sheikh Rashid bin Saeed */}
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">🏙️</span>
                      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-mizan-blue">{lang === 'en' ? 'Dubai Legacy & Leadership' : 'إرث ومسيرة دبي'}</h3>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-mizan-off to-white dark:from-dark-surface dark:to-dark-surface2 rounded-[28px] p-12 border border-black/5 dark:border-dark-border shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="absolute top-4 right-6 text-9xl font-bold text-mizan-blue/[0.03] dark:text-mizan-blue/[0.06] leading-none select-none">&ldquo;</div>
                      <p className="text-mizan-text dark:text-dark-text text-xl md:text-2xl font-medium leading-relaxed mb-8 relative z-10 max-w-4xl" style={{ fontStyle: 'italic' }}>
                        {lang === 'en'
                          ? '"My grandfather rode a camel, my father rode a camel, I drive a Mercedes, my son drives a Land Rover, his son will drive a Land Rover, but his son will ride a camel."'
                          : '"جدي ركب جملاً، أبي ركب جملاً، أنا أقود مرسيدس، ابني يقود لاند روفر، ابنه سيقود لاند روفر، لكن ابنه سيركب جملاً."'}
                      </p>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/20">
                          <span className="text-white text-base font-bold">R</span>
                        </div>
                        <div>
                          <div className="text-base font-bold dark:text-white">{lang === 'en' ? 'Sheikh Rashid bin Saeed Al Maktoum' : 'الشيخ راشد بن سعيد آل مكتوم'}</div>
                          <div className="text-xs text-mizan-text3 dark:text-dark-text3 font-semibold">{lang === 'en' ? 'Late Ruler of Dubai — Father of Modern Dubai (1912–1990)' : 'حاكم دبي الراحل — أبو دبي الحديثة (١٩١٢–١٩٩٠)'}</div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-black/5 dark:border-dark-border">
                        <p className="text-xs font-semibold text-mizan-teal uppercase tracking-widest">{lang === 'en' ? 'Why cultural grounding matters in rapid modernization — exactly our thesis' : 'لماذا يهم التأصيل الثقافي في التحديث السريع — هذه بالضبط أطروحتنا'}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Modern Dubai Vision — Sheikh Mohammed bin Rashid */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">🚀</span>
                      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-mizan-blue">{lang === 'en' ? 'Modern Dubai Vision' : 'رؤية دبي الحديثة'}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          quote: lang === 'en'
                            ? '"In the race for excellence, there is no finish line."'
                            : '"في سباق التميز، لا يوجد خط نهاية."',
                          context: lang === 'en'
                            ? 'Continuous improvement as the standard'
                            : 'التحسين المستمر كمعيار',
                        },
                        {
                          quote: lang === 'en'
                            ? '"The future belongs to those who can imagine it, design it, and execute it."'
                            : '"المستقبل ملك لمن يستطيع تخيله وتصميمه وتنفيذه."',
                          context: lang === 'en'
                            ? 'Mizan as infrastructure for the future of Arabic digital ecosystems'
                            : 'ميزان كبنية تحتية لمستقبل المنظومات الرقمية العربية',
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={`mbr-${i}`}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.6 }}
                          className="bg-white dark:bg-dark-surface rounded-[28px] p-10 border border-black/5 dark:border-dark-border shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="absolute top-4 right-6 text-8xl font-bold text-mizan-blue/[0.04] dark:text-mizan-blue/[0.08] leading-none select-none">&ldquo;</div>
                          <p className="text-mizan-text dark:text-dark-text text-lg font-medium leading-relaxed mb-6 relative z-10" style={{ fontStyle: 'italic' }}>
                            {item.quote}
                          </p>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mizan-teal to-teal-700 flex items-center justify-center shadow-lg shadow-mizan-teal/20">
                              <span className="text-white text-sm font-bold">M</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold dark:text-white">{lang === 'en' ? 'His Highness Sheikh Mohammed bin Rashid Al Maktoum' : 'صاحب السمو الشيخ محمد بن راشد آل مكتوم'}</div>
                              <div className="text-[11px] text-mizan-text3 dark:text-dark-text3 font-semibold">{lang === 'en' ? 'Vice President & Prime Minister of the UAE, Ruler of Dubai' : 'نائب رئيس الدولة ورئيس مجلس الوزراء، حاكم دبي'}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-black/5 dark:border-dark-border">
                            <p className="text-xs font-semibold text-mizan-teal uppercase tracking-widest">{item.context}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>

              {/* Feature Showcase - Apple Card Style */}
              <div className="space-y-12 pb-32">
                {/* Feature 1: RTL Patterns */}
                <section className="gsap-card bg-mizan-off dark:bg-dark-surface rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-dark-border p-6 sm:p-12 md:p-20">
                  <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center px-3 py-1 rounded-full border border-mizan-amber text-mizan-amber text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6">Advanced RTL</div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8 leading-tight">
                        {lang === 'en' ? 'Perfect RTL Mirroring.' : 'محاكاة RTL مثالية.'}
                      </h2>
                      <p className="text-mizan-text3 dark:text-dark-text3 text-xl font-medium leading-relaxed">
                        {lang === 'en' 
                          ? 'Our engine detects hardcoded directional CSS, missing logical properties, and incorrectly mirrored icons. We ensure your layout flows naturally from right to left.'
                          : 'يكتشف محركنا CSS الاتجاهي المرمز يدوياً، والخصائص المنطقية المفقودة، والأيقونات التي تمت محاكاتها بشكل غير صحيح. نضمن أن يتدفق تخطيطك بشكل طبيعي من اليمين إلى اليسار.'}
                      </p>
                    </div>
                    <div className="order-1 md:order-2">
                      <img 
                        src="https://picsum.photos/seed/mizan-rtl/1200/800" 
                        alt="RTL Layout Audit" 
                        className="rounded-2xl shadow-2xl border border-black/5 dark:border-dark-border"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </section>

                {/* Feature 2: Content Governance */}
                <section className="gsap-card bg-mizan-off dark:bg-dark-surface rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-dark-border p-6 sm:p-12 md:p-20">
                  <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
                    <div>
                      <img
                        src="https://picsum.photos/seed/mizan-gov/1200/800"
                        alt="Content Governance"
                        className="rounded-2xl shadow-2xl border border-black/5 dark:border-dark-border"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full border border-mizan-teal text-mizan-teal text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6">Linguistic Intelligence</div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8 leading-tight">
                        {lang === 'en' ? 'Consistent Arabic Register.' : 'سجل لغوي عربي متسق.'}
                      </h2>
                      <p className="text-mizan-text3 dark:text-dark-text3 text-xl font-medium leading-relaxed">
                        {lang === 'en'
                          ? 'Mizan OS analyzes your Arabic copy for consistency between Modern Standard Arabic (MSA) and regional dialects. No more mixing formal buttons with informal success messages.'
                          : 'يقوم ميزان OS بتحليل نسختك العربية لضمان الاتساق بين اللغة العربية الفصحى الحديثة (MSA) واللهجات الإقليمية. لا مزيد من خلط الأزرار الرسمية مع رسائل النجاح غير الرسمية.'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Feature 3: Search Normalization */}
                <section className="gsap-card bg-mizan-off dark:bg-dark-surface rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-dark-border p-6 sm:p-12 md:p-20">
                  <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center px-3 py-1 rounded-full border border-mizan-blue text-mizan-blue text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6">Search Optimization</div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8 leading-tight">
                        {lang === 'en' ? 'Search Normalization Audit.' : 'تدقيق تسوية البحث.'}
                      </h2>
                      <p className="text-mizan-text3 dark:text-dark-text3 text-xl font-medium leading-relaxed">
                        {lang === 'en'
                          ? 'We check if your product handles common Arabic character variations (Hamza, Ta Marbuta, Alif Maqsura). Ensure your users find what they are looking for, every time.'
                          : 'نتحقق مما إذا كان منتجك يتعامل مع الاختلافات الشائعة في الأحرف العربية (الهمزة، التاء المربوطة، الألف المقصورة). تأكد من أن مستخدميك يجدون ما يبحثون عنه، في كل مرة.'}
                      </p>
                    </div>
                    <div className="order-1 md:order-2">
                      <img 
                        src="https://picsum.photos/seed/mizan-search/1200/800" 
                        alt="Search Normalization" 
                        className="rounded-2xl shadow-2xl border border-black/5 dark:border-dark-border"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Other Key Features Grid - Apple Style */}
              <section className="py-16 sm:py-32 border-t border-black/5 dark:border-dark-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <div className="grid md:grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-12 sm:gap-y-20">
                    <div className="md:col-span-1">
                      <h2 className="gsap-reveal text-2xl sm:text-4xl font-semibold tracking-tight dark:text-white leading-tight">
                        {lang === 'en' ? 'Comprehensive Arabic Audit.' : 'تدقيق عربي شامل.'}
                      </h2>
                    </div>
                    <div className="md:col-span-2 grid sm:grid-cols-2 gap-x-12 gap-y-16">
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'Regional hreflang' : 'hreflang إقليمي'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en' 
                            ? 'Verify the presence and correctness of hreflang tags for Arabic variants (ar-AE, ar-SA, ar-EG) to ensure correct regional targeting.'
                            : 'تحقق من وجود وصحة علامات hreflang للمتغيرات العربية (ar-AE، ar-SA، ar-EG) لضمان الاستهداف الإقليمي الصحيح.'}
                        </p>
                      </div>
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'Directional CSS' : 'CSS الاتجاهي'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en'
                            ? 'Identify hardcoded left/right properties and recommend logical properties (margin-inline-start) for robust RTL support.'
                            : 'حدد خصائص اليسار/اليمين المرمزة يدوياً وأوصِ بالخصائص المنطقية (margin-inline-start) لدعم RTL قوي.'}
                        </p>
                      </div>
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'Cultural Trust Signals' : 'إشارات الثقة الثقافية'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en'
                            ? 'Audit for local trust signals like TDRA/SAMA badges and regional social proof that resonate with Middle Eastern users.'
                            : 'تدقيق إشارات الثقة المحلية مثل شارات TDRA/SAMA والدليل الاجتماعي الإقليمي الذي يتردد صداه مع مستخدمي الشرق الأوسط.'}
                        </p>
                      </div>
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'AEO & SEO' : 'AEO و SEO'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en'
                            ? 'Optimize for both traditional search and AI answer engines with semantic Arabic markup and structured data.'
                            : 'تحسين لكل من البحث التقليدي ومحركات إجابات الذكاء الاصطناعي باستخدام ترميز عربي دلالي وبيانات منظمة.'}
                        </p>
                      </div>
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'Font Fallbacks' : 'بدائل الخطوط'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en'
                            ? 'Ensure your Arabic text doesn\'t fall back to generic system fonts, maintaining your brand\'s visual identity.'
                            : 'تأكد من أن نصك العربي لا يعود إلى خطوط النظام العامة، مما يحافظ على الهوية البصرية لعلامتك التجارية.'}
                        </p>
                      </div>
                      <div className="gsap-reveal">
                        <h3 className="text-lg font-semibold mb-3 dark:text-white">{lang === 'en' ? 'Regional Currencies' : 'العملات الإقليمية'}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                          {lang === 'en'
                            ? 'Verify correct formatting and symbols for GCC and other regional currencies across your product.'
                            : 'تحقق من التنسيق والرموز الصحيحة لعملات دول مجلس التعاون الخليجي والعملات الإقليمية الأخرى عبر منتجك.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security & Privacy Section - Apple Style */}
              <section className="py-16 sm:py-32 bg-white dark:bg-dark-bg">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <div className="grid md:grid-cols-2 gap-10 sm:gap-20 items-center">
                    <div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-mizan-teal/10 flex items-center justify-center mb-6 sm:mb-8">
                        <ShieldCheck size={28} className="text-mizan-teal sm:hidden" />
                        <ShieldCheck size={32} className="text-mizan-teal hidden sm:block" />
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8 leading-tight">Security is built in. Not bolted on.</h2>
                      <p className="text-mizan-text3 dark:text-dark-text3 text-xl font-medium leading-relaxed mb-8">
                        Mizan OS is designed with privacy and security at its core. Your audit data is encrypted at rest and in transit. We never use your proprietary UI data to train our public models.
                      </p>
                      <ul className="space-y-4">
                        {[
                          'End-to-end encryption for collaborative sessions',
                          'SOC2 Type II compliant infrastructure',
                          'On-premise deployment options for Enterprise',
                          'Granular access controls and SSO integration'
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-mizan-text2 dark:text-dark-text2 font-medium">
                            <CheckCircle2 size={18} className="text-mizan-teal" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-mizan-teal/5 blur-[100px] rounded-full" />
                      <img 
                        src="https://picsum.photos/seed/mizan-security/1000/1000" 
                        alt="Security Features" 
                        className="rounded-[40px] shadow-2xl relative z-10 border border-black/5 dark:border-dark-border"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Enterprise Section - Apple Style */}
              <section className="py-16 sm:py-32 border-t border-black/5 dark:border-dark-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                  <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8">Mizan for Enterprise.</h2>
                  <p className="text-mizan-text3 dark:text-dark-text3 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-16">
                    Scale your Arabic UX quality across thousands of screens and hundreds of teams. Mizan Enterprise provides the governance and automation needed for world-class digital products.
                  </p>
                  <div className="grid md:grid-cols-3 gap-8 text-left">
                    {[
                      { icon: Globe, title: 'Global Governance', desc: 'Centralize your Arabic UX standards and ensure consistency across all regional markets and product lines.' },
                      { icon: Zap, title: 'Custom AI Models', desc: 'Train private AI models on your brand voice and terminology for perfectly aligned content generation.' },
                      { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track UX quality trends across your entire portfolio with executive-level dashboards and reporting.' }
                    ].map((item, i) => (
                      <div key={i} className="bg-mizan-off dark:bg-dark-surface p-6 sm:p-10 rounded-[24px] sm:rounded-[40px] border border-black/5 dark:border-dark-border">
                        <div className="w-12 h-12 rounded-xl bg-mizan-blue/10 flex items-center justify-center mb-4 sm:mb-6">
                          <item.icon size={24} className="text-mizan-blue" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 dark:text-white">{item.title}</h3>
                        <p className="text-mizan-text3 dark:text-dark-text3 text-sm leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Developer Experience Section - Apple Style */}
              <section className="py-16 sm:py-32 bg-mizan-off dark:bg-dark-surface">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <div className="grid md:grid-cols-2 gap-10 sm:gap-20 items-center">
                    <div className="order-2 md:order-1">
                      <div className="bg-black dark:bg-dark-bg rounded-2xl sm:rounded-3xl p-4 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed text-mizan-teal/90 shadow-2xl overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4 opacity-30">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="text-white/30 mb-2"># Install Mizan CLI</div>
                        <div className="text-white mb-4">npm install -g @mizan/cli</div>
                        <div className="text-white/30 mb-2"># Run audit on local dev server</div>
                        <div className="text-white mb-4">mizan audit http://localhost:3000</div>
                        <div className="text-white/30 mb-2"># Output results to JSON</div>
                        <div className="text-white">mizan audit --format json {'>'} report.json</div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="w-16 h-16 rounded-2xl bg-mizan-blue/10 flex items-center justify-center mb-8">
                        <Terminal size={32} className="text-mizan-blue" />
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight dark:text-white mb-6 sm:mb-8 leading-tight">Built for developers.</h2>
                      <p className="text-mizan-text3 dark:text-dark-text3 text-lg sm:text-xl font-medium leading-relaxed mb-6 sm:mb-8">
                        Integrate Mizan OS into your existing workflow with our powerful CLI, GitHub Actions, and robust API. Catch Arabic UX regressions before they reach production.
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">CI/CD Ready</h3>
                          <p className="text-sm text-mizan-text3 dark:text-dark-text3">Automate audits on every pull request with our official GitHub Action.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">Extensible API</h3>
                          <p className="text-sm text-mizan-text3 dark:text-dark-text3">Build custom dashboards and tools on top of our Arabic UX intelligence.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Audit Input Section - Moved to bottom as a "Get Started" */}
              <section id="audit-input-section" className="py-20 sm:py-40 bg-mizan-off dark:bg-dark-surface rounded-[32px] sm:rounded-[60px] mb-16 sm:mb-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                  <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight dark:text-white mb-10 sm:mb-16">Ready to audit?</h2>
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8 text-left">
                    <div className="bg-white dark:bg-dark-surface2 p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-mizan border border-black/5 dark:border-dark-border">
                      <h3 className="text-2xl font-semibold mb-4 dark:text-white">Audit a live URL.</h3>
                      <div className="bg-mizan-off dark:bg-dark-bg rounded-2xl p-2 flex items-center border border-black/5 dark:border-dark-border">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && startAudit()}
                          placeholder="https://your-product.com"
                          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm dark:text-white font-medium"
                        />
                        <button
                          onClick={() => startAudit()}
                          className="bg-mizan-blue text-white p-3 rounded-xl hover:bg-mizan-blue-dark transition-all"
                        >
                          <ArrowRight size={20} className="rtl:rotate-180" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-dark-surface2 p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-mizan border border-black/5 dark:border-dark-border">
                      <h3 className="text-xl sm:text-2xl font-semibold mb-4 dark:text-white">Figma Integration.</h3>
                      <div className="bg-mizan-off dark:bg-dark-bg rounded-2xl p-2 flex items-center border border-black/5 dark:border-dark-border">
                        <input
                          type="text"
                          value={figmaUrl}
                          onChange={(e) => setFigmaUrl(e.target.value)}
                          placeholder="Figma File URL"
                          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm dark:text-white font-medium"
                        />
                        <button
                          onClick={handleFigmaAudit}
                          className="bg-black dark:bg-white dark:text-black text-white p-3 rounded-xl hover:opacity-80 transition-all"
                        >
                          <Figma size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pillars Section - Apple Style */}
              <section className="py-32 border-t border-black/5 dark:border-dark-border">
                <div className="max-w-5xl mx-auto px-6">
                  <h2 className="text-4xl font-semibold tracking-tight dark:text-white mb-20 text-center">The 6 Pillars of Arabic UX.</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CHECKPOINTS.map((cp, i) => (
                      <motion.div
                        key={cp.id}
                        whileHover={{ y: -10 }}
                        onClick={() => {
                          setActivePillar(cp.id);
                          setScreen('pillar-detail');
                        }}
                        className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-mizan-blue/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                          <cp.icon size={28} className="text-mizan-blue" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 dark:text-white">{cp.name}</h3>
                        <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium mb-6">{cp.desc}</p>
                        <div className="flex items-center gap-2 text-mizan-blue text-sm font-semibold">
                          Explore Pillar <ArrowRight size={16} className="rtl:rotate-180" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Market Insights Section */}
              <section className="py-16 sm:py-32 bg-black text-white rounded-[32px] sm:rounded-[60px] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-mizan-blue/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-10 sm:gap-20 items-center">
                    <div>
                      <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-6 sm:mb-8 leading-tight">Intelligence for every market.</h2>
                      <p className="text-white/60 text-lg sm:text-xl font-medium leading-relaxed mb-8 sm:mb-12">
                        Mizan OS understands the nuances of 22 Arabic-speaking markets. From the formality of the Levant to the specific dialects of the Gulf, your product will speak their language.
                      </p>
                      <button 
                        onClick={() => setScreen('intelligence')}
                        className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all"
                      >
                        Explore Market Intelligence
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {MARKETS.slice(0, 4).map(market => (
                        <div key={market.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                          <div className="text-2xl mb-3">{market.flag}</div>
                          <div className="font-bold text-lg mb-1">{market.name}</div>
                          <div className="text-xs text-white/40 uppercase tracking-widest">{market.dialect}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* How it Works Section */}
              <section className="py-16 sm:py-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight dark:text-white mb-12 sm:mb-20 text-center">Simple. Powerful. Arabic-first.</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-16">
                    {[
                      { step: '01', title: 'Connect', desc: 'Paste a URL, upload a Figma file, or drop a screenshot. Mizan OS instantly maps your product layers.' },
                      { step: '02', title: 'Analyze', desc: 'Our Arabic-first engine runs thousands of checks across RTL, governance, and accessibility.' },
                      { step: '03', title: 'Optimize', desc: 'Get actionable recommendations and automated fixes to elevate your Arabic UX to world-class standards.' }
                    ].map((item, i) => (
                      <div key={i} className="relative">
                        <div className="text-4xl sm:text-6xl font-semibold text-mizan-blue/10 dark:text-white/5 mb-4 sm:mb-6">{item.step}</div>
                        <h3 className="text-2xl font-semibold mb-4 dark:text-white">{item.title}</h3>
                        <p className="text-mizan-text3 dark:text-dark-text3 text-lg font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="py-16 sm:py-32 bg-mizan-off dark:bg-dark-surface rounded-[32px] sm:rounded-[60px] mb-16 sm:mb-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
                    <div className="bg-white dark:bg-dark-surface2 p-8 sm:p-12 rounded-[24px] sm:rounded-[40px] shadow-sm border border-black/5 dark:border-dark-border">
                      <div className="flex gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-4 h-4 rounded-full bg-mizan-teal" />)}
                      </div>
                      <p className="text-2xl font-medium leading-relaxed dark:text-white mb-10">
                        "Mizan OS has completely transformed how we approach localization. It's not just about translation anymore; it's about genuine Arabic UX."
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-mizan-off3" />
                        <div>
                          <div className="font-bold dark:text-white">Sarah Al-Rashid</div>
                          <div className="text-sm text-mizan-text3">Head of Design, STC</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-dark-surface2 p-12 rounded-[40px] shadow-sm border border-black/5 dark:border-dark-border">
                      <div className="flex gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-4 h-4 rounded-full bg-mizan-blue" />)}
                      </div>
                      <p className="text-2xl font-medium leading-relaxed dark:text-white mb-10">
                        "The RTL mirroring detection is magic. It saved our engineering team weeks of manual QA and prevented dozens of critical launch bugs."
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-mizan-off3" />
                        <div>
                          <div className="font-bold dark:text-white">Omar Hassan</div>
                          <div className="text-sm text-mizan-text3">Product Director, Noon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {screen === 'pillar-detail' && activePillar && (
            <motion.div
              key="pillar-detail"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <PillarDetailView pillarId={activePillar} onBack={() => setScreen('input')} />
            </motion.div>
          )}

          {screen === 'loading' && (
            <motion.section
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="py-24 text-center"
            >
              <div className="relative w-44 h-44 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border border-mizan-blue/10 dark:border-mizan-blue/20 animate-[ping_3s_ease-in-out_infinite]" />
                <div className="absolute inset-6 rounded-full border border-mizan-blue/10 dark:border-mizan-blue/20 animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                <div className="absolute inset-12 rounded-full border border-mizan-teal/10 dark:border-mizan-teal/20 animate-[ping_3s_ease-in-out_infinite_1s]" />
                <div className="absolute inset-2 rounded-full s-sweep animate-spin" />
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-mizan-blue to-mizan-teal shadow-lg shadow-mizan-blue/20 flex items-center justify-center text-white font-arabic text-2xl">
                  م
                </div>
              </div>
              
              <h2 className="font-dm-200 text-2xl tracking-tight mb-2 dark:text-dark-text">Analyzing Arabic UX layers</h2>
              <p className="text-sm text-mizan-text3 dark:text-dark-text3 font-manrope-300 mb-8">Performing genuine detection logic…</p>
              
              <div className="max-w-md mx-auto bg-mizan-off dark:bg-dark-surface border border-mizan-off3 dark:border-dark-border rounded-xl p-6 text-left min-h-[160px]">
                {activeLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-baseline gap-3 text-[11px] leading-relaxed mb-1 ${
                      i === activeLogs.length - 1 ? 'text-mizan-blue font-medium' : 'text-mizan-text2 dark:text-dark-text2'
                    }`}
                  >
                    <span className="text-[9px]">{log.startsWith('✓') ? '' : '›'}</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {screen === 'results' && results && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="py-12 pb-24"
              id="audit-report"
            >
              <div className="flex items-center justify-between mb-12 no-print">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  New audit
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setScreen('collaboration')}
                    className="flex items-center gap-2 text-sm text-mizan-blue font-semibold px-5 py-2 bg-mizan-blue/5 border border-mizan-blue/10 rounded-full hover:bg-mizan-blue/10 transition-all"
                  >
                    <Users size={16} /> Collaborative Session
                  </button>
                  <div className="w-px h-4 bg-mizan-off3 dark:bg-dark-border" />
                  <button
                    onClick={shareAudit}
                    className="flex items-center gap-2 text-sm text-mizan-text3 dark:text-dark-text3 hover:text-mizan-blue transition-colors px-4 py-2 border border-mizan-off3 dark:border-dark-border rounded-full"
                  >
                    <Share2 size={14} /> {isSharing ? 'Copied!' : 'Share Audit'}
                  </button>
                  <button
                    onClick={exportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-sm text-white bg-mizan-blue hover:bg-mizan-blue-dark transition-colors px-5 py-2 rounded-full shadow-lg shadow-mizan-blue/20 disabled:opacity-50"
                  >
                    {isExporting ? <RefreshCcw size={14} className="animate-spin" /> : <Download size={14} />}
                    {isExporting ? 'Exporting...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => startAudit(results.url)}
                    className="flex items-center gap-2 text-sm text-mizan-text3 dark:text-dark-text3 hover:text-mizan-blue transition-colors px-4 py-2 border border-mizan-off3 dark:border-dark-border rounded-full"
                  >
                    <RefreshCcw size={14} /> Re-audit
                  </button>
                </div>
              </div>

              {/* PDF Branding Header (Hidden in UI) */}
              <div className="hidden print-only mb-12 border-b-2 border-mizan-blue pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-arabic text-4xl text-mizan-blue">ميزان</span>
                    <div className="w-px h-10 bg-mizan-off3" />
                    <span className="text-3xl font-semibold tracking-tight uppercase">Mizan</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tracking-widest text-mizan-blue uppercase mb-1">Official UX Audit Report</div>
                    <div className="text-[10px] text-mizan-text3 uppercase tracking-widest mb-1">by Schroeder Technologies</div>
                    <div className="text-[10px] text-mizan-text4 uppercase tracking-widest">Confidential & Proprietary</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl shadow-mizan p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-12 items-center mb-8 transition-colors duration-300">
                <div>
                  <div className="text-[12px] font-semibold tracking-[0.1em] text-mizan-text4 dark:text-dark-text3 uppercase mb-2">Audit target</div>
                  <h2 className="text-3xl font-semibold tracking-tight mb-2 truncate max-w-md dark:text-white">{results.url}</h2>
                  <p className="text-sm text-mizan-text4 dark:text-dark-text3 mb-8">{results.timestamp}</p>
                  
                  <div className="flex flex-wrap gap-6">
                    <Tally count={Object.values(results.issues).flat().filter((i: Issue) => i.type === 'fail').length} label="Critical" color="bg-mizan-red" />
                    <Tally count={Object.values(results.issues).flat().filter((i: Issue) => i.type === 'warn').length} label="Warnings" color="bg-mizan-amber" />
                    <Tally count={Object.values(results.issues).flat().filter((i: Issue) => i.type === 'pass').length} label="Passed" color="bg-mizan-teal" />
                  </div>
                </div>
                
                <div className="text-center">
                  <ScoreCircle score={results.overallScore} />
                  <div className="text-[12px] font-semibold tracking-[0.1em] text-mizan-text4 dark:text-dark-text3 uppercase mt-4">Overall Score</div>
                </div>
              </div>

              <div className="text-[12px] font-semibold tracking-[0.1em] text-mizan-text4 dark:text-dark-text3 uppercase mb-6 mt-12">Checkpoint Results</div>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {CHECKPOINTS.map((cp, i) => (
                  <CheckpointCard 
                    key={cp.id} 
                    checkpoint={cp} 
                    score={results.scores[cp.id]} 
                    index={i + 1}
                    issues={results.issues[cp.id]}
                  />
                ))}
              </div>

              <div className="bg-mizan-off dark:bg-dark-surface border border-mizan-off3 dark:border-dark-border rounded-3xl p-8 md:p-12 mb-12 transition-colors duration-300">
                <div className="flex items-center gap-4 mb-10">
                  <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Top Recommendations</h3>
                  <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {results.recommendations.map((reco, i) => (
                    <RecommendationCard key={i} reco={reco} index={i} />
                  ))}
                </div>

                <div className="mt-16">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Remediation Checklist</h3>
                    <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                  </div>
                  <div className="overflow-hidden border border-mizan-off3 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-surface2 transition-colors duration-300">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-mizan-off dark:bg-dark-surface border-b border-mizan-off3 dark:border-dark-border text-mizan-text4 dark:text-dark-text3 uppercase tracking-wider">
                        <tr>
                          <th className="px-8 py-4 font-semibold">Requirement</th>
                          <th className="px-8 py-4 font-semibold">Status</th>
                          <th className="px-8 py-4 font-semibold">Action Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mizan-off3 dark:divide-dark-border">
                        {Object.entries(results.issues).map(([key, issues]: [string, any]) => (
                          issues.filter((i: any) => i.type !== 'pass').map((issue: any, idx: number) => (
                            <tr key={`${key}-${idx}`} className="hover:bg-mizan-off/50 dark:hover:bg-dark-surface/50 transition-colors">
                              <td className="px-8 py-6 font-semibold text-mizan-text dark:text-dark-text uppercase tracking-tight">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  issue.type === 'fail' ? 'bg-mizan-red/10 text-mizan-red' : 'bg-mizan-amber/10 text-mizan-amber'
                                }`}>
                                  {issue.type === 'fail' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                                  {issue.type}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-mizan-text3 dark:text-dark-text3 leading-relaxed">
                                <div className="font-medium mb-2">{issue.text}</div>
                                {issue.selector && (
                                  <div className="mt-2 text-[10px] font-mono bg-mizan-off dark:bg-dark-surface p-2 rounded border border-black/5 dark:border-dark-border break-all">
                                    <span className="text-mizan-blue dark:text-mizan-teal font-bold mr-2">PINPOINT:</span>
                                    {issue.selector}
                                  </div>
                                )}
                                {issue.snippet && (
                                  <div className="mt-1 text-[10px] font-mono bg-mizan-text dark:bg-black text-white/70 p-2 rounded overflow-x-auto whitespace-pre">
                                    <span className="text-mizan-teal font-bold mr-2">SNIPPET:</span>
                                    {issue.snippet}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-16 pt-16 border-t border-mizan-off3 dark:border-dark-border">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Technical Compliance Summary</h3>
                    <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHECKPOINTS.map((cp) => (
                      <div key={cp.id} className="p-6 bg-white dark:bg-dark-surface2 border border-mizan-off3 dark:border-dark-border rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-mizan-text4">{cp.name}</span>
                          <span className={`text-sm font-bold ${results.scores[cp.id] >= 80 ? 'text-mizan-teal' : results.scores[cp.id] >= 50 ? 'text-mizan-amber' : 'text-mizan-red'}`}>
                            {results.scores[cp.id]}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          {results.issues[cp.id].map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-mizan-text3 dark:text-dark-text3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${issue.type === 'fail' ? 'bg-mizan-red' : issue.type === 'warn' ? 'bg-mizan-amber' : 'bg-mizan-teal'}`} />
                              <span>{issue.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural Intelligence Layer */}
                {results.culturalIntelligence && (
                  <div className="mt-16 pt-16 border-t border-mizan-off3 dark:border-dark-border">
                    <div className="flex items-center gap-4 mb-10">
                      <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Cultural Intelligence</h3>
                      <div className="px-3 py-1 bg-mizan-teal/10 text-mizan-teal text-[10px] font-bold uppercase tracking-widest rounded-full">Differentiator</div>
                      <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                    </div>
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-2xl p-6 text-center">
                        <div className="text-4xl font-bold tracking-tight mb-1 dark:text-white">{results.culturalIntelligence.nativeFeelScore}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4">Native Feel</div>
                        <div className="w-full h-1.5 bg-mizan-off3 dark:bg-dark-surface rounded-full mt-3">
                          <div className={`h-full rounded-full ${results.culturalIntelligence.nativeFeelScore >= 70 ? 'bg-mizan-teal' : results.culturalIntelligence.nativeFeelScore >= 40 ? 'bg-mizan-amber' : 'bg-mizan-red'}`} style={{ width: `${results.culturalIntelligence.nativeFeelScore}%` }} />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-2xl p-6 text-center">
                        <div className="text-4xl font-bold tracking-tight mb-1 dark:text-white">{results.culturalIntelligence.trustPerceptionScore}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4">Trust Perception</div>
                        <div className="w-full h-1.5 bg-mizan-off3 dark:bg-dark-surface rounded-full mt-3">
                          <div className={`h-full rounded-full ${results.culturalIntelligence.trustPerceptionScore >= 70 ? 'bg-mizan-teal' : results.culturalIntelligence.trustPerceptionScore >= 40 ? 'bg-mizan-amber' : 'bg-mizan-red'}`} style={{ width: `${results.culturalIntelligence.trustPerceptionScore}%` }} />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-2xl p-6 text-center">
                        <div className="text-4xl font-bold tracking-tight mb-1 dark:text-white">{results.culturalIntelligence.toneAppropriateness}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4">Tone Score</div>
                        <div className="w-full h-1.5 bg-mizan-off3 dark:bg-dark-surface rounded-full mt-3">
                          <div className={`h-full rounded-full ${results.culturalIntelligence.toneAppropriateness >= 70 ? 'bg-mizan-teal' : results.culturalIntelligence.toneAppropriateness >= 40 ? 'bg-mizan-amber' : 'bg-mizan-red'}`} style={{ width: `${results.culturalIntelligence.toneAppropriateness}%` }} />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-2xl p-6 text-center">
                        <div className="text-4xl font-bold tracking-tight mb-1 dark:text-white">{results.culturalIntelligence.dialectAnalysis.consistency}%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4">Dialect Consistency</div>
                        <div className="mt-2 text-[10px] text-mizan-text3">
                          <span className="font-semibold">Detected:</span> {results.culturalIntelligence.dialectAnalysis.detected}
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      {Object.entries(results.culturalIntelligence.regionScores).map(([region, score]) => (
                        <div key={region} className="flex items-center justify-between bg-mizan-off dark:bg-dark-surface2 rounded-xl px-5 py-3 border border-black/5 dark:border-dark-border">
                          <span className="text-xs font-bold uppercase tracking-widest text-mizan-text3">{region}</span>
                          <span className={`text-sm font-bold ${(score as number) >= 70 ? 'text-mizan-teal' : (score as number) >= 40 ? 'text-mizan-amber' : 'text-mizan-red'}`}>{score as number}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk & Revenue Impact Dashboard */}
                {results.riskMetrics && (
                  <div className="mt-16 pt-16 border-t border-mizan-off3 dark:border-dark-border">
                    <div className="flex items-center gap-4 mb-10">
                      <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Risk & Revenue Impact</h3>
                      <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        results.riskMetrics.revenueRiskLevel === 'critical' ? 'bg-mizan-red/10 text-mizan-red' :
                        results.riskMetrics.revenueRiskLevel === 'high' ? 'bg-mizan-amber/10 text-mizan-amber' :
                        'bg-mizan-blue/10 text-mizan-blue'
                      }`}>{results.riskMetrics.revenueRiskLevel} risk</div>
                      <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-mizan-red/5 to-mizan-red/[0.02] dark:from-mizan-red/10 dark:to-transparent border border-mizan-red/10 rounded-2xl p-8">
                        <div className="text-5xl font-bold text-mizan-red mb-2">{results.riskMetrics.culturalRiskScore}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-mizan-red/60 mb-4">Cultural Risk Score</div>
                        <div className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">Higher scores indicate greater misalignment with Arabic cultural expectations. Target: below 25.</div>
                      </div>
                      <div className="bg-gradient-to-br from-mizan-amber/5 to-mizan-amber/[0.02] dark:from-mizan-amber/10 dark:to-transparent border border-mizan-amber/10 rounded-2xl p-8">
                        <div className="text-5xl font-bold text-mizan-amber mb-2">{results.riskMetrics.userDropoffPrediction}%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-mizan-amber/60 mb-4">Predicted User Drop-off</div>
                        <div className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">Estimated percentage of Arabic-speaking users who will abandon due to UX friction.</div>
                      </div>
                      <div className="bg-gradient-to-br from-mizan-blue/5 to-mizan-blue/[0.02] dark:from-mizan-blue/10 dark:to-transparent border border-mizan-blue/10 rounded-2xl p-8">
                        <div className="text-5xl font-bold text-mizan-blue mb-2">-{results.riskMetrics.brandTrustImpact}%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-mizan-blue/60 mb-4">Brand Trust Impact</div>
                        <div className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">Estimated reduction in brand trust perception among MENA market users.</div>
                      </div>
                    </div>
                    <div className="bg-mizan-red/[0.03] dark:bg-mizan-red/[0.06] border border-mizan-red/10 rounded-2xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <AlertCircle size={20} className="text-mizan-red" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-mizan-red">Revenue Risk Statements</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {results.riskMetrics.riskStatements.map((statement, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/50 dark:bg-dark-surface/50 rounded-xl px-5 py-4 border border-mizan-red/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-mizan-red mt-2 shrink-0" />
                            <span className="text-sm font-medium text-mizan-text dark:text-dark-text leading-relaxed">{statement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Certification Status */}
                {results.certification && (
                  <div className="mt-16 pt-16 border-t border-mizan-off3 dark:border-dark-border">
                    <div className="flex items-center gap-4 mb-10">
                      <h3 className="text-2xl font-semibold tracking-tight dark:text-white">Certification Status</h3>
                      <div className="flex-1 h-px bg-mizan-off3 dark:bg-dark-border" />
                    </div>
                    <div className={`rounded-[28px] p-10 border-2 relative overflow-hidden ${
                      results.certification.tier === 'platinum' ? 'bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-blue-200 dark:border-blue-800' :
                      results.certification.tier === 'gold' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800' :
                      results.certification.tier === 'silver' ? 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 border-slate-300 dark:border-slate-700' :
                      'bg-mizan-off dark:bg-dark-surface border-mizan-off3 dark:border-dark-border'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${
                            results.certification.tier === 'platinum' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                            results.certification.tier === 'gold' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                            results.certification.tier === 'silver' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' :
                            'bg-mizan-off2 text-mizan-text3'
                          }`}>
                            <Award size={14} />
                            {results.certification.tier === 'none' ? 'Not Eligible' : `${results.certification.tier} Certified`}
                          </div>
                          <h4 className="text-3xl font-bold tracking-tight dark:text-white mb-2">
                            Mizan Score: {results.certification.score}
                          </h4>
                          <p className="text-sm text-mizan-text3 dark:text-dark-text3 mb-6">
                            {results.certification.tier === 'platinum' ? 'Outstanding Arabic UX. This product sets the standard for digital excellence in the MENA region.' :
                             results.certification.tier === 'gold' ? 'Excellent Arabic UX. This product demonstrates strong commitment to Arabic-first design principles.' :
                             results.certification.tier === 'silver' ? 'Adequate Arabic UX. This product meets minimum standards but has room for significant improvement.' :
                             'This product does not yet meet the minimum standards for Mizan certification. Address critical issues to become eligible.'}
                          </p>
                          {results.certification.verificationId && results.certification.tier !== 'none' && (
                            <div className="text-[10px] font-mono text-mizan-text4 uppercase tracking-widest">
                              Verification ID: {results.certification.verificationId}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-7xl font-bold opacity-10 ${
                            results.certification.tier === 'platinum' ? 'text-blue-600' :
                            results.certification.tier === 'gold' ? 'text-amber-500' :
                            results.certification.tier === 'silver' ? 'text-slate-400' :
                            'text-mizan-off3'
                          }`}>
                            {results.certification.tier === 'none' ? '—' : results.certification.tier.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 grid md:grid-cols-3 gap-3">
                        {results.certification.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/50 dark:bg-dark-surface/30 rounded-xl px-4 py-3 border border-black/5 dark:border-white/5">
                            {req.met ? <CheckCircle2 size={16} className="text-mizan-teal shrink-0" /> : <XCircle size={16} className="text-mizan-red shrink-0" />}
                            <span className="text-xs font-semibold dark:text-dark-text2">{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-16 pt-16 border-t border-mizan-off3 dark:border-dark-border print-only">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight">Audit Metadata</h3>
                    <div className="flex-1 h-px bg-mizan-off3" />
                  </div>
                  <div className="grid grid-cols-2 gap-12 text-sm">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-2">Engine Version</div>
                      <div className="font-mono">Mizan OS v4.2.0-stable</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-2">Audit ID</div>
                      <div className="font-mono">{results.id}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-2">Linguistic Model</div>
                      <div className="font-mono">Mizan NLP Engine (Arabic-Optimized)</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-2">Verification Hash</div>
                      <div className="font-mono text-[10px] break-all">sha256:7f8e9d0c1b2a3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 no-print">
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="bg-mizan-blue hover:bg-mizan-blue-dark text-white px-10 py-4 rounded-full text-base font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? <RefreshCcw size={18} className="animate-spin" /> : <Download size={18} />}
                  {isExporting ? 'Generating Report...' : 'Export PDF Report'}
                </button>
                <button
                  onClick={reset}
                  className="bg-transparent border border-mizan-off3 hover:border-mizan-blue hover:text-mizan-blue text-mizan-text3 px-10 py-4 rounded-full text-base font-medium transition-all"
                >
                  New Audit
                </button>
              </div>
            </motion.section>
          )}
          {screen === 'collaboration' && results && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button onClick={() => setScreen('results')} className="flex items-center gap-2 text-xs text-mizan-text3 hover:text-mizan-blue transition-colors mb-6">
                <ChevronLeft size={14} className="rtl:rotate-180" /> Back to report
              </button>
              <CollaborationView results={results} />
            </motion.div>
          )}

          {screen === 'intelligence' && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <IntelligenceView />
            </motion.div>
          )}

          {screen === 'regression' && (
            <motion.div
              key="regression"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <RegressionView />
            </motion.div>
          )}

          {screen === 'design-system' && (
            <motion.div
              key="design-system"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <DesignSystemView />
            </motion.div>
          )}

          {screen === 'certification' && (
            <motion.div
              key="certification"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CertificationView />
            </motion.div>
          )}

          {screen === 'governance' && (
            <motion.div
              key="governance"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <GovernanceView />
            </motion.div>
          )}

          {screen === 'benchmark' && (
            <motion.div
              key="benchmark"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <BenchmarkView />
            </motion.div>
          )}

          {screen === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <FeaturesView />
            </motion.div>
          )}

          {screen === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <SupportView setScreen={setScreen} />
            </motion.div>
          )}

          {screen === 'ticket' && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <TicketView onBack={() => setScreen('support')} />
            </motion.div>
          )}

          {screen === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <DocsView onBack={() => setScreen('support')} />
            </motion.div>
          )}

          {screen === 'ai-expert' && (
            <motion.div
              key="ai-expert"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <AIExpertView onBack={() => setScreen('support')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-black/5 dark:border-dark-border mt-32 no-print transition-colors duration-300">
        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-mizan-blue to-mizan-teal py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              {lang === 'en' ? 'The standard that defines digital legitimacy in the Arabic world.' : 'المعيار الذي يحدد الشرعية الرقمية في العالم العربي.'}
            </h2>
            <p className="text-white/70 text-base sm:text-lg font-medium mb-10 max-w-2xl mx-auto">
              {lang === 'en' ? 'Join hundreds of enterprises building Arabic-first digital products. Get certified. Stay compliant. Build trust.' : 'انضم إلى مئات المؤسسات التي تبني منتجات رقمية عربية أولاً. احصل على الشهادة. ابق ملتزماً. ابنِ الثقة.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => startAudit()} className="px-10 py-4 bg-white text-mizan-blue rounded-full font-bold text-base shadow-2xl hover:scale-105 transition-all">
                {lang === 'en' ? 'Start Free Audit' : 'ابدأ التدقيق المجاني'}
              </button>
              <button onClick={() => setScreen('certification')} className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-base hover:bg-white/20 transition-all">
                {lang === 'en' ? 'Get Certified' : 'احصل على الشهادة'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="bg-mizan-text dark:bg-black py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Brand Block */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" rx="16" fill="url(#ft-grad)"/>
                  <path d="M32 14L44 26H38V38H44L32 50L20 38H26V26H20L32 14Z" fill="white" fillOpacity="0.95"/>
                  <circle cx="32" cy="32" r="4" fill="white"/>
                  <defs><linearGradient id="ft-grad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#0071E3"/><stop offset="1" stopColor="#009E91"/></linearGradient></defs>
                </svg>
                <span className="text-xl font-bold text-white tracking-tight">Mizan</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Defining the standard for culturally native digital products.
              </p>
            </div>

            {/* Footer Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 sm:gap-12 mb-16">
              {/* Product */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Product</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><button onClick={reset} className="hover:text-white transition-colors">Audit Engine</button></li>
                  <li><button onClick={() => setScreen('features')} className="hover:text-white transition-colors">Features</button></li>
                  <li><button onClick={() => setScreen('intelligence')} className="hover:text-white transition-colors">Cultural Intelligence</button></li>
                  <li><button onClick={() => setScreen('certification')} className="hover:text-white transition-colors">Certification</button></li>
                  <li><button onClick={() => setScreen('design-system')} className="hover:text-white transition-colors">Design System</button></li>
                  <li><button onClick={() => setScreen('benchmark')} className="hover:text-white transition-colors">Benchmarks</button></li>
                  <li><button onClick={() => setScreen('regression')} className="hover:text-white transition-colors">Regression Testing</button></li>
                </ul>
              </div>

              {/* Developers */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Developers</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><button onClick={() => setScreen('docs')} className="hover:text-white transition-colors">Documentation</button></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">SDKs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>

              {/* Standards */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Standards</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><button onClick={() => setScreen('certification')} className="hover:text-white transition-colors">Mizan Certification</button></li>
                  <li><a href="#" className="hover:text-white transition-colors">Certification Registry</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Compliance Framework</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Company</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                  <li><button onClick={() => setScreen('support')} className="hover:text-white transition-colors">Contact</button></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Legal</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Data Processing Agreement</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>

              {/* Social / Presence */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Social</h4>
                <ul className="space-y-3 text-sm font-medium text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a></li>
                  <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </a></li>
                </ul>
              </div>
            </div>

            {/* Trust & Alignment */}
            <div className="border-t border-white/5 pt-12 mb-12">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">Trust & Alignment</h4>
              <div className="flex flex-wrap gap-4">
                {['Dubai Digital Authority', 'TDRA', 'SAMA', 'NDMO', 'WCAG 2.2 AA', 'ISO 30071-1'].map((org) => (
                  <div key={org} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full text-xs font-semibold text-white/30">{org}</div>
                ))}
              </div>
              <p className="text-xs text-white/20 mt-6 leading-relaxed max-w-2xl">
                Built in alignment with regional digital transformation initiatives across the UAE and GCC.
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
              <div className="text-xs font-medium text-white/25 text-center md:text-left">
                &copy; 2026 Mizan OS, a product of Schroeder Technologies. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3.5 bg-mizan-blue text-white rounded-full shadow-mizan-md hover:bg-mizan-blue-dark transition-all no-print"
            aria-label="Scroll to top"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md no-print ${
              toast.type === 'success' ? 'bg-mizan-teal/90 border-mizan-teal/20 text-white' :
              toast.type === 'error' ? 'bg-mizan-red/90 border-mizan-red/20 text-white' :
              'bg-mizan-blue/90 border-mizan-blue/20 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tally({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-mizan-text3 dark:text-dark-text3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span>{count} {label}</span>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const colorClass = score < 40 ? 'stroke-mizan-red' : score < 60 ? 'stroke-mizan-amber' : score < 80 ? 'stroke-mizan-teal' : 'stroke-mizan-blue';
  const textClass = score < 40 ? 'text-mizan-red' : score < 60 ? 'text-mizan-amber' : score < 80 ? 'text-mizan-teal' : 'text-mizan-blue';
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-mizan-off3 dark:text-dark-surface2" />
        <motion.circle
          cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray="289"
          initial={{ strokeDashoffset: 289 }}
          animate={{ strokeDashoffset: 289 * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-semibold leading-none tracking-tight ${textClass}`}>{score}</span>
        <span className="text-[10px] font-bold text-mizan-text4 dark:text-dark-text3 mt-1 uppercase tracking-widest">/100</span>
      </div>
    </div>
  );
}

const CheckpointCard: React.FC<{ checkpoint: any; score: number; index: number; issues: Issue[] }> = ({ checkpoint, score, index, issues }) => {
  const colorClass = score < 40 ? 'text-mizan-red' : score < 60 ? 'text-mizan-amber' : score < 80 ? 'text-mizan-teal' : 'text-mizan-blue';
  const barClass = score < 40 ? 'bg-mizan-red' : score < 60 ? 'bg-mizan-amber' : score < 80 ? 'bg-mizan-teal' : 'bg-mizan-blue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl shadow-mizan overflow-hidden hover:shadow-mizan-md transition-all duration-500"
    >
      <div className="p-8 flex items-start gap-6">
        <div className="text-[12px] font-bold text-mizan-text4 dark:text-dark-text3 tracking-widest mt-1">
          {index < 10 ? `0${index}` : index}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold tracking-tight mb-2 dark:text-white">{checkpoint.name}</h4>
          <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">{checkpoint.desc}</p>
        </div>
        <div className={`text-3xl font-semibold tracking-tight ${colorClass}`}>{score}</div>
      </div>
      
      <div className="h-1 bg-mizan-off3 dark:bg-dark-surface2 relative">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className={`h-full ${barClass}`}
        />
      </div>

      <div className="p-8 pt-6 flex flex-col gap-5">
        {issues.map((issue, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-start gap-3 text-sm leading-relaxed text-mizan-text2 dark:text-dark-text2">
              {issue.type === 'fail' && <XCircle size={16} className="text-mizan-red mt-0.5 shrink-0" />}
              {issue.type === 'warn' && <AlertCircle size={16} className="text-mizan-amber mt-0.5 shrink-0" />}
              {issue.type === 'pass' && <CheckCircle2 size={16} className="text-mizan-teal mt-0.5 shrink-0" />}
              <div className="flex-1">
                <span>{issue.text}</span>
                {issue.severity && issue.type !== 'pass' && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    issue.severity === 'critical' ? 'bg-mizan-red/10 text-mizan-red' :
                    issue.severity === 'high' ? 'bg-mizan-amber/10 text-mizan-amber' :
                    issue.severity === 'medium' ? 'bg-mizan-blue/10 text-mizan-blue' :
                    'bg-mizan-off2 text-mizan-text3'
                  }`}>{issue.severity}</span>
                )}
              </div>
            </div>
            {issue.businessImpact && issue.type !== 'pass' && (
              <div className="ml-7 flex items-start gap-2 bg-mizan-red/[0.03] dark:bg-mizan-red/[0.06] border border-mizan-red/10 rounded-xl px-4 py-3">
                <TrendingUp size={14} className="text-mizan-red mt-0.5 shrink-0" />
                <span className="text-xs font-semibold text-mizan-red/80">{issue.businessImpact}</span>
              </div>
            )}
            {(issue.selector || issue.snippet) && issue.type !== 'pass' && (
              <div className="ml-7 space-y-1">
                {issue.selector && (
                  <div className="text-[10px] font-mono text-mizan-blue dark:text-mizan-teal opacity-80 break-all">
                    {issue.selector}
                  </div>
                )}
                {issue.snippet && (
                  <div className="text-[9px] font-mono bg-mizan-off dark:bg-dark-surface2 p-1.5 rounded border border-black/5 dark:border-dark-border overflow-x-auto whitespace-pre text-mizan-text3">
                    {issue.snippet}
                  </div>
                )}
              </div>
            )}
            {issue.codeFix && issue.type !== 'pass' && (
              <div className="ml-7 mt-1 bg-black dark:bg-dark-bg rounded-xl overflow-hidden border border-black/10 dark:border-dark-border">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Code size={12} className="text-mizan-teal" />
                    <span className="text-[10px] font-bold text-mizan-teal uppercase tracking-widest">Auto-Fix Available</span>
                    <span className="text-[9px] font-mono text-white/30 uppercase">{issue.codeFix.language}</span>
                  </div>
                </div>
                <div className="p-3 text-[10px] font-mono leading-relaxed">
                  <div className="text-xs font-semibold text-white/50 mb-2">{issue.codeFix.description}</div>
                  <div className="bg-mizan-red/10 text-red-400 rounded px-3 py-2 mb-2 overflow-x-auto whitespace-pre">
                    <span className="text-red-500/50 mr-2">-</span>{issue.codeFix.before}
                  </div>
                  <div className="bg-mizan-teal/10 text-green-400 rounded px-3 py-2 overflow-x-auto whitespace-pre">
                    <span className="text-green-500/50 mr-2">+</span>{issue.codeFix.after}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const RecommendationCard: React.FC<{ reco: Recommendation; index: number }> = ({ reco, index }) => {
  const priorityClass = reco.priority === 'critical' ? 'text-mizan-red' : reco.priority === 'high' ? 'text-mizan-amber' : 'text-mizan-blue';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl p-6 hover:shadow-mizan transition-all"
    >
      <div className={`text-[10px] font-bold tracking-[0.1em] uppercase mb-3 ${priorityClass}`}>
        {reco.priority} Priority
      </div>
      <h5 className="text-base font-semibold tracking-tight mb-3 dark:text-white">{reco.title}</h5>
      <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">{reco.body}</p>
    </motion.div>
  );
}

const DesignSystemView: React.FC = () => {
  const [framework, setFramework] = useState('React');
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getCodeSnippet = () => {
    switch (framework) {
      case 'Vue':
        return `<template>
  <button 
    class="px-6 py-3 bg-blue-600 text-white rounded-lg 
           rtl:flex-row-reverse flex items-center gap-2"
    v-bind="$attrs"
  >
    <slot />
    <ArrowLeft :size="16" class="rtl:rotate-180" />
  </button>
</template>`;
      case 'Flutter':
        return `Directionality(
  textDirection: TextDirection.rtl,
  child: ElevatedButton.icon(
    onPressed: () {},
    icon: Icon(Icons.arrow_back), // Automatically mirrors in RTL
    label: Text('إرسال'),
    style: ElevatedButton.styleFrom(
      backgroundColor: Colors.blue,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  ),
)`;
      case 'HTML/CSS':
        return `<button class="mizan-btn" dir="rtl">
  <span>إرسال</span>
  <svg class="icon-mirror">...</svg>
</button>

<style>
.mizan-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #0047E0;
  color: white;
  border-radius: 12px;
}
.icon-mirror {
  transform: scaleX(-1);
}
[dir="rtl"] .icon-mirror {
  transform: scaleX(1);
}
</style>`;
      default:
        return `// RTL Button Component
export const Button = ({ children, ...props }) => {
  return (
    <button 
      className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                 rtl:flex-row-reverse flex items-center gap-2"
      {...props}
    >
      {children}
      <ArrowLeft size={16} className="rtl:rotate-180" />
    </button>
  );
};`;
    }
  };
  
  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight dark:text-white">RTL Design System Generator</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-lg mt-2">Generate production-ready, RTL-compliant component libraries.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="px-6 py-3 bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl text-sm font-semibold text-mizan-text3 dark:text-white outline-none focus:ring-2 focus:ring-mizan-blue/20 transition-all"
          >
            <option>React</option>
            <option>Vue</option>
            <option>Flutter</option>
            <option>HTML/CSS</option>
          </select>
          <button className="flex items-center gap-2 px-8 py-3 bg-mizan-blue text-white rounded-full text-sm font-semibold shadow-lg shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all">
            <Download size={16} /> Generate Library
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[32px] p-10 shadow-mizan">
            <h3 className="text-xl font-semibold mb-8 dark:text-white">Component Preview</h3>
            <div className="p-12 bg-mizan-off dark:bg-dark-surface2 rounded-3xl border border-dashed border-mizan-off3 dark:border-dark-border flex flex-col items-center gap-10" dir="rtl">
              <div className="w-full max-w-md bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-mizan-md">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-12 h-12 rounded-full bg-mizan-blue/10 flex items-center justify-center text-mizan-blue">
                    <Users size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold dark:text-white">اسم المستخدم</div>
                    <div className="text-xs text-mizan-text4">نشط الآن</div>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <label className="block text-right text-xs font-bold text-mizan-text4">البريد الإلكتروني</label>
                  <input type="text" placeholder="example@domain.com" className="w-full bg-mizan-off dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-xl px-4 py-3 text-right text-sm dark:text-white" />
                </div>
                <button className="w-full py-4 bg-mizan-blue text-white rounded-xl text-base font-bold hover:bg-mizan-blue-dark transition-all">إرسال رسالة</button>
              </div>
              
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-dark-surface shadow-mizan-md flex items-center justify-center text-mizan-text3 dark:text-dark-text3 hover:scale-105 transition-transform">
                  <ArrowRight size={24} className="rotate-180" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-mizan-blue text-white shadow-mizan-md flex items-center justify-center hover:scale-105 transition-transform">
                  <Check size={24} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-mizan-text dark:bg-dark-surface rounded-[32px] p-10 text-white shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Code size={24} className="text-mizan-teal" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Generated Code ({framework})</h4>
              </div>
              <button 
                onClick={() => copyToClipboard(getCodeSnippet())}
                className="text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="font-mono text-sm leading-relaxed text-mizan-teal/90 overflow-x-auto">
              {getCodeSnippet()}
            </pre>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[32px] p-10 shadow-mizan">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-mizan-text4">Brand Configuration</h4>
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-3">Primary Color</label>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-mizan-blue border border-black/5" />
                  <input type="text" value="#0047E0" className="flex-1 bg-mizan-off dark:bg-dark-surface2 border-none rounded-xl px-4 py-3 text-sm font-mono dark:text-white" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-3">Arabic Font Family</label>
                <select className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-xl px-4 py-3 text-sm dark:text-white font-semibold outline-none">
                  <option>SF Pro / Noto Naskh</option>
                  <option>IBM Plex Sans Arabic</option>
                  <option>Readex Pro</option>
                </select>
              </div>
              <div className="pt-8 border-t border-black/5 dark:border-dark-border space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Auto-Mirror Icons</span>
                  <div className="w-10 h-5 bg-mizan-teal rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Logical Properties</span>
                  <div className="w-10 h-5 bg-mizan-teal rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-mizan-blue/5 border border-mizan-blue/10 rounded-[32px] p-10">
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheck size={24} className="text-mizan-blue" />
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-blue">Mizan Compliance</h4>
            </div>
            <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">
              This library is pre-configured to pass all 6 Mizan checkpoints. Every component is tested for RTL layout, accessibility, and readability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CertificationView: React.FC = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="py-12">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-mizan-teal/10 flex items-center justify-center text-mizan-teal mx-auto mb-8">
              <Check size={48} />
            </div>
            <h2 className="text-4xl font-semibold tracking-tight dark:text-white mb-6">Application Received!</h2>
            <p className="text-mizan-text3 dark:text-dark-text3 text-xl max-w-xl mx-auto mb-12">
              Our team will review your product and contact you within 3-5 business days to schedule the full audit.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="px-10 py-4 bg-mizan-blue text-white rounded-full font-bold shadow-lg shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all"
            >
              Back to Certification
            </button>
          </motion.div>
        ) : isApplying ? (
          <motion.div
            key="applying"
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-12"
          >
            <button onClick={() => setIsApplying(false)} className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors mb-12 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Cancel Application
            </button>
            <div className="max-w-3xl mx-auto bg-white dark:bg-dark-surface p-12 rounded-[40px] border border-black/5 dark:border-dark-border shadow-mizan">
              <h2 className="text-3xl font-semibold mb-8 dark:text-white">Apply for Mizan Certification</h2>
              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); setIsApplying(false); }}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Product Name</label>
                    <input type="text" required className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="e.g. MySuperApp" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Company Website</label>
                    <input type="url" required className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="https://company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Primary Market</label>
                  <select className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all">
                    {MARKETS.map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Why do you want to get certified?</label>
                  <textarea required className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 h-32 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="Tell us about your commitment to Arabic UX..."></textarea>
                </div>
                <button type="submit" className="w-full py-5 bg-mizan-blue text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-mizan-blue-dark transition-all shadow-xl shadow-mizan-blue/20">
                  Submit Application
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-12"
          >
            <div className="max-w-4xl mx-auto text-center mb-24">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-mizan-blue/5 border border-mizan-blue/10 rounded-full text-xs font-bold uppercase tracking-widest text-mizan-blue mb-8">
                <Award size={16} /> Mizan Certified Program
              </div>
              <h2 className="text-6xl font-semibold tracking-tight mb-8 dark:text-white">The Gold Standard for Arabic UX</h2>
              <p className="text-mizan-text3 dark:text-dark-text3 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
                Join the elite directory of products that put Arabic-first design at their core. Get certified, stay compliant, and build trust with millions of users.
              </p>
              <button 
                onClick={() => setIsApplying(true)}
                className="px-12 py-5 bg-mizan-blue text-white rounded-full text-lg font-bold shadow-2xl shadow-mizan-blue/30 hover:scale-105 transition-all"
              >
                Start Certification Process
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-10 mb-32">
              {[
                { title: 'Apply', desc: 'Submit your product for a comprehensive Mizan audit.', icon: FileSearch },
                { title: 'Verify', desc: 'Our experts and AI engine verify your score ≥ 80.', icon: ShieldCheck },
                { title: 'Certify', desc: 'Receive your badge and join the public directory.', icon: Award },
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-12 text-center hover:shadow-mizan transition-all duration-500 group">
                  <div className="w-20 h-20 rounded-3xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-mizan-blue mx-auto mb-10 group-hover:scale-110 transition-transform">
                    <step.icon size={40} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 dark:text-white">{step.title}</h3>
                  <p className="text-base text-mizan-text3 dark:text-dark-text3 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-mizan-text dark:bg-dark-surface rounded-[60px] p-16 md:p-24 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mizan-blue/20 blur-[150px] rounded-full -mr-64 -mt-64" />
              <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
                <div>
                  <h3 className="text-5xl font-semibold mb-10 tracking-tight">The Mizan Badge</h3>
                  <p className="text-white/60 text-xl mb-12 leading-relaxed">
                    Embed the live-status badge on your site. It automatically updates based on monthly re-audits, ensuring your users always know you maintain the highest standards.
                  </p>
                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 rounded-full bg-mizan-teal flex items-center justify-center text-white">
                        <Check size={18} />
                      </div>
                      <span className="text-lg font-medium">Automated monthly re-audits</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 rounded-full bg-mizan-teal flex items-center justify-center text-white">
                        <Check size={18} />
                      </div>
                      <span className="text-lg font-medium">Public verification URL</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 rounded-full bg-mizan-teal flex items-center justify-center text-white">
                        <Check size={18} />
                      </div>
                      <span className="text-lg font-medium">Revocation logic for regressions</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-80 h-80 rounded-full border-8 border-mizan-blue flex flex-col items-center justify-center bg-white/5 backdrop-blur-2xl relative group cursor-pointer">
                    <div className="absolute inset-0 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <Award size={96} className="text-mizan-blue mb-6 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-semibold tracking-widest uppercase">Certified</div>
                    <div className="text-[12px] font-bold tracking-[0.4em] uppercase opacity-40 mt-3">Arabic UX Excellence</div>
                    <div className="absolute -bottom-6 bg-mizan-teal text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Score: 94</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GovernanceView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'terminology' | 'register' | 'validator' | 'consistency'>('terminology');
  
  return (
    <div className="py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight dark:text-white">Arabic Content Governance</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-lg mt-2">The workspace for Arabic content designers and UX writers.</p>
        </div>
        <div className="flex bg-mizan-off dark:bg-dark-surface2 p-1.5 rounded-2xl border border-mizan-off3 dark:border-dark-border shadow-sm">
          {[
            { id: 'terminology', icon: Languages, label: 'Terminology' },
            { id: 'register', icon: FileSearch, label: 'Register' },
            { id: 'validator', icon: CheckSquare, label: 'Validator' },
            { id: 'consistency', icon: RefreshCcw, label: 'Consistency' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTool === tool.id ? 'bg-white dark:bg-dark-surface shadow-mizan-md text-mizan-blue' : 'text-mizan-text3 hover:text-mizan-text dark:hover:text-white'
              }`}
            >
              <tool.icon size={16} />
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'terminology' && (
          <motion.div
            key="terminology"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] overflow-hidden shadow-mizan"
          >
            <div className="p-10 border-b border-black/5 dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 bg-mizan-off dark:bg-dark-surface2 px-6 py-3.5 rounded-2xl border border-mizan-off3 dark:border-dark-border w-full md:w-[400px] focus-within:ring-2 focus-within:ring-mizan-blue/20 transition-all">
                <Search size={18} className="text-mizan-text4" />
                <input type="text" placeholder="Search terminology..." className="bg-transparent border-none outline-none text-base w-full dark:text-white font-medium" />
              </div>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-mizan-blue text-white rounded-full text-sm font-bold shadow-lg shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all">
                <Plus size={18} /> Add Term
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-mizan-off dark:bg-dark-surface2 border-b border-black/5 dark:border-dark-border text-xs font-bold uppercase tracking-widest text-mizan-text4">
                  <tr>
                    <th className="px-10 py-6">English Term</th>
                    <th className="px-10 py-6">Approved Arabic</th>
                    <th className="px-10 py-6">Register</th>
                    <th className="px-10 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-dark-border">
                  {[
                    { en: 'Dashboard', ar: 'لوحة التحكم', reg: 'Formal', status: 'Approved' },
                    { en: 'Settings', ar: 'الإعدادات', reg: 'Formal', status: 'Approved' },
                    { en: 'Checkout', ar: 'إتمام الشراء', reg: 'Action-oriented', status: 'Review' },
                  ].map((term, i) => (
                    <tr key={i} className="hover:bg-mizan-off/50 dark:hover:bg-dark-surface2/50 transition-colors">
                      <td className="px-10 py-8 font-semibold text-lg dark:text-white">{term.en}</td>
                      <td className="px-10 py-8 font-arabic text-2xl text-mizan-blue">{term.ar}</td>
                      <td className="px-10 py-8 text-sm font-medium text-mizan-text3 dark:text-dark-text3">{term.reg}</td>
                      <td className="px-10 py-8">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${term.status === 'Approved' ? 'bg-mizan-teal/10 text-mizan-teal' : 'bg-mizan-amber/10 text-mizan-amber'}`}>
                          {term.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTool === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-8">
              <h3 className="font-dm-200 text-xl mb-6 dark:text-dark-text">Register Analysis</h3>
              <textarea 
                placeholder="Paste Arabic copy here for register analysis..."
                className="w-full h-64 bg-mizan-off dark:bg-dark-surface2 border border-mizan-off3 dark:border-dark-border rounded-2xl p-6 text-sm font-arabic leading-relaxed outline-none focus:border-mizan-blue/30 transition-all dark:text-dark-text"
              />
              <button className="w-full py-4 bg-mizan-blue text-white rounded-xl text-[10px] uppercase tracking-widest font-bold mt-6">Analyze Register</button>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl p-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-mizan-text4">Analysis Results</h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[11px] mb-2">
                      <span className="text-mizan-text3 dark:text-dark-text3">Modern Standard Arabic</span>
                      <span className="font-bold dark:text-dark-text">85%</span>
                    </div>
                    <div className="h-1.5 bg-mizan-off3 dark:bg-dark-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-mizan-blue w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-2">
                      <span className="text-mizan-text3 dark:text-dark-text3">Colloquial / Dialect</span>
                      <span className="font-bold dark:text-dark-text">15%</span>
                    </div>
                    <div className="h-1.5 bg-mizan-off3 dark:bg-dark-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-mizan-amber w-[15%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-mizan-amber/5 border border-mizan-amber/10 rounded-xl">
                  <div className="flex items-center gap-2 text-mizan-amber mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Register Inconsistency</span>
                  </div>
                  <p className="text-[11px] text-mizan-text3 dark:text-dark-text3 leading-relaxed">
                    Found 3 instances of Egyptian dialect in a formal Gulf Arabic context. This may reduce trust for local users.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === 'validator' && (
          <motion.div
            key="validator"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-12 text-center"
          >
            <CheckSquare size={48} className="mx-auto mb-6 text-mizan-blue/20" />
            <h3 className="font-dm-200 text-2xl mb-4 dark:text-dark-text">UI String Validator</h3>
            <p className="text-sm text-mizan-text3 dark:text-dark-text3 max-w-md mx-auto leading-relaxed mb-10">
              Check UI strings for register, terminology, character count, and truncation issues.
            </p>
            <div className="max-w-xl mx-auto flex gap-4">
              <input 
                type="text" 
                placeholder="Paste Arabic UI string..."
                className="flex-1 bg-mizan-off dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-xl px-6 py-4 text-sm dark:text-dark-text"
              />
              <button className="bg-mizan-blue text-white px-8 py-4 rounded-xl text-sm font-dm-200 tracking-wide">
                Validate
              </button>
            </div>
          </motion.div>
        )}

        {activeTool === 'consistency' && (
          <motion.div
            key="consistency"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-10 text-center border-dashed group hover:border-mizan-blue/30 transition-all cursor-pointer">
                <Upload size={32} className="mx-auto mb-4 text-mizan-text4 group-hover:text-mizan-blue transition-colors" />
                <h4 className="font-dm-200 text-lg mb-2 dark:text-dark-text">English Source File</h4>
                <p className="text-xs text-mizan-text4 mb-6">Upload .json, .strings, or .xliff</p>
                <button className="px-6 py-2 bg-mizan-off dark:bg-dark-surface2 rounded-lg text-[10px] uppercase tracking-widest font-bold dark:text-dark-text2 group-hover:bg-mizan-blue group-hover:text-white transition-all">Select File</button>
              </div>
              <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-10 text-center border-dashed group hover:border-mizan-blue/30 transition-all cursor-pointer">
                <Upload size={32} className="mx-auto mb-4 text-mizan-text4 group-hover:text-mizan-blue transition-colors" />
                <h4 className="font-dm-200 text-lg mb-2 dark:text-dark-text">Arabic Translation File</h4>
                <p className="text-xs text-mizan-text4 mb-6">Upload .json, .strings, or .xliff</p>
                <button className="px-6 py-2 bg-mizan-off dark:bg-dark-surface2 rounded-lg text-[10px] uppercase tracking-widest font-bold dark:text-dark-text2 group-hover:bg-mizan-blue group-hover:text-white transition-all">Select File</button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button className="px-12 py-4 bg-mizan-blue text-white rounded-full font-bold shadow-xl shadow-mizan-blue/20 hover:scale-105 transition-all flex items-center gap-3">
                <RefreshCcw size={20} /> Run Consistency Audit
              </button>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan">
              <h3 className="text-xl font-semibold mb-8 dark:text-white">Audit Insights (Mock)</h3>
              <div className="space-y-6">
                {[
                  { issue: 'Untranslated String', key: 'auth.forgot_password', severity: 'High' },
                  { issue: 'Variable Mismatch', key: 'cart.items_count', severity: 'Critical' },
                  { issue: 'Length Overflow', key: 'nav.home', severity: 'Low' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-mizan-off dark:bg-dark-surface2 rounded-2xl border border-black/5 dark:border-dark-border">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.severity === 'Critical' ? 'bg-mizan-red' : item.severity === 'High' ? 'bg-mizan-amber' : 'bg-mizan-blue'}`} />
                      <div>
                        <div className="text-sm font-bold dark:text-white">{item.issue}</div>
                        <div className="text-xs text-mizan-text4 font-mono mt-1">{item.key}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mizan-text3">{item.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CollaborationView: React.FC<{ results: AuditResults }> = ({ results }) => {
  const [comments, setComments] = useState<Comment[]>(results.comments || []);
  const [newComment, setNewComment] = useState('');
  
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10 py-12">
      <div className="space-y-8">
        <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-semibold tracking-tight dark:text-white">Shared Audit Session</h2>
            <div className="flex -space-x-3">
              {['#0047e0', '#009e91', '#d42020'].map((color, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-dark-surface flex items-center justify-center text-xs text-white font-bold shadow-sm" style={{ backgroundColor: color }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white dark:border-dark-surface bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-xs text-mizan-text3 font-bold shadow-sm">
                +4
              </div>
            </div>
          </div>
          
          <div className="aspect-video bg-mizan-off dark:bg-dark-surface2 rounded-3xl border border-dashed border-mizan-off3 dark:border-dark-border flex items-center justify-center relative group cursor-crosshair overflow-hidden">
            <div className="text-center opacity-40 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
              <Plus size={32} className="mx-auto mb-4 text-mizan-blue" />
              <p className="text-sm font-bold uppercase tracking-widest">Click to drop a comment pin</p>
            </div>
            
            {/* Simulated Cursors */}
            <motion.div 
              animate={{ x: [100, 300, 200], y: [50, 180, 100] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute pointer-events-none"
            >
              <ArrowRight size={18} className="-rotate-45 text-mizan-teal fill-mizan-teal drop-shadow-sm" />
              <div className="bg-mizan-teal text-white text-[10px] px-2 py-1 rounded-md ml-3 mt-3 font-bold uppercase tracking-widest shadow-lg">Sarah</div>
            </motion.div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CHECKPOINTS.map((cp, i) => (
            <div key={cp.id} className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-6 flex items-center justify-between group hover:shadow-mizan transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-xs font-bold text-mizan-blue">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="text-base font-semibold dark:text-white">{cp.name}</h4>
                  <p className="text-[10px] text-mizan-text4 uppercase tracking-widest font-bold">3 tasks pending</p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-mizan-off dark:hover:bg-dark-surface2 rounded-xl transition-all">
                <MoreVertical size={18} className="text-mizan-text3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border-l border-black/5 dark:border-dark-border h-[calc(100vh-160px)] sticky top-24 flex flex-col rounded-l-[40px] shadow-2xl">
        <div className="p-8 border-b border-black/5 dark:border-dark-border">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-text4">Activity Feed</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {[
            { user: 'Sarah', action: 'marked RTL Patterns as Fixed', time: '2m ago', icon: Check },
            { user: 'Ahmed', action: 'left a comment on Readability', time: '15m ago', icon: MessageSquare },
            { user: 'John', action: 'disputed a finding in Search', time: '1h ago', icon: AlertCircle },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center shrink-0 shadow-sm">
                <item.icon size={14} className="text-mizan-blue" />
              </div>
              <div>
                <p className="text-sm leading-relaxed dark:text-dark-text2">
                  <span className="font-bold text-mizan-text dark:text-white">{item.user}</span> {item.action}
                </p>
                <p className="text-[10px] text-mizan-text4 uppercase mt-1.5 tracking-widest font-bold">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-black/5 dark:border-dark-border">
          <div className="flex items-center gap-3 bg-mizan-off dark:bg-dark-surface2 rounded-2xl p-3 shadow-inner">
            <input 
              type="text" 
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-sm px-3 dark:text-white font-medium"
            />
            <button className="p-2.5 bg-mizan-blue text-white rounded-xl shadow-lg shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const IntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'patterns' | 'regulatory' | 'payment' | 'market'>('map');
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  
  const getMarketImplications = (marketId: string) => {
    switch (marketId) {
      case 'ksa':
        return "Saudi users value privacy and data residency. Ensure your product complies with NDMO standards. Use respectful, formal Arabic. Localize imagery to reflect Saudi culture and landmarks.";
      case 'egypt':
        return "Egyptian users respond well to friendly, slightly less formal registers in non-critical flows. However, banking and official documents must remain formal. Ensure your search handles Egyptian spelling variants.";
      case 'qatar':
        return "High expectations for quality and trust. Focus on premium aesthetics and clear, formal communication. QCB compliance is a major trust signal for fintech.";
      default:
        return "Users in the UAE expect highly polished, high-trust interfaces. Avoid overly casual language in fintech or government flows. Ensure date pickers default to Gregorian but offer Hijri as a toggle.";
    }
  };

  const getMarketTrustSignals = (marketId: string) => {
    switch (marketId) {
      case 'ksa':
        return "SAMA/CITC compliance, Saudi flag, local address, Mada payment badge";
      case 'egypt':
        return "Local office, Egyptian pound (EGP) support, clear pricing, Meeza card support";
      case 'qatar':
        return "QCB compliance, local support, .qa domain, NAPS/QPay integration";
      default:
        return "Government endorsement, TDRA badges, local phone numbers, .ae domain";
    }
  };

  return (
    <div className="py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight dark:text-white">MENA Intelligence Layer</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-lg mt-2">Actionable cultural and regulatory insights for the region.</p>
        </div>
        <div className="flex bg-mizan-off dark:bg-dark-surface2 p-1.5 rounded-2xl border border-mizan-off3 dark:border-dark-border shadow-sm overflow-x-auto">
          {[
            { id: 'map', icon: Map, label: 'Dialect Map' },
            { id: 'market', icon: Globe, label: 'Market Intel' },
            { id: 'patterns', icon: BookOpen, label: 'Patterns' },
            { id: 'regulatory', icon: Shield, label: 'Regulatory' },
            { id: 'payment', icon: CreditCard, label: 'Payment' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white dark:bg-dark-surface shadow-mizan-md text-mizan-blue' : 'text-mizan-text3 hover:text-mizan-text dark:hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-[1fr_400px] gap-10"
          >
            <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-16 flex items-center justify-center min-h-[600px] relative overflow-hidden shadow-mizan">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <Map size={1000} className="absolute -top-64 -left-64" />
              </div>
              <div className="relative z-10 text-center max-w-lg">
                <Globe size={64} className="mx-auto mb-8 text-mizan-blue/20" />
                <h3 className="text-3xl font-semibold mb-6 dark:text-white">Interactive MENA UX Map</h3>
                <p className="text-base text-mizan-text3 dark:text-dark-text3 leading-relaxed mb-12">
                  Click on a territory to unlock deep-dive insights into local dialects, trust signals, and UI conventions.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {MARKETS.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedMarket(m)}
                      className={`px-6 py-3 border rounded-full text-xs font-bold uppercase tracking-widest hover:border-mizan-blue hover:text-mizan-blue hover:shadow-mizan-md transition-all ${
                        selectedMarket.id === m.id ? 'bg-mizan-blue text-white border-mizan-blue shadow-mizan-md' : 'bg-mizan-off dark:bg-dark-surface2 border-mizan-off3 dark:border-dark-border dark:text-white'
                      }`}
                    >
                      {m.flag} {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <motion.div 
                key={selectedMarket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-mizan-blue text-white rounded-[32px] p-10 shadow-2xl shadow-mizan-blue/30"
              >
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 opacity-60">Market Profile</h4>
                <h3 className="text-4xl font-semibold mb-8 tracking-tight">{selectedMarket.name}</h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Primary Dialect</div>
                    <div className="text-lg font-semibold">{selectedMarket.dialect}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Expected Formality</div>
                    <div className="text-lg font-semibold">{selectedMarket.formality}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Trust Signals</div>
                    <div className="text-lg font-semibold leading-relaxed">{getMarketTrustSignals(selectedMarket.id)}</div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                key={`${selectedMarket.id}-implications`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[32px] p-10 shadow-mizan"
              >
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-mizan-text4">UX Implications</h4>
                <p className="text-base text-mizan-text3 dark:text-dark-text3 leading-relaxed">
                  {getMarketImplications(selectedMarket.id)}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-black/5 dark:border-dark-border shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-mizan-blue/10 flex items-center justify-center mb-8">
                  <Globe size={28} className="text-mizan-blue" />
                </div>
                <h2 className="text-2xl font-semibold mb-6 dark:text-white">Arabic SEO</h2>
                <p className="text-mizan-text3 dark:text-dark-text3 font-medium leading-relaxed mb-8">
                  Master the complexity of Arabic search variants. We audit your hreflang strategy, RTL meta-data, and hamza-normalization for maximum visibility.
                </p>
                <ul className="space-y-4 text-sm">
                  {['Regional hreflang (ar-AE, ar-SA)', 'RTL Meta-description optimization', 'Hamza & Ta-marbuta normalization', 'Arabic keyword density analysis'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-mizan-text2 dark:text-dark-text2 font-medium">
                      <Check size={16} className="text-mizan-blue" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-black/5 dark:border-dark-border shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-mizan-teal/10 flex items-center justify-center mb-8">
                  <Zap size={28} className="text-mizan-teal" />
                </div>
                <h2 className="text-2xl font-semibold mb-6 dark:text-white">AEO (Answer Engine)</h2>
                <p className="text-mizan-text3 dark:text-dark-text3 font-medium leading-relaxed mb-8">
                  Optimize for the next generation of search. Ensure your Arabic content is structured for LLMs and Answer Engines like Perplexity and Claude.
                </p>
                <ul className="space-y-4 text-sm">
                  {['JSON-LD Schema for Arabic', 'Semantic content structuring', 'Q&A pattern optimization', 'LLM-friendly Arabic formatting'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-mizan-text2 dark:text-dark-text2 font-medium">
                      <Check size={16} className="text-mizan-teal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-black/5 dark:border-dark-border shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-mizan-amber/10 flex items-center justify-center mb-8">
                  <Map size={28} className="text-mizan-amber" />
                </div>
                <h2 className="text-2xl font-semibold mb-6 dark:text-white">GEO Intelligence</h2>
                <p className="text-mizan-text3 dark:text-dark-text3 font-medium leading-relaxed mb-8">
                  Hyper-localize for specific GCC markets. Audit for regional trust signals, local currencies, and market-specific compliance badges.
                </p>
                <ul className="space-y-4 text-sm">
                  {['Local trust signals (TDRA, SAMA)', 'GCC Currency formatting', 'Regional social proof', 'Market-specific compliance'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-mizan-text2 dark:text-dark-text2 font-medium">
                      <Check size={16} className="text-mizan-amber" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-mizan-off dark:bg-dark-surface2 rounded-[60px] p-16 md:p-20">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                  <h2 className="text-4xl font-semibold tracking-tight mb-8 dark:text-white">Answer Engine Optimization (AEO) for Arabic.</h2>
                  <p className="text-mizan-text3 dark:text-dark-text3 text-lg font-medium leading-relaxed mb-12">
                    As search shifts from lists of links to direct answers, your Arabic content must be semantically rich and technically optimized for AI retrievers. Mizan OS audits your content structure to ensure you remain the primary source for Arabic queries.
                  </p>
                  <div className="space-y-8">
                    {[
                      { title: 'Semantic Mapping', desc: 'We map your Arabic content to common LLM retrieval patterns.' },
                      { title: 'Schema Validation', desc: 'Ensure your JSON-LD is correctly localized and valid for regional search engines.' },
                      { title: 'Trust & Authority', desc: 'Verify local trust signals that Answer Engines use to rank Arabic sources.' }
                    ].map((item, i) => (
                      <div key={i}>
                        <h3 className="text-xl font-semibold mb-2 dark:text-white">{item.title}</h3>
                        <p className="text-mizan-text3 dark:text-dark-text3 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-mizan-blue/5 blur-[100px] rounded-full" />
                  <img 
                    src="https://picsum.photos/seed/mizan-aeo/1200/1200" 
                    alt="AEO Intelligence" 
                    className="rounded-3xl shadow-2xl border border-black/5 dark:border-dark-border relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PATTERNS.map((p, i) => (
              <div key={p.id} className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl p-8 shadow-mizan hover:shadow-mizan-md transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-mizan-blue">
                    <LayoutIcon size={20} />
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-mizan-teal bg-mizan-teal/5 px-2 py-1 rounded">
                    {p.checkpointId}
                  </div>
                </div>
                <h3 className="font-dm-200 text-xl mb-3 dark:text-dark-text">{p.name}</h3>
                <p className="text-xs text-mizan-text3 dark:text-dark-text3 leading-relaxed mb-6">{p.desc}</p>
                <div className="space-y-4">
                  <div className="p-3 bg-mizan-red/5 border border-mizan-red/10 rounded-lg">
                    <div className="text-[9px] font-bold uppercase text-mizan-red mb-1">The Problem</div>
                    <div className="text-[10px] text-mizan-text2 dark:text-dark-text2">{p.problem}</div>
                  </div>
                  <div className="p-3 bg-mizan-teal/5 border border-mizan-teal/10 rounded-lg">
                    <div className="text-[9px] font-bold uppercase text-mizan-teal mb-1">The Solution</div>
                    <div className="text-[10px] text-mizan-text2 dark:text-dark-text2">{p.solution}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'regulatory' && (
          <motion.div
            key="regulatory"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {REGULATIONS.map(reg => (
              <div key={reg.id} className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-mizan-blue shrink-0">
                    <Shield size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-dm-200 text-xl dark:text-dark-text">{reg.name}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-mizan-blue/10 text-mizan-blue rounded-full">{reg.market}</span>
                    </div>
                    <p className="text-sm text-mizan-text3 dark:text-dark-text3 max-w-xl">{reg.requirement}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12 shrink-0">
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-widest text-mizan-text4 mb-1">Status</div>
                    <div className="text-xs font-bold uppercase text-mizan-teal">{reg.status}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-widest text-mizan-text4 mb-1">Penalty</div>
                    <div className="text-xs font-bold uppercase text-mizan-red">{reg.penalty}</div>
                  </div>
                  <a href={reg.sourceUrl} target="_blank" className="p-3 bg-mizan-off dark:bg-dark-surface2 hover:bg-mizan-off2 dark:hover:bg-dark-surface border border-mizan-off3 dark:border-dark-border rounded-xl transition-all">
                    <ArrowRight size={18} className="text-mizan-text3" />
                  </a>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl p-12 text-center"
          >
            <CreditCard size={48} className="mx-auto mb-6 text-mizan-blue/20" />
            <h3 className="font-dm-200 text-2xl mb-4 dark:text-dark-text">Payment & Trust UX Analyzer</h3>
            <p className="text-sm text-mizan-text3 dark:text-dark-text3 max-w-md mx-auto leading-relaxed mb-10">
              Specialized sub-audit for MENA checkout flows. Analyze Mada, KNET, and Tabby integration quality.
            </p>
            <div className="max-w-xl mx-auto bg-mizan-off dark:bg-dark-surface2 border border-black/5 dark:border-dark-border rounded-2xl p-2 flex items-center">
              <input 
                type="url" 
                placeholder="Paste checkout URL or upload screenshots"
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm dark:text-dark-text"
              />
              <button className="bg-mizan-blue text-white px-8 py-4 rounded-xl text-sm font-dm-200 tracking-wide">
                Analyze Checkout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RegressionView: React.FC = () => {
  const [assertions, setAssertions] = useState<Assertion[]>(ASSERTIONS);
  
  return (
    <div className="py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight dark:text-white">Arabic UX Regression Suite</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-lg mt-2">Automate Arabic UX assertions in your CI/CD pipeline.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl text-xs font-bold uppercase tracking-widest text-mizan-text3 hover:text-mizan-text dark:text-white transition-all shadow-sm">
            <FileJson size={18} /> Export YAML
          </button>
          <button className="flex items-center gap-2 px-8 py-3.5 bg-mizan-blue text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all">
            <Zap size={18} /> Run Test Suite
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_440px] gap-10">
        <div className="space-y-10">
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h3 className="text-2xl font-semibold dark:text-white">Assertion Library</h3>
              <div className="flex flex-wrap gap-2">
                {['RTL', 'Typo', 'A11y', 'Search'].map(cat => (
                  <button key={cat} className="px-4 py-1.5 bg-mizan-off dark:bg-dark-surface2 border border-mizan-off3 dark:border-dark-border rounded-full text-[10px] font-bold uppercase tracking-widest text-mizan-text4 hover:text-mizan-blue transition-all">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {assertions.map(ass => (
                <div key={ass.id} className="flex items-center justify-between p-6 bg-mizan-off dark:bg-dark-surface2 border border-mizan-off3 dark:border-dark-border rounded-2xl group hover:border-mizan-blue/30 hover:shadow-mizan-md transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${ass.enabled ? 'bg-mizan-teal' : 'bg-mizan-text4'}`} />
                    <span className="text-base font-medium dark:text-white">{ass.text}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4 opacity-0 group-hover:opacity-100 transition-all">{ass.category}</span>
                    <button 
                      onClick={() => setAssertions(prev => prev.map(a => a.id === ass.id ? { ...a, enabled: !a.enabled } : a))}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${ass.enabled ? 'bg-mizan-blue' : 'bg-mizan-off3 dark:bg-dark-border'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${ass.enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-6 border-2 border-dashed border-mizan-off3 dark:border-dark-border rounded-2xl text-xs font-bold uppercase tracking-widest text-mizan-text4 hover:text-mizan-blue hover:border-mizan-blue hover:bg-mizan-blue/5 transition-all flex items-center justify-center gap-3">
                <Plus size={18} /> Add Custom AI Assertion
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-mizan-text dark:bg-dark-surface rounded-[40px] p-10 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <Terminal size={24} className="text-mizan-teal" />
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">CI/CD Integration</h4>
            </div>
            <div className="bg-black/30 rounded-2xl p-8 font-mono text-sm leading-relaxed text-mizan-teal/90 mb-8 shadow-inner overflow-x-auto">
              <div className="text-white/30 mb-3"># .github/workflows/mizan.yml</div>
              <div className="text-white/80">name: Arabic UX Audit</div>
              <div className="text-white/80">on: [push, pull_request]</div>
              <div className="text-white/80">jobs:</div>
              <div className="pl-4 text-white/80">audit:</div>
              <div className="pl-8 text-mizan-blue font-bold">runs-on: ubuntu-latest</div>
              <div className="pl-8 text-white/80">steps:</div>
              <div className="pl-12 text-white/80">- uses: actions/checkout@v2</div>
              <div className="pl-12 text-white/80">- name: Run Mizan CLI</div>
              <div className="pl-16 text-white font-bold">run: npx mizan audit --url $PREVIEW_URL</div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Mizan blocks merges if Arabic UX assertions fail. Ensure your RTL and localization quality never regresses.
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[32px] p-10 shadow-mizan">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-mizan-text4">NPM Package</h4>
            <div className="flex items-center justify-between p-4 bg-mizan-off dark:bg-dark-surface2 rounded-xl font-mono text-sm mb-6 shadow-inner">
              <span className="text-mizan-blue font-bold">npm install -g mizan-cli</span>
              <button className="text-mizan-text4 hover:text-mizan-text transition-colors"><Download size={18} /></button>
            </div>
            <p className="text-xs text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
              Run full audits locally or in your dev environment with the Mizan CLI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const BenchmarkView: React.FC = () => {
  return (
    <div className="py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight dark:text-white">MENA UX Benchmark Index</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-lg mt-2">Quarterly rankings of the top Arabic digital products.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-mizan-off dark:bg-dark-surface2 p-1.5 rounded-2xl border border-mizan-off3 dark:border-dark-border shadow-sm">
            {['UAE', 'KSA', 'Egypt', 'All'].map(m => (
              <button key={m} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${m === 'All' ? 'bg-white dark:bg-dark-surface shadow-mizan-md text-mizan-blue' : 'text-mizan-text3 dark:text-dark-text3 hover:text-mizan-text'}`}>
                {m}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2.5 px-8 py-3.5 bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-2xl text-xs font-bold uppercase tracking-widest text-mizan-text3 dark:text-white hover:text-mizan-text transition-all shadow-sm">
            <Filter size={18} /> Sector: Banking
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] overflow-hidden shadow-mizan">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-mizan-off dark:bg-dark-surface2 border-b border-black/5 dark:border-dark-border text-xs font-bold uppercase tracking-widest text-mizan-text4">
                <tr>
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Product</th>
                  <th className="px-10 py-6">Sector</th>
                  <th className="px-10 py-6">Score</th>
                  <th className="px-10 py-6">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-dark-border">
                {BENCHMARKS.map((b, i) => (
                  <tr key={b.id} className="hover:bg-mizan-off/50 dark:hover:bg-dark-surface2/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="text-4xl font-semibold text-mizan-text4 group-hover:text-mizan-blue transition-colors tracking-tighter">0{i + 1}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center text-mizan-blue font-arabic text-2xl shadow-sm group-hover:scale-110 transition-transform">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xl font-semibold dark:text-white">{b.name}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-mizan-text4 mt-1">{b.market}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-medium text-mizan-text3 dark:text-dark-text3">{b.category}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-3xl font-semibold text-mizan-blue tracking-tight">{b.score}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${b.delta >= 0 ? 'text-mizan-teal' : 'text-mizan-red'}`}>
                        {b.delta >= 0 ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
                        {b.delta > 0 ? `+${b.delta}` : b.delta}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-mizan-off dark:bg-dark-surface rounded-[40px] p-10 border border-mizan-off3 dark:border-dark-border shadow-inner">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-mizan-text4">Sector Overview</h4>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-mizan-text3 dark:text-dark-text3 font-medium">Avg. Banking Score</span>
                  <span className="font-bold dark:text-white">82/100</span>
                </div>
                <div className="h-2 bg-mizan-off3 dark:bg-dark-surface2 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-mizan-blue w-[82%] shadow-lg shadow-mizan-blue/20" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-mizan-text3 dark:text-dark-text3 font-medium">Avg. E-commerce Score</span>
                  <span className="font-bold dark:text-white">64/100</span>
                </div>
                <div className="h-2 bg-mizan-off3 dark:bg-dark-surface2 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-mizan-amber w-[64%] shadow-lg shadow-mizan-amber/20" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-mizan-text4">Critical Trends</h4>
            <ul className="space-y-6">
              {[
                'Search recall dropping across retail',
                'Mobile RTL mirroring improving in KSA',
                'Mixed register issues rising in Fintech'
              ].map((trend, i) => (
                <li key={i} className="flex gap-4 text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">
                  <div className="w-2 h-2 rounded-full bg-mizan-blue mt-2 shrink-0 shadow-sm" />
                  {trend}
                </li>
              ))}
            </ul>
          </div>
          
          <button className="w-full py-6 bg-mizan-text dark:bg-dark-surface2 text-white rounded-[32px] text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl">
            <Download size={18} /> Download Sector Report
          </button>
        </div>
      </div>
    </div>
  );
};

const PillarDetailView: React.FC<{ pillarId: string; onBack: () => void }> = ({ pillarId, onBack }) => {
  const pillar = CHECKPOINTS.find(c => c.id === pillarId);
  if (!pillar) return null;

  const pillarAssertions = ASSERTIONS.filter(a => a.category === pillarId || (pillarId === 'readability' && a.category === 'typography'));
  const pillarIssues = ISSUES[pillarId] || [];

  return (
    <div className="py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors mb-12 group">
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Overview
      </button>

      <div className="grid lg:grid-cols-2 gap-20 items-start">
        <div>
          <div className="text-mizan-blue font-bold text-sm tracking-[0.2em] mb-6 uppercase">Pillar {CHECKPOINTS.indexOf(pillar) + 1}</div>
          <h2 className="text-6xl font-semibold tracking-tight dark:text-white mb-8 leading-tight">{pillar.name}</h2>
          <p className="text-mizan-text3 dark:text-dark-text3 text-2xl font-medium leading-relaxed mb-12">
            {pillar.desc}
          </p>

          <div className="space-y-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-text4 mb-6">Why it matters</h3>
              <p className="text-lg text-mizan-text2 dark:text-dark-text2 leading-relaxed">
                {pillarId === 'rtl' && "RTL layout is the foundation of Arabic UX. Without proper mirroring, users struggle with navigation, hierarchy, and mental models built for their native script."}
                {pillarId === 'governance' && "Consistency in terminology and tone builds trust. Mixed registers or conflicting terms create cognitive load and signal a lack of cultural care."}
                {pillarId === 'a11y' && "Accessibility ensures that everyone, including users with visual or motor impairments, can navigate your Arabic interface with dignity and ease."}
                {pillarId === 'readability' && "Arabic script has unique density and verticality. Proper font choice and line height are not aesthetic choices, but functional requirements for legibility."}
                {pillarId === 'search' && "Arabic search is complex due to normalization needs. Handling hamzas, tashkeel, and variants is critical for product discovery and user retention."}
                {pillarId === 'workflow' && "A robust approval workflow ensures that Arabic UX quality is maintained over time, preventing regressions during rapid product iterations."}
                {pillarId === 'seo' && "Arabic SEO and AEO (Answer Engine Optimization) are vital for visibility. Regional hreflang variants and semantic markup ensure your content reaches the right Arabic audience."}
                {pillarId === 'geo' && "Geographic intelligence adapts your product to local trust signals, currencies, and regional nuances, building immediate credibility in specific GCC and MENA markets."}
              </p>
            </div>

            <div className="bg-mizan-off dark:bg-dark-surface rounded-[40px] p-10 border border-mizan-off3 dark:border-dark-border">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-text4 mb-8">Key Assertions</h3>
              <div className="space-y-6">
                {pillarAssertions.map((a, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-mizan-blue/10 flex items-center justify-center text-mizan-blue mt-0.5 shrink-0">
                      <Check size={14} />
                    </div>
                    <div>
                      <div className="font-semibold dark:text-white">{a.text}</div>
                      <div className="text-xs text-mizan-text3 mt-1">Automated check active</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-text4 mb-8">Common Failure Patterns</h3>
            <div className="space-y-6">
              {pillarIssues.filter(i => i.type === 'fail').map((issue, i) => (
                <div key={i} className="p-6 bg-mizan-red/5 border border-mizan-red/10 rounded-2xl flex gap-4">
                  <XCircle size={20} className="text-mizan-red shrink-0" />
                  <p className="text-sm font-medium text-mizan-red leading-relaxed">{issue.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-10 shadow-mizan">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mizan-text4 mb-8">Best Practices</h3>
            <div className="space-y-6">
              {RECOMMENDATIONS.filter(r => r.title.toLowerCase().includes(pillarId) || (pillarId === 'readability' && r.title.toLowerCase().includes('font'))).map((r, i) => (
                <div key={i} className="p-6 bg-mizan-teal/5 border border-mizan-teal/10 rounded-2xl">
                  <h4 className="font-bold text-mizan-teal mb-2">{r.title}</h4>
                  <p className="text-sm text-mizan-text3 dark:text-dark-text3 leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesView: React.FC = () => {
  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <h1 className="gsap-reveal text-6xl md:text-7xl font-semibold tracking-tight dark:text-white mb-8">Features.</h1>
          <p className="gsap-reveal text-mizan-text3 dark:text-dark-text3 text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
            Mizan OS provides a comprehensive suite of tools to audit and optimize every layer of your Arabic digital experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-32">
          <div className="gsap-card bg-white dark:bg-dark-surface p-12 rounded-[40px] border border-black/5 dark:border-dark-border shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-mizan-blue/10 flex items-center justify-center mb-10">
              <LayoutIcon size={32} className="text-mizan-blue" />
            </div>
            <h2 className="text-3xl font-semibold mb-6 dark:text-white">RTL Mirroring Engine</h2>
            <p className="text-mizan-text3 dark:text-dark-text3 text-lg font-medium leading-relaxed mb-8">
              Our proprietary engine performs deep visual and code-level analysis to ensure your RTL implementation is flawless. We go beyond simple direction attributes.
            </p>
            <ul className="space-y-4">
              {[
                { title: 'Logical Properties', desc: 'Detect hardcoded margin-left/right and recommend margin-inline-start/end.' },
                { title: 'Icon Mirroring', desc: 'Identify icons that should be flipped (arrows, progress) and those that shouldn\'t (clocks, checkmarks).' },
                { title: 'Layout Symmetry', desc: 'Verify that the visual weight of the page respects RTL reading patterns.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mizan-blue shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm dark:text-white">{item.title}</h4>
                    <p className="text-xs text-mizan-text3 dark:text-dark-text3">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="gsap-card bg-white dark:bg-dark-surface p-12 rounded-[40px] border border-black/5 dark:border-dark-border shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-mizan-teal/10 flex items-center justify-center mb-10">
              <Languages size={32} className="text-mizan-teal" />
            </div>
            <h2 className="text-3xl font-semibold mb-6 dark:text-white">Linguistic Intelligence</h2>
            <p className="text-mizan-text3 dark:text-dark-text3 text-lg font-medium leading-relaxed mb-8">
              Analyze the tone and register of your Arabic content. Ensure consistency across your product and avoid cultural faux pas.
            </p>
            <ul className="space-y-4">
              {[
                { title: 'Register Consistency', desc: 'Detect mixing of Modern Standard Arabic (MSA) with informal regional dialects.' },
                { title: 'Cultural Nuance', desc: 'Identify phrases that may be misunderstood or offensive in specific MENA markets.' },
                { title: 'Grammar & Syntax', desc: 'Automated checks for common Arabic grammatical errors in digital interfaces.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mizan-teal shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm dark:text-white">{item.title}</h4>
                    <p className="text-xs text-mizan-text3 dark:text-dark-text3">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-mizan-off dark:bg-dark-surface2 rounded-[60px] p-16 md:p-24 mb-32">
          <div className="max-w-3xl">
            <h2 className="gsap-reveal text-4xl font-semibold tracking-tight mb-8 dark:text-white">Automated Accessibility.</h2>
            <p className="gsap-reveal text-mizan-text3 dark:text-dark-text3 text-xl font-medium leading-relaxed mb-12">
              Mizan OS audits your product for Arabic-specific accessibility challenges. We ensure that screen readers and other assistive technologies provide a first-class experience for Arabic speakers.
            </p>
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="gsap-reveal">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">ARIA Localization</h3>
                <p className="text-mizan-text3 dark:text-dark-text3 text-sm">We flag ARIA labels that contain non-Arabic strings on Arabic pages, ensuring a consistent experience for screen reader users.</p>
              </div>
              <div className="gsap-reveal">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Focus Management</h3>
                <p className="text-mizan-text3 dark:text-dark-text3 text-sm">Verify that focus flows correctly in RTL layouts, preventing "jumping" or illogical navigation patterns.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="gsap-reveal text-4xl font-semibold tracking-tight dark:text-white mb-16">And so much more.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Figma, title: 'Figma Plugin', desc: 'Audit designs directly in Figma before a single line of code is written.' },
              { icon: Terminal, title: 'CLI Tool', desc: 'Integrate Arabic UX assertions into your CI/CD pipeline.' },
              { icon: Users, title: 'Collaboration', desc: 'Share reports and collaborate with your team in real-time.' },
              { icon: FileJson, title: 'API Access', desc: 'Build custom integrations with our robust Arabic UX API.' }
            ].map((item, i) => (
              <div key={i} className="gsap-card p-8 bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-3xl shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-mizan-off dark:bg-dark-surface2 flex items-center justify-center mb-6 mx-auto">
                  <item.icon size={20} className="text-mizan-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-3 dark:text-white">{item.title}</h3>
                <p className="text-xs text-mizan-text3 dark:text-dark-text3 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportView: React.FC<{ setScreen: (s: any) => void }> = ({ setScreen }) => {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
          <h1 className="text-6xl font-semibold tracking-tight dark:text-white mb-8">We're here to help.</h1>
          <p className="text-mizan-text3 dark:text-dark-text3 text-2xl font-medium leading-relaxed">
            Get the support you need to build exceptional Arabic experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-12 shadow-sm hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-mizan-blue/10 flex items-center justify-center mb-8">
              <MessageSquare size={28} className="text-mizan-blue" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Contact Support</h2>
            <p className="text-mizan-text3 dark:text-dark-text3 font-medium mb-8">
              Our team of Arabic UX experts is available to help you with any technical or design questions.
            </p>
            <button 
              onClick={() => setScreen('ticket')}
              className="text-mizan-blue font-semibold flex items-center gap-2 hover:underline"
            >
              Open a ticket <ArrowRight size={18} />
            </button>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-black/5 dark:border-dark-border rounded-[40px] p-12 shadow-sm hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-mizan-teal/10 flex items-center justify-center mb-8">
              <BookOpen size={28} className="text-mizan-teal" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Documentation</h2>
            <p className="text-mizan-text3 dark:text-dark-text3 font-medium mb-8">
              Explore our comprehensive guides on Arabic UX best practices, API references, and integration tutorials.
            </p>
            <button 
              onClick={() => setScreen('docs')}
              className="text-mizan-teal font-semibold flex items-center gap-2 hover:underline"
            >
              Read Docs <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="mb-32">
          <h2 className="text-3xl font-semibold tracking-tight dark:text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How does Mizan OS detect RTL mirroring issues?', a: 'Mizan OS uses advanced computer vision and DOM analysis to identify elements that should be mirrored but aren\'t, as well as icons that have incorrect directionality for Arabic script.' },
              { q: 'Can I use Mizan OS for mobile apps?', a: 'Yes! You can upload screenshots of your mobile app, or use our Figma plugin to audit mobile designs directly.' },
              { q: 'Does Mizan OS support different Arabic dialects?', a: 'Absolutely. Mizan OS understands the nuances of 22 regional dialects and can provide insights specifically for Gulf, Levant, North African, and Egyptian markets.' },
              { q: 'What is AEO and why does it matter for Arabic?', a: 'Answer Engine Optimization (AEO) ensures your content is structured so that AI models (like Claude or GPT) can accurately retrieve and present your information as a direct answer to Arabic queries.' },
              { q: 'How do you check for font fallbacks?', a: 'We analyze the computed styles of your text elements. If the primary font fails and the browser falls back to a generic Latin font (like Arial) for Arabic script, we flag it as a readability issue.' },
              { q: 'How secure is my data?', a: 'Security is our top priority. All data is encrypted, and we offer on-premise deployment options for enterprise customers who require maximum data sovereignty.' }
            ].map((faq, i) => (
              <div key={i} className="bg-mizan-off dark:bg-dark-surface rounded-3xl p-8 border border-black/5 dark:border-dark-border">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{faq.q}</h3>
                <p className="text-mizan-text3 dark:text-dark-text3 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-mizan-blue text-white rounded-[40px] p-12 text-center">
          <h2 className="text-3xl font-semibold mb-6">Still have questions?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Our Arabic UX consultants are ready to help you elevate your product.
          </p>
          <button 
            onClick={() => setScreen('ai-expert')}
            className="bg-white text-mizan-blue px-10 py-4 rounded-full font-bold hover:bg-white/90 transition-all"
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors mb-12 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </button>
        <h1 className="text-5xl font-semibold tracking-tight dark:text-white mb-8">Open a Support Ticket</h1>
        <p className="text-mizan-text3 dark:text-dark-text3 text-xl mb-12">
          Tell us about your challenge. Our regional experts will review and get back to you within 24 hours.
        </p>
        
        <form className="space-y-8 bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-black/5 dark:border-dark-border shadow-mizan">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Full Name</label>
              <input type="text" className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="e.g. Omar Khalid" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Email Address</label>
              <input type="email" className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="omar@company.com" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Subject</label>
            <select className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 focus:ring-2 focus:ring-mizan-blue transition-all">
              <option>RTL Mirroring Issue</option>
              <option>Arabic Font Rendering</option>
              <option>Content Register Analysis</option>
              <option>Figma Plugin Support</option>
              <option>Enterprise Integration</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-mizan-text4">Description</label>
            <textarea className="w-full bg-mizan-off dark:bg-dark-surface2 border-none rounded-2xl p-4 h-48 focus:ring-2 focus:ring-mizan-blue transition-all" placeholder="Please describe your issue in detail..."></textarea>
          </div>
          
          <button className="w-full py-5 bg-mizan-blue text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-mizan-blue-dark transition-all shadow-xl shadow-mizan-blue/20">
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

const DocsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors mb-12 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </button>
        
        <div className="grid lg:grid-cols-[280px_1fr] gap-16">
          <aside className="space-y-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-6">Getting Started</h3>
              <ul className="space-y-4 text-sm font-medium text-mizan-text3 dark:text-dark-text3">
                <li className="text-mizan-blue">Introduction to Mizan OS</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Core Audit Principles</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Setting up your first audit</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-6">Audit Criteria</h3>
              <ul className="space-y-4 text-sm font-medium text-mizan-text3 dark:text-dark-text3">
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">RTL Mirroring Standards</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Linguistic Register Rules</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Arabic Typography Guide</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Search Normalization Logic</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-mizan-text4 mb-6">Integrations</h3>
              <ul className="space-y-4 text-sm font-medium text-mizan-text3 dark:text-dark-text3">
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">Figma Plugin Guide</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">CI/CD Automation</li>
                <li className="hover:text-mizan-blue cursor-pointer transition-colors">API Reference</li>
              </ul>
            </div>
          </aside>
          
          <article className="prose prose-mizan dark:prose-invert max-w-none">
            <h1 className="text-5xl font-semibold tracking-tight mb-8">Documentation & Audit Criteria</h1>
            <p className="text-xl text-mizan-text3 dark:text-dark-text3 leading-relaxed mb-12">
              Mizan OS utilizes a proprietary multi-layered analysis engine to evaluate Arabic digital experiences. Our criteria are based on decades of regional research and modern web standards.
            </p>
            
            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6">1. RTL Mirroring Engine</h2>
              <p className="mb-6">Our engine doesn't just check for `dir="rtl"`. It performs deep visual analysis of:</p>
              <ul className="space-y-4 list-disc pl-6 mb-8">
                <li><strong>Directional Icons:</strong> Ensuring arrows, progress bars, and status indicators are correctly flipped.</li>
                <li><strong>Layout Symmetry:</strong> Verifying that the visual weight of the page respects the right-to-left reading pattern.</li>
                <li><strong>Logical Properties:</strong> Detecting hardcoded `margin-left` or `padding-right` that breaks in localized contexts.</li>
              </ul>
            </section>
            
            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6">2. Linguistic Intelligence</h2>
              <p className="mb-6">We analyze the "Register" of your Arabic content. Arabic has a wide spectrum from Modern Standard (MSA) to various regional dialects.</p>
              <div className="bg-mizan-off dark:bg-dark-surface2 p-8 rounded-3xl border border-black/5 dark:border-dark-border mb-8">
                <h4 className="font-bold mb-4">Register Consistency Check:</h4>
                <p className="text-sm">We flag instances where a formal "Submit" button (إرسال) is paired with an informal "Success" message (تمام يا بطل), which creates cognitive dissonance for users.</p>
              </div>
            </section>
            
            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6">3. Search Normalization Criteria</h2>
              <p className="mb-6">Arabic search is notoriously difficult due to character variations. Our audit checks if your search engine handles:</p>
              <table className="w-full text-left border-collapse mb-12">
                <thead>
                  <tr className="border-b border-black/5 dark:border-dark-border">
                    <th className="py-4 font-bold">Category</th>
                    <th className="py-4 font-bold">Examples</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-black/5 dark:border-dark-border">
                    <td className="py-4">Hamza Normalization</td>
                    <td className="py-4">أ، إ، آ vs ا</td>
                  </tr>
                  <tr className="border-b border-black/5 dark:border-dark-border">
                    <td className="py-4">Ta Marbuta</td>
                    <td className="py-4">ة vs ه</td>
                  </tr>
                  <tr className="border-b border-black/5 dark:border-dark-border">
                    <td className="py-4">Ya vs Alif Maqsura</td>
                    <td className="py-4">ي vs ى</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6">4. SEO & AEO Optimization</h2>
              <p className="mb-6">We ensure your content is discoverable by both traditional search engines and modern AI answer engines.</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-mizan-off dark:bg-dark-surface2 p-8 rounded-3xl border border-black/5 dark:border-dark-border">
                  <h4 className="font-bold mb-4">Regional hreflang</h4>
                  <p className="text-sm">We verify tags like `ar-AE`, `ar-SA`, and `ar-EG` to ensure users are directed to the correct regional variant of your site.</p>
                </div>
                <div className="bg-mizan-off dark:bg-dark-surface2 p-8 rounded-3xl border border-black/5 dark:border-dark-border">
                  <h4 className="font-bold mb-4">Semantic Schema</h4>
                  <p className="text-sm">Validation of JSON-LD structured data in Arabic, helping LLMs understand your content's context and authority.</p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6">5. GEO & Trust Signals</h2>
              <p className="mb-6">Building trust in the Middle East requires specific regional signals that Mizan OS audits automatically.</p>
              <ul className="space-y-4 list-disc pl-6">
                <li><strong>Compliance Badges:</strong> Detection of TDRA (UAE), SAMA (KSA), and other regional regulatory logos.</li>
                <li><strong>Currency Formatting:</strong> Ensuring correct symbols and decimal placement for AED, SAR, KWD, etc.</li>
                <li><strong>Local Social Proof:</strong> Verifying that testimonials and case studies reflect regional success stories.</li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
};

const AIExpertView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am Mizan AI, your specialized Arabic UX consultant. How can I help you optimize your product for the MENA region today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text || 'I am sorry, I could not process that.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'I am experiencing some technical difficulties. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-mizan-text3 hover:text-mizan-blue transition-colors mb-12 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </button>
        
        <div className="bg-white dark:bg-dark-surface rounded-[40px] border border-black/5 dark:border-dark-border shadow-2xl overflow-hidden flex flex-col h-[700px]">
          <div className="p-8 bg-mizan-blue text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Mizan AI Expert</h2>
                <p className="text-white/70 text-xs uppercase tracking-widest font-bold">Always Online</p>
              </div>
            </div>
            <Sparkles size={20} className="text-white/50" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-mizan-blue text-white rounded-tr-none' 
                    : 'bg-mizan-off dark:bg-dark-surface2 text-mizan-text dark:text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-mizan-off dark:bg-dark-surface2 p-5 rounded-3xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-mizan-text4 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-mizan-text4 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-mizan-text4 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-8 border-t border-black/5 dark:border-dark-border bg-mizan-off/50 dark:bg-dark-surface/50">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Arabic UX, RTL, or search normalization..."
                className="flex-1 bg-white dark:bg-dark-surface2 border-none rounded-2xl p-4 shadow-inner focus:ring-2 focus:ring-mizan-blue transition-all"
              />
              <button 
                onClick={handleSend}
                className="p-4 bg-mizan-blue text-white rounded-2xl shadow-xl shadow-mizan-blue/20 hover:bg-mizan-blue-dark transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


