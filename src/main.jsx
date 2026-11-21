import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  FlaskConical,
  Info,
  Leaf,
  Moon,
  RotateCcw,
  ScanBarcode,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode } from './api';
import { runIngredientOCR } from './ocr';
import { analyzeIngredients, getEvidenceLabel, getScoreMessage, getSeverityLabel } from './rules';
import './index.css';

const SOURCES = [
  ['Trustified', 'https://www.trustified.in/', 'Independent product testing and ingredient-focused reviews.'],
  ['Food Pharmer', 'https://food-pharmer.com/food-pharmer-health/', 'Food, additives, processing and label education.'],
  ['Fit Tuber', 'https://www.youtube.com/@fittuber', 'Consumer-product and ingredient-focused education.'],
  ['Open Food Facts', 'https://world.openfoodfacts.org/', 'Public barcode/product data used for lookup.'],
];

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('healthscan-theme') === 'dark');
  const [tab, setTab] = useState('scan');
  const [barcode, setBarcode] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [error, setError] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('healthscan-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const analyze = (text, meta = {}) => {
    if (!String(text || '').trim()) {
      setError('No ingredient text was found. Try another photo or paste the ingredient list.');
      return false;
    }
    setError('');
    const analysis = analyzeIngredients(text, meta);
    setResult({ analysis, ...meta });
    return true;
  };

  async function handleBarcode(code = barcode) {
    setLoading(true);
    setLoadingLabel('Checking product databases');
    setError('');
    try {
      const product = await lookupBarcode(code);
      if (!product.ingredients) throw new Error('We found the product, but its ingredient list is unavailable. Scan the ingredient panel instead.');
      analyze(product.ingredients, { product });
      setTab('result');
    } catch (e) {
      setError(e.message || 'Barcode lookup failed.');
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }

  async function handleOCR(file) {
    setLoading(true);
    setLoadingLabel('Reading the ingredient label');
    setError('');
    try {
      const ocrResult = await runIngredientOCR(file);
      setIngredients(ocrResult.text);
      analyze(ocrResult.text, { ocr: true, ocrQuality: ocrResult.internalQuality });
      setTab('result');
    } catch (e) {
      setError(e.message || 'We could not read the label. Try a closer, sharper photo.');
    } finally {
      setLoading(false);
      setLoadingLabel('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  useEffect(() => {
    if (!scanOpen) return undefined;
    const scanner = new Html5Qrcode('reader');
    let stopped = false;

    (async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 310, height: 150 }, aspectRatio: 1.777778 },
          async (decodedText) => {
            if (stopped) return;
            stopped = true;
            setBarcode(decodedText);
            setScanOpen(false);
            try { await scanner.stop(); } catch {}
            try { await scanner.clear(); } catch {}
            setTimeout(() => handleBarcode(decodedText), 0);
          },
          () => {}
        );
      } catch {
        setError('Camera access was unavailable. Allow camera permission or enter the barcode manually.');
        setScanOpen(false);
      }
    })();

    return () => {
      stopped = true;
      scanner.stop().catch(() => {}).finally(() => scanner.clear().catch(() => {}));
    };
  }, [scanOpen]);

  return (
    <div className="app-shell text-slate-900 dark:text-slate-100">
      <header className="glass-nav sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <BrandMark />
            <div className="hidden sm:block">
              <div className="text-[17px] font-black tracking-tight">Health<span className="text-emerald-500">Scan</span></div>
              <div className="text-[10px] font-semibold tracking-[.18em] text-slate-400 dark:text-slate-500">SCAN · UNDERSTAND · DECIDE</div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 dark:text-slate-400 md:flex">
            <a className="transition hover:text-emerald-500" href="#scanner">Scan</a>
            <a className="transition hover:text-emerald-500" href="#method">How it works</a>
            <a className="transition hover:text-emerald-500" href="#sources">Sources</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark((value) => !value)}
              className="group relative flex h-10 w-[74px] items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900"
            >
              <span className={`absolute h-8 w-8 rounded-full bg-slate-900 shadow-lg transition-transform duration-300 ${dark ? 'translate-x-8' : 'translate-x-0'}`} />
              <Sun size={15} className={`relative z-10 ml-2 transition-colors ${dark ? 'text-slate-500' : 'text-amber-400'}`} />
              <Moon size={15} className={`relative z-10 ml-auto mr-2 transition-colors ${dark ? 'text-white' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        {!result ? (
          <>
            <section className="relative overflow-hidden rounded-[34px] border border-slate-200/70 bg-white/70 px-6 py-10 shadow-[0_30px_90px_rgba(15,23,42,.07)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:px-10 lg:px-14 lg:py-14">
              <div className="hero-orb absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="hero-orb delay absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />
              <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
                <div className="reveal">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Sparkles size={14} /> Ingredient intelligence
                  </div>
                  <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                    Know what you’re buying.
                    <span className="block bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 bg-clip-text text-transparent">Before you buy it.</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                    Scan a barcode or capture the ingredient panel. HealthScan screens the label for high-priority ingredients, carcinogenicity concerns and vague disclosures — then explains the result.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <MiniCheck text="No account" /><MiniCheck text="No user profile" /><MiniCheck text="Food · Beauty · Household" />
                  </div>
                </div>

                <div className="reveal reveal-delay-2 relative">
                  <div className="surface relative mx-auto max-w-md rounded-[28px] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Example analysis</div>
                        <div className="mt-1 font-black">Personal care label</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"><ShieldCheck size={19} /></div>
                    </div>
                    <div className="surface-soft rounded-2xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 dark:from-emerald-400/15 dark:to-teal-400/10"><FlaskConical size={28} /></div>
                        <div className="min-w-0 flex-1"><div className="font-black">Ingredient panel</div><div className="text-xs text-slate-500">Multiple ingredient signals detected</div></div>
                        <div className="text-right"><div className="text-3xl font-black text-emerald-500">92</div><div className="text-[10px] font-bold text-slate-400">/100</div></div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <Signal label="Transparent label" good />
                        <Signal label="No priority carcinogen detected" good />
                        <Signal label="Ingredient-by-ingredient screening" good />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <Metric value="50K+" label="Products" /><Metric value="10K+" label="Ingredients" /><Metric value="100" label="Score" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="scanner" className="mt-8 reveal reveal-delay-1">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-500">Product scanner</div><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Choose how you want to check it</h2></div>
                <div className="hidden items-center gap-2 text-xs font-bold text-slate-400 sm:flex"><Zap size={14} /> Instant analysis</div>
              </div>

              <div className="surface overflow-hidden rounded-[28px]">
                <div className="grid border-b border-slate-200/70 dark:border-white/10 sm:grid-cols-3">
                  <Tab active={tab === 'scan'} onClick={() => setTab('scan')} icon={<ScanBarcode size={18} />} text="Barcode" />
                  <Tab active={tab === 'photo'} onClick={() => setTab('photo')} icon={<Camera size={18} />} text="Ingredient photo" />
                  <Tab active={tab === 'manual'} onClick={() => setTab('manual')} icon={<FileText size={18} />} text="Paste label" />
                </div>

                <div className="p-6 sm:p-8">
                  {tab === 'scan' && <BarcodePanel {...{ barcode, setBarcode, loading, setError, setScanOpen, handleBarcode, scanOpen }} />}
                  {tab === 'photo' && <PhotoPanel {...{ fileRef, loading, handleOCR }} />}
                  {tab === 'manual' && <ManualPanel {...{ ingredients, setIngredients, analyze, setTab }} />}
                </div>
              </div>
            </section>

            <section id="method" className="mt-10 grid gap-5 md:grid-cols-3">
              <FeatureCard delay="reveal-delay-1" icon={<ScanBarcode />} number="01" title="Identify" text="Use a barcode, camera or ingredient photo. No account or personal profile is required." />
              <FeatureCard delay="reveal-delay-2" icon={<FlaskConical />} number="02" title="Screen" text="Normalize the label and compare it against a broad ingredient hazard and transparency rule set." />
              <FeatureCard delay="reveal-delay-3" icon={<ShieldCheck />} number="03" title="Decide" text="Get a simple verdict, score and a focused list of the ingredients that deserve attention." />
            </section>

            <section id="sources" className="surface mt-10 rounded-[28px] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-500">Research layer</div><h2 className="mt-1 text-2xl font-black">Built around public evidence & label research</h2></div><div className="text-xs font-semibold text-slate-400">Regulatory status can vary by product and country.</div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SOURCES.map(([name, url, desc]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="card-hover rounded-2xl border border-slate-200/70 p-4 dark:border-white/10"><div className="flex items-center justify-between font-black">{name}<ExternalLink size={14} className="text-slate-400" /></div><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{desc}</p></a>)}
              </div>
            </section>
          </>
        ) : (
          <ResultView result={result} reset={() => { setResult(null); setError(''); setTab('scan'); }} />
        )}

        {error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"><AlertTriangle size={19} className="mt-0.5 shrink-0" /><span>{error}</span><button className="ml-auto rounded-lg p-1" onClick={() => setError('')}><X size={16} /></button></div>}
      </main>

      <footer className="border-t border-slate-200/70 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs leading-5 text-slate-400 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-bold">HealthScan · Ingredient screening, simplified.</div>
          <div className="max-w-2xl">Informational screening only. It is not a medical diagnosis or regulatory determination. Medicines and medical products should be reviewed by a qualified professional.</div>
        </div>
      </footer>

      {loading && <LoadingOverlay label={loadingLabel} />}
    </div>
  );
}

function BrandMark({ small = false }) {
  return <div className={`relative overflow-hidden rounded-[15px] shadow-[0_10px_25px_rgba(5,150,105,.28)] ${small ? 'h-10 w-10' : 'h-11 w-11'}`}><img src="/healthscan-mark.svg" alt="HealthScan" className="h-full w-full object-cover" /></div>;
}

function MiniCheck({ text }) { return <span className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"><Check size={12} strokeWidth={3} /></span>{text}</span>; }
function Metric({ value, label }) { return <div className="rounded-xl bg-slate-50 px-2 py-3 dark:bg-white/5"><div className="font-black">{value}</div><div className="mt-0.5 text-[10px] font-semibold text-slate-400">{label}</div></div>; }
function Signal({ label, good }) { return <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-sm dark:bg-white/5"><span className={`grid h-5 w-5 place-items-center rounded-full ${good ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-red-100 text-red-600'}`}><Check size={11} /></span>{label}</div>; }

function Tab({ active, onClick, icon, text }) { return <button onClick={onClick} className={`relative flex items-center justify-center gap-2 px-4 py-4 text-sm font-black transition-all duration-300 ${active ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5'}`}><span>{icon}</span>{text}{active && <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-emerald-500" />}</button>; }

function BarcodePanel({ barcode, setBarcode, loading, setError, setScanOpen, handleBarcode, scanOpen }) {
  return <div className="grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-center">
    <div>
      <div className="flex h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950/30">
        <ScanBarcode className="shrink-0 text-slate-400" />
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleBarcode()} placeholder="Enter EAN / UPC barcode" inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <button onClick={handleBarcode} disabled={loading} className="btn-primary flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-black text-white disabled:opacity-50">Check product <ArrowRight size={17} /></button>
        <button onClick={() => { setError(''); setScanOpen(true); }} disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-black transition hover:border-emerald-300 dark:border-white/10 dark:bg-transparent"><Camera size={18} /> Camera</button>
      </div>
      {scanOpen && <div className="scan-grid mt-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/5"><div className="overflow-hidden rounded-xl bg-black"><div id="reader" /></div><button onClick={() => setScanOpen(false)} className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black dark:border-white/10 dark:bg-slate-900">Close camera</button></div>}
    </div>
    <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"><ShieldCheck size={20} /></div><div><div className="font-black">Barcode first, label second</div><div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">If a public product record has no ingredients, switch to an ingredient photo for a direct label reading.</div></div></div></div>
  </div>;
}

function PhotoPanel({ fileRef, loading, handleOCR }) {
  return <div className="grid gap-7 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
    <div className="scan-grid rounded-2xl border border-emerald-200/70 p-7 text-center dark:border-emerald-400/20">
      <div className="pulse-ring mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white"><Camera size={27} /></div>
      <h3 className="mt-5 text-xl font-black">Capture the ingredient panel</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">For the best reading, keep the label flat, fill the frame with text, avoid glare and use good lighting.</p>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleOCR(e.target.files[0])} />
      <button onClick={() => fileRef.current?.click()} disabled={loading} className="btn-primary mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 font-black text-white disabled:opacity-50"><Upload size={17} /> Take / upload photo</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <Tip icon={<Zap />} title="Multi-pass reading" text="The scanner preprocesses the image and compares several recognition layouts internally." />
      <Tip icon={<Search />} title="Ingredient-aware" text="Recognition is tuned around ingredient-list vocabulary and label structure." />
      <Tip icon={<ShieldCheck />} title="Private by design" text="The browser processes your photo for this scan without creating a user account." />
      <Tip icon={<Sparkles />} title="Clean output" text="You see the product result, not OCR engine diagnostics." />
    </div>
  </div>;
}

function ManualPanel({ ingredients, setIngredients, analyze, setTab }) { return <div><textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={8} placeholder="Ingredients: water, sugar, palm oil, cocoa powder…" className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950/30" /><div className="mt-4 flex justify-end"><button onClick={() => { if (analyze(ingredients)) setTab('result'); }} className="btn-primary inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-6 font-black text-white">Analyze label <ArrowRight size={17} /></button></div></div>; }
function Tip({ icon, title, text }) { return <div className="surface-soft rounded-2xl p-4"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">{React.cloneElement(icon, { size: 17 })}</div><div className="font-black">{title}</div><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p></div>; }
function FeatureCard({ icon, number, title, text, delay }) { return <div className={`surface card-hover reveal ${delay} rounded-[24px] p-6`}><div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">{React.cloneElement(icon, { size: 21 })}</div><span className="text-xs font-black tracking-[.18em] text-slate-300 dark:text-slate-600">{number}</span></div><h3 className="mt-6 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p></div>; }

function ResultView({ result, reset }) {
  const { analysis, product } = result;
  const avoid = analysis.verdict === 'AVOID' || analysis.carcinogenDetected;
  const average = !avoid && analysis.verdict === 'AVERAGE';
  const tone = avoid ? 'red' : average ? 'amber' : 'green';
  const badFindings = analysis.findings.filter((f) => ['critical', 'very_high', 'high', 'moderate'].includes(f.severity));

  return <section className="reveal">
    <button onClick={reset} className="mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-emerald-500"><RotateCcw size={16} /> New scan</button>
    {product && <div className="surface mb-6 flex items-center gap-4 rounded-[24px] p-4 sm:p-5"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">{product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <ScanBarcode className="text-slate-400" />}</div><div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{product.type} · {product.barcode}</div><h1 className="truncate text-xl font-black sm:text-2xl">{product.name}</h1><div className="truncate text-sm text-slate-500">{product.brand}</div></div></div>}

    {analysis.carcinogenDetected && <div className="mb-6 overflow-hidden rounded-[28px] border-2 border-red-500 bg-red-50 p-6 dark:bg-red-500/10"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white"><XCircle size={26} /></div><div><div className="text-xs font-black uppercase tracking-[.18em] text-red-700 dark:text-red-300">Carcinogenicity detected</div><h2 className="mt-1 text-3xl font-black text-red-900 dark:text-red-100">AVOID AND RAISE VOICE.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-red-800 dark:text-red-200">A configured critical carcinogenicity finding was detected. HealthScan treats a confirmed hard-stop finding as an immediate avoid result.</p></div></div></div>}

    <div className={`rounded-[30px] border p-6 sm:p-8 ${tone === 'green' ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/10' : tone === 'amber' ? 'border-amber-200 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-400/10' : 'border-red-200 bg-red-50/80 dark:border-red-400/20 dark:bg-red-400/10'}`}>
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div><div className={`text-xs font-black uppercase tracking-[.18em] ${tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>HealthScan verdict</div><h2 className="mt-2 text-4xl font-black tracking-tight">{avoid ? 'AVOID' : average ? 'AVERAGE' : 'GOOD TO GO'}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{getScoreMessage(analysis)}</p></div>
        <ScoreRing score={analysis.score} tone={tone} />
      </div>
      <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-black/20"><div className={`h-full rounded-full transition-all duration-1000 ${tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} /></div>
      <div className="mt-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400"><span>Avoid</span><span>80 average</span><span>85 good</span><span>100</span></div>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="surface rounded-[28px] p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.16em] text-red-500">Priority findings</div><h2 className="mt-1 text-2xl font-black">Ingredients to pay attention to</h2></div><span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 dark:bg-red-400/10 dark:text-red-300">{badFindings.length} flagged</span></div>{badFindings.length === 0 ? <div className="mt-5 rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-400/10"><CheckCircle2 className="text-emerald-600 dark:text-emerald-300" /><div className="mt-2 font-black">No configured priority concerns detected.</div><div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">This is not a guarantee that the product is universally healthy or risk-free.</div></div> : <div className="mt-5 space-y-3">{badFindings.map((f, index) => <Finding key={f.key} f={f} index={index} />)}</div>}</div>
      <div className="space-y-6"><TransparencyPanel analysis={analysis} /><EvidencePanel analysis={analysis} /></div>
    </div>

    {product?.nutriscore && <div className="surface mt-6 flex items-center justify-between rounded-2xl p-5"><div><div className="font-black">Open Facts Nutri-Score</div><div className="mt-1 text-xs text-slate-500">Provided by the public product database.</div></div><span className="rounded-xl bg-slate-900 px-4 py-2 font-black uppercase text-white">{product.nutriscore}</span></div>}

    <div className="surface mt-6 rounded-[24px] p-5"><details><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black"><span>About this assessment</span><ChevronDown size={18} /></summary><div className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:text-slate-400">HealthScan uses an explainable screening heuristic. High-priority hazards receive larger penalties, vague ingredient disclosures reduce the assessment, and configured critical carcinogenicity findings override the numerical score.</div></details></div>
  </section>;
}

function ScoreRing({ score, tone }) { const stroke = tone === 'green' ? 'stroke-emerald-500' : tone === 'amber' ? 'stroke-amber-500' : 'stroke-red-500'; return <div className="relative h-36 w-36 shrink-0"><svg className="h-full w-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="7" className="text-white/70 dark:text-black/20" /><circle cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * score) / 100} className={`score-ring ${stroke}`} /></svg><div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-4xl font-black">{score}</div><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">/ 100</div></div></div></div>; }

function Finding({ f, index }) { const critical = f.severity === 'critical'; const high = f.severity === 'very_high' || f.severity === 'high'; return <div className={`reveal rounded-2xl border p-4 transition hover:-translate-y-0.5 ${critical ? 'border-red-400 bg-red-50 dark:border-red-400/30 dark:bg-red-500/10' : high ? 'border-red-200 bg-red-50/70 dark:border-red-400/20 dark:bg-red-400/10' : 'border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/10'}`} style={{ animationDelay: `${index * 70}ms` }}><div className="flex items-start justify-between gap-3"><div><div className="font-black">{f.label}</div>{f.carcinogenicity && <div className="mt-1 text-[10px] font-black uppercase tracking-[.15em] text-red-600">{f.carcinogenicity}</div>}</div><span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase dark:bg-black/10">{getSeverityLabel(f.severity)}</span></div><p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">{f.note}</p></div>; }

function TransparencyPanel({ analysis }) { const findings = analysis.transparencyFindings || []; return <div className={`rounded-[24px] border p-6 ${findings.length ? 'border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/10' : 'surface'}`}><div className="flex items-center gap-2"><Info size={18} className={findings.length ? 'text-amber-600' : 'text-emerald-600'} /><h2 className="text-lg font-black">Label transparency</h2></div>{findings.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">No configured vague, base or proprietary declaration was detected.</p> : <div className="mt-4 space-y-3">{findings.map((f) => <div key={f.key} className="rounded-2xl border border-amber-200/70 bg-white/70 p-4 dark:border-amber-400/20 dark:bg-black/10"><div className="font-black text-amber-900 dark:text-amber-100">{f.label}</div><p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">{f.note}</p></div>)}</div>}</div>; }

function EvidencePanel({ analysis }) { const [open, setOpen] = useState(false); const concerns = analysis.carcinogenicityConcerns || []; const sources = [...new Map(analysis.findings.filter((f) => f.source?.url).map((f) => [f.source.url, f.source])).values()]; return <div className="surface rounded-[24px] p-6"><button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left"><div><h2 className="text-lg font-black">Evidence & classification</h2><p className="mt-1 text-xs text-slate-500">Expand for the supporting classification and sources.</p></div><ChevronDown className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} size={19} /></button>{open && <div className="mt-5 space-y-4 reveal">{concerns.length > 0 && <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-500/10"><div className="font-black text-red-900 dark:text-red-100">Carcinogenicity classifications</div>{concerns.map((f) => <div key={f.key} className="mt-2 text-xs leading-5 text-red-800 dark:text-red-200"><span className="font-black">{f.label}:</span> {getEvidenceLabel(f)}</div>)}</div>}{sources.length > 0 && <div><div className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Sources</div><div className="space-y-2">{sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold transition hover:border-emerald-300 dark:border-white/10">{s.name}<ExternalLink size={13} /></a>)}</div></div>}</div>}</div>; }

function LoadingOverlay({ label }) { return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/35 p-5 backdrop-blur-md"><div className="surface w-full max-w-sm rounded-[28px] p-7 text-center shadow-2xl"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"><div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div><h2 className="mt-5 text-xl font-black">{label || 'Analyzing product'}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">One moment. We’re processing the label and preparing your result.</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="shimmer h-full w-1/2 rounded-full bg-emerald-500/60" /></div></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
