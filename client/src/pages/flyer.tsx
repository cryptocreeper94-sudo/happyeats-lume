import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Truck, Car, UtensilsCrossed, Package, Wrench, MapPin, LayoutGrid, LayoutList, Download, Printer, Share2, Mail, Palette, Image, Upload, Plus, Trash2, RotateCcw, Edit3, Eye, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import {
  captureElementAsImage,
  captureElementAsPDF,
  captureElementAndShare,
  captureElementAndEmail,
  captureElementAndPrint,
} from "@/lib/download-utils";
import { FlyerTipsModal } from "@/components/flyer-tips-modal";

type FlyerLang = 'en' | 'es' | 'both';
type ColorScheme = 'orange' | 'cyan' | 'purple' | 'blue' | 'green' | 'red';

interface FlyerSection {
  title: string;
  features: string[];
}

interface FlyerContentData {
  title: string;
  titleAccent: string;
  tagline: string;
  location: string;
  whatWeDeliver: string;
  deliverLabels: string[];
  sections: FlyerSection[];
  copyright: string;
}

interface FlyerConfig {
  en: FlyerContentData;
  es: FlyerContentData;
  logoUrl: string;
  bgImageUrl: string | null;
  bgOverlayOpacity: number;
  websiteUrl: string;
}

const colorSchemes: Record<ColorScheme, {
  label: string;
  swatch: string;
  accent: string;
  accentLight: string;
  gradient: string;
  gradientBg: string;
  printAccent: string;
  bullet: string;
  sectionColors: [string, string, string];
}> = {
  orange: { label: 'Orange', swatch: '#f97316', accent: 'text-orange-400', accentLight: 'text-orange-300', gradient: 'from-orange-400 to-rose-400', gradientBg: 'from-orange-500 to-rose-500', printAccent: 'print:text-orange-500', bullet: 'text-orange-400 print:text-orange-500', sectionColors: ['blue', 'green', 'orange'] },
  cyan: { label: 'Cyan', swatch: '#06b6d4', accent: 'text-cyan-400', accentLight: 'text-cyan-300', gradient: 'from-cyan-400 to-teal-400', gradientBg: 'from-cyan-500 to-teal-500', printAccent: 'print:text-cyan-500', bullet: 'text-cyan-400 print:text-cyan-500', sectionColors: ['cyan', 'teal', 'sky'] },
  purple: { label: 'Purple', swatch: '#a855f7', accent: 'text-purple-400', accentLight: 'text-purple-300', gradient: 'from-purple-400 to-violet-400', gradientBg: 'from-purple-500 to-violet-500', printAccent: 'print:text-purple-500', bullet: 'text-purple-400 print:text-purple-500', sectionColors: ['purple', 'violet', 'fuchsia'] },
  blue: { label: 'Blue', swatch: '#3b82f6', accent: 'text-blue-400', accentLight: 'text-blue-300', gradient: 'from-blue-400 to-indigo-400', gradientBg: 'from-blue-500 to-indigo-500', printAccent: 'print:text-blue-500', bullet: 'text-blue-400 print:text-blue-500', sectionColors: ['blue', 'indigo', 'sky'] },
  green: { label: 'Green', swatch: '#22c55e', accent: 'text-green-400', accentLight: 'text-green-300', gradient: 'from-green-400 to-emerald-400', gradientBg: 'from-green-500 to-emerald-500', printAccent: 'print:text-green-500', bullet: 'text-green-400 print:text-green-500', sectionColors: ['green', 'emerald', 'lime'] },
  red: { label: 'Red', swatch: '#ef4444', accent: 'text-red-400', accentLight: 'text-red-300', gradient: 'from-red-400 to-rose-400', gradientBg: 'from-red-500 to-rose-500', printAccent: 'print:text-red-500', bullet: 'text-red-400 print:text-red-500', sectionColors: ['red', 'rose', 'amber'] },
};

const sectionStyleMap: Record<string, { border: string; bg: string; icon: string }> = {
  blue: { border: 'border-blue-500/30 print:border-blue-200', bg: 'bg-blue-500/5 print:bg-blue-50', icon: 'text-blue-400 print:text-blue-500' },
  green: { border: 'border-green-500/30 print:border-green-200', bg: 'bg-green-500/5 print:bg-green-50', icon: 'text-green-400 print:text-green-500' },
  orange: { border: 'border-orange-500/30 print:border-orange-200', bg: 'bg-orange-500/5 print:bg-orange-50', icon: 'text-orange-400 print:text-orange-500' },
  cyan: { border: 'border-cyan-500/30 print:border-cyan-200', bg: 'bg-cyan-500/5 print:bg-cyan-50', icon: 'text-cyan-400 print:text-cyan-500' },
  teal: { border: 'border-teal-500/30 print:border-teal-200', bg: 'bg-teal-500/5 print:bg-teal-50', icon: 'text-teal-400 print:text-teal-500' },
  sky: { border: 'border-sky-500/30 print:border-sky-200', bg: 'bg-sky-500/5 print:bg-sky-50', icon: 'text-sky-400 print:text-sky-500' },
  purple: { border: 'border-purple-500/30 print:border-purple-200', bg: 'bg-purple-500/5 print:bg-purple-50', icon: 'text-purple-400 print:text-purple-500' },
  violet: { border: 'border-violet-500/30 print:border-violet-200', bg: 'bg-violet-500/5 print:bg-violet-50', icon: 'text-violet-400 print:text-violet-500' },
  fuchsia: { border: 'border-fuchsia-500/30 print:border-fuchsia-200', bg: 'bg-fuchsia-500/5 print:bg-fuchsia-50', icon: 'text-fuchsia-400 print:text-fuchsia-500' },
  indigo: { border: 'border-indigo-500/30 print:border-indigo-200', bg: 'bg-indigo-500/5 print:bg-indigo-50', icon: 'text-indigo-400 print:text-indigo-500' },
  emerald: { border: 'border-emerald-500/30 print:border-emerald-200', bg: 'bg-emerald-500/5 print:bg-emerald-50', icon: 'text-emerald-400 print:text-emerald-500' },
  lime: { border: 'border-lime-500/30 print:border-lime-200', bg: 'bg-lime-500/5 print:bg-lime-50', icon: 'text-lime-400 print:text-lime-500' },
  red: { border: 'border-red-500/30 print:border-red-200', bg: 'bg-red-500/5 print:bg-red-50', icon: 'text-red-400 print:text-red-500' },
  rose: { border: 'border-rose-500/30 print:border-rose-200', bg: 'bg-rose-500/5 print:bg-rose-50', icon: 'text-rose-400 print:text-rose-500' },
  amber: { border: 'border-amber-500/30 print:border-amber-200', bg: 'bg-amber-500/5 print:bg-amber-50', icon: 'text-amber-400 print:text-amber-500' },
};

const sectionIcons = [Truck, Car, UtensilsCrossed, Package, Wrench, MapPin];
const deliverIcons = [UtensilsCrossed, Package, Wrench, MapPin];

const DEFAULT_CONFIG: FlyerConfig = {
  en: {
    title: "HAPPY",
    titleAccent: "EATS",
    tagline: "Hot Food Delivered to Your Location",
    location: "I-24 Corridor • La Vergne • Smyrna, TN",
    whatWeDeliver: "What We Deliver",
    deliverLabels: ["Food", "Parts", "Services", "Supplies"],
    sections: [
      { title: "Commercial Drivers", features: ["Break timer & HOS compliance", "Order to your truck stop", "Trucker Talk chat", "Load board integration"] },
      { title: "Everyday Drivers", features: ["Automatic mileage tracking", "IRS deduction calculator", "Expense categorization", "CSV export for taxes"] },
      { title: "Food Truck Vendors", features: ["Free to join — zero cost to sign up", "Only 20% per order — no monthly fees", "Batch orders by 11 AM — zero waste", "We pick up and deliver for you"] },
    ],
    copyright: "© 2026 Happy Eats • A Trust Layer Driver Connect Franchise",
  },
  es: {
    title: "HAPPY",
    titleAccent: "EATS",
    tagline: "Comida Caliente Entregada a Tu Ubicación",
    location: "Corredor I-24 • La Vergne • Smyrna, TN",
    whatWeDeliver: "Lo Que Entregamos",
    deliverLabels: ["Comida", "Partes", "Servicios", "Suministros"],
    sections: [
      { title: "Conductores Comerciales", features: ["Temporizador de descanso y cumplimiento HOS", "Pide a tu parada de camiones", "Chat Trucker Talk", "Integración de tablero de cargas"] },
      { title: "Conductores Diarios", features: ["Seguimiento automático de millas", "Calculadora de deducciones IRS", "Categorización de gastos", "Exportar CSV para impuestos"] },
      { title: "Vendedores de Food Trucks", features: ["Gratis para unirse — cero costo", "Solo 20% por pedido — sin tarifas mensuales", "Pedidos en lote antes de las 11 AM — cero desperdicio", "Recogemos y entregamos por ti"] },
    ],
    copyright: "© 2026 Happy Eats • Una Franquicia de Trust Layer Driver Connect",
  },
  logoUrl: "/happyeats-emblem.png",
  bgImageUrl: null,
  bgOverlayOpacity: 0.5,
  websiteUrl: "happyeats.app",
};

const STOCK_BGS = [
  { id: 'none', label: 'None', url: '' },
  { id: 'food-truck', label: 'Food Truck', url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=700&h=900&fit=crop' },
  { id: 'highway', label: 'Highway', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&h=900&fit=crop' },
  { id: 'nashville', label: 'Nashville', url: 'https://images.unsplash.com/photo-1545419913-775e3e0e9b96?w=700&h=900&fit=crop' },
  { id: 'trucker', label: 'Trucker', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&h=900&fit=crop' },
  { id: 'abstract', label: 'Abstract', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=700&h=900&fit=crop' },
  { id: 'kitchen', label: 'Kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=900&fit=crop' },
];

function EditableList({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1">
          <input
            value={item}
            onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
            placeholder={placeholder}
            data-testid={`input-list-item-${i}`}
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-white/30 hover:text-red-400 transition-colors" data-testid={`button-remove-item-${i}`}>
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 mt-1" data-testid="button-add-item">
        <Plus className="size-3" /> Add item
      </button>
    </div>
  );
}

function FlyerPreview({ data, scheme, logoUrl, bgImageUrl, bgOverlayOpacity, websiteUrl }: {
  data: FlyerContentData; scheme: ColorScheme; logoUrl: string; bgImageUrl: string | null; bgOverlayOpacity: number; websiteUrl: string;
}) {
  const cs = colorSchemes[scheme];
  const [sc1, sc2, sc3] = cs.sectionColors;
  const sectionColorList = [sc1, sc2, sc3];
  return (
    <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 print:from-white print:to-gray-50 relative">
      {bgImageUrl && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImageUrl})` }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: bgOverlayOpacity }} />
        </>
      )}
      <div className="p-4 relative z-10">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-black text-white print:text-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {data.title} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${cs.gradient} ${cs.printAccent}`}>{data.titleAccent}</span>
          </h1>
          <p className={`text-base ${cs.accentLight} print:text-gray-600 font-medium`}>{data.tagline}</p>
          <p className="text-xs text-white/60 print:text-gray-500">{data.location}</p>
        </div>

        <div className="mb-3">
          <h2 className="text-sm font-bold text-white print:text-black mb-2 text-center">{data.whatWeDeliver}</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {data.deliverLabels.slice(0, 4).map((label, i) => {
              const Icon = deliverIcons[i % deliverIcons.length];
              return (
                <div key={i} className="bg-white/5 print:bg-gray-100 rounded-lg p-1.5 text-center border border-white/10 print:border-gray-200">
                  <Icon className={`w-4 h-4 ${cs.accent} mx-auto mb-0.5`} />
                  <span className="text-[11px] font-medium text-white print:text-black">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {data.sections.map((section, i) => {
            const Icon = sectionIcons[i % sectionIcons.length];
            const color = sectionColorList[i % sectionColorList.length];
            const style = sectionStyleMap[color] || sectionStyleMap.blue;
            return (
              <div key={i} className={`border rounded-lg p-2.5 ${style.border} ${style.bg}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${style.icon}`} />
                  <h3 className="font-bold text-white print:text-black text-xs">{section.title}</h3>
                </div>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-white/70 print:text-gray-600">
                  {section.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <span className={cs.bullet}>&bull;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center">
          <div className="flex justify-center mb-2">
            <img src={logoUrl} alt="Logo" className="size-10 rounded-xl" />
          </div>
          <div className={`inline-block bg-gradient-to-r ${cs.gradientBg} text-white font-black text-xl py-2 px-6 rounded-full shadow-lg`}>
            {websiteUrl}
          </div>
          <p className="text-white/40 print:text-gray-400 text-[10px] mt-2">{data.copyright}</p>
        </div>
      </div>
    </div>
  );
}

export default function FlyerPage() {
  const [layout, setLayout] = useState<'stacked' | 'side-by-side'>('stacked');
  const [flyerLang, setFlyerLang] = useState<FlyerLang>('en');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('orange');
  const [showColors, setShowColors] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [editorSection, setEditorSection] = useState<string | null>('header');
  const [config, setConfig] = useState<FlyerConfig>({ ...DEFAULT_CONFIG, en: { ...DEFAULT_CONFIG.en, sections: DEFAULT_CONFIG.en.sections.map(s => ({ ...s, features: [...s.features] })) }, es: { ...DEFAULT_CONFIG.es, sections: DEFAULT_CONFIG.es.sections.map(s => ({ ...s, features: [...s.features] })) } });
  const flyerRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [customHeroImage, setCustomHeroImage] = useState<string | null>(null);

  const cs = colorSchemes[colorScheme];
  const langSuffix = flyerLang === 'both' ? 'bilingual' : flyerLang;

  const updateLangField = useCallback((lang: 'en' | 'es', field: keyof FlyerContentData, value: any) => {
    setConfig(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  }, []);

  const updateSection = useCallback((lang: 'en' | 'es', idx: number, field: keyof FlyerSection, value: any) => {
    setConfig(prev => {
      const sections = prev[lang].sections.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      return { ...prev, [lang]: { ...prev[lang], sections } };
    });
  }, []);

  const addSection = useCallback((lang: 'en' | 'es') => {
    setConfig(prev => ({
      ...prev,
      [lang]: { ...prev[lang], sections: [...prev[lang].sections, { title: "New Section", features: ["Feature 1"] }] }
    }));
  }, []);

  const removeSection = useCallback((lang: 'en' | 'es', idx: number) => {
    setConfig(prev => ({
      ...prev,
      [lang]: { ...prev[lang], sections: prev[lang].sections.filter((_, i) => i !== idx) }
    }));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setConfig(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setConfig(prev => ({ ...prev, bgImageUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomHeroImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetToDefaults = () => {
    setConfig({ ...DEFAULT_CONFIG, en: { ...DEFAULT_CONFIG.en, sections: DEFAULT_CONFIG.en.sections.map(s => ({ ...s, features: [...s.features] })) }, es: { ...DEFAULT_CONFIG.es, sections: DEFAULT_CONFIG.es.sections.map(s => ({ ...s, features: [...s.features] })) } });
    setCustomHeroImage(null);
  };

  const runAction = async (fn: () => Promise<void>) => {
    setIsGenerating(true);
    try { await fn(); } catch (err) { console.error(err); }
    setIsGenerating(false);
  };

  const downloadPDF = () => runAction(async () => { if (flyerRef.current) await captureElementAsPDF(flyerRef.current, `happyeats-flyer-${langSuffix}.pdf`, { scale: 2, backgroundColor: "#1e293b", orientation: layout === "side-by-side" ? "landscape" : "portrait" }); });
  const downloadImage = () => runAction(async () => { if (flyerRef.current) await captureElementAsImage(flyerRef.current, `happyeats-flyer-${langSuffix}.png`, { scale: 2, backgroundColor: "#1e293b" }); });
  const handleShare = () => runAction(async () => { if (flyerRef.current) await captureElementAndShare(flyerRef.current, `happyeats-flyer-${langSuffix}.png`, { scale: 2, backgroundColor: "#1e293b" }); });
  const handleEmail = () => runAction(async () => { if (flyerRef.current) await captureElementAndEmail(flyerRef.current, `happyeats-flyer-${langSuffix}.png`, "Happy Eats Driver Flyer", { scale: 2, backgroundColor: "#1e293b" }); });
  const handlePrint = () => runAction(async () => { if (flyerRef.current) await captureElementAndPrint(flyerRef.current, { scale: 2, backgroundColor: "#1e293b" }); });

  const currentData = config[editLang];
  const toggleSection = (id: string) => setEditorSection(editorSection === id ? null : id);

  return (
    <div className="min-h-screen bg-slate-900 print:bg-white">
      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
      <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
      <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />

      <div className="sticky top-0 z-30 print:hidden flex flex-wrap items-center gap-2 bg-slate-800/95 backdrop-blur-xl p-3 border-b border-white/10">
        <Link href="/flyer-catalog">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/25 transition-all min-h-[32px]" data-testid="link-flyer-catalog">
            <FolderOpen className="size-3.5" />
            Catalog
          </button>
        </Link>
        <div className="w-px bg-white/20" />
        <button onClick={() => setEditMode(!editMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`} data-testid="button-toggle-edit">
          {editMode ? <Eye className="size-3.5" /> : <Edit3 className="size-3.5" />}
          {editMode ? 'Preview' : 'Edit'}
        </button>
        <div className="w-px bg-white/20" />
        <div className="flex items-center gap-1">
          {(['en', 'es', 'both'] as FlyerLang[]).map(l => (
            <button key={l} onClick={() => setFlyerLang(l)} className={`px-2 py-1 rounded text-xs font-bold transition-all ${flyerLang === l ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`} data-testid={`button-lang-${l}`}>
              {l === 'both' ? 'EN+ES' : l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="w-px bg-white/20" />
        <div className="relative">
          <button onClick={() => setShowColors(!showColors)} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-all bg-white/10 text-white/60 hover:bg-white/20" data-testid="button-color-picker">
            <div className="size-3 rounded-full border border-white/30" style={{ backgroundColor: cs.swatch }} />
            <Palette className="w-3.5 h-3.5" />
          </button>
          {showColors && (
            <div className="absolute top-full mt-2 right-0 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[180px] z-50">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-medium">Color Scheme</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(colorSchemes) as ColorScheme[]).map(key => (
                  <button key={key} onClick={() => { setColorScheme(key); setShowColors(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${colorScheme === key ? 'bg-white/15 ring-1 ring-white/30' : 'hover:bg-white/10'}`} data-testid={`button-color-${key}`}>
                    <div className="size-5 rounded-full border-2 transition-all" style={{ backgroundColor: colorSchemes[key].swatch, borderColor: colorScheme === key ? '#fff' : 'transparent' }} />
                    <span className="text-[10px] text-white/70">{colorSchemes[key].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-px bg-white/20" />
        <button onClick={() => setLayout('stacked')} className={`hidden md:block p-2 rounded-lg transition-all ${layout === 'stacked' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`} data-testid="button-layout-stacked"><LayoutList className="w-5 h-5" /></button>
        <button onClick={() => setLayout('side-by-side')} className={`hidden md:block p-2 rounded-lg transition-all ${layout === 'side-by-side' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`} data-testid="button-layout-side"><LayoutGrid className="w-5 h-5" /></button>
        <div className="hidden md:block w-px bg-white/20" />
        <button onClick={downloadPDF} disabled={isGenerating} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50" data-testid="button-download-pdf"><Download className="w-4 h-4" />{isGenerating ? '...' : 'PDF'}</button>
        <button onClick={downloadImage} disabled={isGenerating} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50" data-testid="button-download-png"><Download className="w-4 h-4" />PNG</button>
        <button onClick={handlePrint} disabled={isGenerating} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50" data-testid="button-print"><Printer className="w-4 h-4" />Print</button>
        <button onClick={handleShare} disabled={isGenerating} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50" data-testid="button-share"><Share2 className="w-4 h-4" />Share</button>
        <button onClick={handleEmail} disabled={isGenerating} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50" data-testid="button-email"><Mail className="w-4 h-4" />Email</button>
        <div className="w-px bg-white/20" />
        <FlyerTipsModal />
      </div>

      <div className={`flex ${editMode ? 'flex-col lg:flex-row' : 'justify-center'} p-4 pt-4 md:p-8 md:pt-6 print:p-0 gap-4`}>
        {editMode && (
          <div className="w-full lg:w-80 lg:min-w-[320px] flex-shrink-0 print:hidden space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Edit Flyer Content</p>
                <button onClick={resetToDefaults} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-orange-400 transition-colors" data-testid="button-reset-defaults">
                  <RotateCcw className="size-3" /> Reset
                </button>
              </div>
              <div className="flex gap-1 mb-3">
                <button onClick={() => setEditLang('en')} className={`flex-1 px-2 py-1.5 rounded text-xs font-bold transition-all ${editLang === 'en' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'}`} data-testid="button-edit-lang-en">English</button>
                <button onClick={() => setEditLang('es')} className={`flex-1 px-2 py-1.5 rounded text-xs font-bold transition-all ${editLang === 'es' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'}`} data-testid="button-edit-lang-es">Español</button>
              </div>

              {/* Header Section */}
              <div className="border border-white/10 rounded-lg mb-2">
                <button onClick={() => toggleSection('header')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-toggle-header">
                  Header & Title {editorSection === 'header' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
                {editorSection === 'header' && (
                  <div className="p-2.5 pt-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">Title</label>
                        <input value={currentData.title} onChange={e => updateLangField(editLang, 'title', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-title" />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">Accent</label>
                        <input value={currentData.titleAccent} onChange={e => updateLangField(editLang, 'titleAccent', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-accent" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 mb-0.5 block">Tagline</label>
                      <input value={currentData.tagline} onChange={e => updateLangField(editLang, 'tagline', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-tagline" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 mb-0.5 block">Location</label>
                      <input value={currentData.location} onChange={e => updateLangField(editLang, 'location', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-location" />
                    </div>
                  </div>
                )}
              </div>

              {/* Deliver Labels */}
              <div className="border border-white/10 rounded-lg mb-2">
                <button onClick={() => toggleSection('deliver')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-toggle-deliver">
                  Delivery Categories {editorSection === 'deliver' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
                {editorSection === 'deliver' && (
                  <div className="p-2.5 pt-0 space-y-2">
                    <div>
                      <label className="text-[10px] text-white/40 mb-0.5 block">Section Title</label>
                      <input value={currentData.whatWeDeliver} onChange={e => updateLangField(editLang, 'whatWeDeliver', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-deliver-title" />
                    </div>
                    <label className="text-[10px] text-white/40 block">Category Labels</label>
                    <EditableList items={currentData.deliverLabels} onChange={v => updateLangField(editLang, 'deliverLabels', v)} placeholder="e.g., Food" />
                  </div>
                )}
              </div>

              {/* Content Sections */}
              <div className="border border-white/10 rounded-lg mb-2">
                <button onClick={() => toggleSection('sections')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-toggle-sections">
                  Content Sections ({currentData.sections.length}) {editorSection === 'sections' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
                {editorSection === 'sections' && (
                  <div className="p-2.5 pt-0 space-y-3">
                    {currentData.sections.map((section, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <input value={section.title} onChange={e => updateSection(editLang, i, 'title', e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-orange-500/50" data-testid={`input-section-title-${i}`} />
                          <button onClick={() => removeSection(editLang, i)} className="p-1 text-white/30 hover:text-red-400" data-testid={`button-remove-section-${i}`}><Trash2 className="size-3" /></button>
                        </div>
                        <EditableList items={section.features} onChange={v => updateSection(editLang, i, 'features', v)} placeholder="Feature text" />
                      </div>
                    ))}
                    <button onClick={() => addSection(editLang)} className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-white/20 text-xs text-white/50 hover:text-orange-400 hover:border-orange-500/40 transition-colors" data-testid="button-add-section">
                      <Plus className="size-3" /> Add Section
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border border-white/10 rounded-lg mb-2">
                <button onClick={() => toggleSection('footer')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-toggle-footer">
                  Footer & Website {editorSection === 'footer' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
                {editorSection === 'footer' && (
                  <div className="p-2.5 pt-0 space-y-2">
                    <div>
                      <label className="text-[10px] text-white/40 mb-0.5 block">Website URL</label>
                      <input value={config.websiteUrl} onChange={e => setConfig(p => ({ ...p, websiteUrl: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-website" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 mb-0.5 block">Copyright</label>
                      <input value={currentData.copyright} onChange={e => updateLangField(editLang, 'copyright', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-copyright" />
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="border border-white/10 rounded-lg mb-2">
                <button onClick={() => toggleSection('images')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-toggle-images">
                  Images & Logo {editorSection === 'images' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
                {editorSection === 'images' && (
                  <div className="p-2.5 pt-0 space-y-3">
                    <div>
                      <label className="text-[10px] text-white/40 mb-1 block">Logo / Emblem</label>
                      <div className="flex items-center gap-2">
                        <img src={config.logoUrl} alt="" className="size-10 rounded-lg border border-white/10 object-cover" />
                        <button onClick={() => logoInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all" data-testid="button-upload-logo">
                          <Upload className="size-3" /> Upload Logo
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 mb-1 block">Hero Image (left side)</label>
                      <div className="flex items-center gap-2">
                        {customHeroImage && <img src={customHeroImage} alt="" className="size-10 rounded-lg border border-white/10 object-cover" />}
                        <button onClick={() => heroInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all" data-testid="button-upload-hero">
                          <Image className="size-3" /> Upload Hero
                        </button>
                        {customHeroImage && (
                          <button onClick={() => setCustomHeroImage(null)} className="p-2 text-white/30 hover:text-red-400" data-testid="button-remove-hero"><Trash2 className="size-3" /></button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 mb-1 block">Background Image</label>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {STOCK_BGS.map(bg => (
                          <button key={bg.id} onClick={() => setConfig(p => ({ ...p, bgImageUrl: bg.url || null }))} className={`rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${config.bgImageUrl === (bg.url || null) ? 'border-orange-500' : 'border-white/10 hover:border-white/30'}`} data-testid={`button-bg-${bg.id}`}>
                            {bg.url ? (
                              <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[9px] text-white/40">None</div>
                            )}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => bgInputRef.current?.click()} className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all" data-testid="button-upload-bg">
                        <Upload className="size-3" /> Upload Custom Background
                      </button>
                      {config.bgImageUrl && (
                        <div className="mt-2">
                          <label className="text-[10px] text-white/40 mb-0.5 block">Overlay Darkness</label>
                          <input type="range" min={0} max={0.9} step={0.05} value={config.bgOverlayOpacity} onChange={e => setConfig(p => ({ ...p, bgOverlayOpacity: Number(e.target.value) }))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500 bg-white/10" data-testid="range-overlay" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex justify-center">
          <div
            ref={flyerRef}
            className={`bg-slate-800 print:bg-white rounded-lg print:rounded-none overflow-hidden shadow-2xl print:shadow-none flex flex-col max-w-xl ${
              layout === 'side-by-side' ? 'md:flex-row md:max-w-6xl' : ''
            }`}
          >
            <div className={`w-full ${layout === 'side-by-side' ? 'md:w-1/2' : 'max-h-[280px]'} overflow-hidden`}>
              <img
                src={customHeroImage || "/flyers/happyeats-partner-flyer.png"}
                alt="Happy Eats"
                className="w-full h-full object-cover"
                
              />
            </div>

            {flyerLang === 'both' ? (
              <div className={`w-full ${layout === 'side-by-side' ? 'md:w-1/2' : ''}`}>
                <FlyerPreview data={config.en} scheme={colorScheme} logoUrl={config.logoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} websiteUrl={config.websiteUrl} />
                <div className="border-t-2 border-dashed border-orange-500/30 mx-6" />
                <FlyerPreview data={config.es} scheme={colorScheme} logoUrl={config.logoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} websiteUrl={config.websiteUrl} />
              </div>
            ) : (
              <FlyerPreview data={config[flyerLang]} scheme={colorScheme} logoUrl={config.logoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} websiteUrl={config.websiteUrl} />
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 print:hidden">
        <div className="max-w-xl mx-auto bg-slate-800/90 backdrop-blur p-4 rounded-xl border border-white/10 text-center">
          <p className="text-white/70 text-sm">
            <strong className="text-white">Tip:</strong>{' '}
            Click <strong className="text-orange-400">Edit</strong> to customize all text, images, and sections. Download as PDF for professional printing, or PNG for digital sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
