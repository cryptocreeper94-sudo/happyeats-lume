import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Download, Shield, DollarSign, Users,
  TrendingUp, Clock, Star, MapPin, Smartphone, CreditCard,
  Zap, Palette, Share2, Mail, Printer,
  Edit3, Eye, Upload, Image, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, FolderOpen
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

interface Benefit { title: string; desc: string; }

interface VendorFlyerContentData {
  headerTitle: string;
  headerSub: string;
  partnerTitle: string;
  partnerSub: string;
  ctaLine: string;
  whyPartner: string;
  benefits: Benefit[];
  howItWorks: string;
  steps: string[];
  readyToGrow: string;
  scanToApply: string;
  footer: string;
  powered: string;
  printNote: string;
  locationTags: string[];
}

interface VendorFlyerConfig {
  en: VendorFlyerContentData;
  es: VendorFlyerContentData;
  logoUrl: string;
  brandLogoUrl: string;
  bgImageUrl: string | null;
  bgOverlayOpacity: number;
  qrUrl: string;
  websiteUrl: string;
}

const colorSchemes: Record<ColorScheme, {
  label: string;
  swatch: string;
  accent: { dark: string; light: string };
  ctaBg: { dark: string; light: string };
  benefitIcon: { dark: string; light: string };
  stepsBg: { dark: string; light: string };
  stepsBorder: { dark: string; light: string };
  stepsNum: { dark: string; light: string };
  accentMuted: { dark: string; light: string };
  borderAccent: string;
}> = {
  orange: { label: 'Orange', swatch: '#f97316', accent: { dark: 'text-orange-400', light: 'text-orange-600' }, ctaBg: { dark: 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/20', light: 'bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200' }, benefitIcon: { dark: 'text-orange-400', light: 'text-orange-600' }, stepsBg: { dark: 'bg-orange-500/10 border border-orange-500/20', light: 'bg-orange-50 border border-orange-200' }, stepsBorder: { dark: 'border-orange-500/20', light: 'border-orange-200' }, stepsNum: { dark: 'text-orange-400', light: 'text-orange-600' }, accentMuted: { dark: 'text-orange-400/70', light: 'text-orange-600/70' }, borderAccent: 'border-orange-500/20' },
  cyan: { label: 'Cyan', swatch: '#06b6d4', accent: { dark: 'text-cyan-400', light: 'text-cyan-600' }, ctaBg: { dark: 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/20', light: 'bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200' }, benefitIcon: { dark: 'text-emerald-400', light: 'text-emerald-600' }, stepsBg: { dark: 'bg-emerald-500/10 border border-emerald-500/20', light: 'bg-emerald-50 border border-emerald-200' }, stepsBorder: { dark: 'border-emerald-500/20', light: 'border-emerald-200' }, stepsNum: { dark: 'text-emerald-400', light: 'text-emerald-600' }, accentMuted: { dark: 'text-cyan-400/70', light: 'text-cyan-600/70' }, borderAccent: 'border-cyan-500/20' },
  purple: { label: 'Purple', swatch: '#a855f7', accent: { dark: 'text-purple-400', light: 'text-purple-600' }, ctaBg: { dark: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/20', light: 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200' }, benefitIcon: { dark: 'text-violet-400', light: 'text-violet-600' }, stepsBg: { dark: 'bg-violet-500/10 border border-violet-500/20', light: 'bg-violet-50 border border-violet-200' }, stepsBorder: { dark: 'border-violet-500/20', light: 'border-violet-200' }, stepsNum: { dark: 'text-violet-400', light: 'text-violet-600' }, accentMuted: { dark: 'text-purple-400/70', light: 'text-purple-600/70' }, borderAccent: 'border-purple-500/20' },
  blue: { label: 'Blue', swatch: '#3b82f6', accent: { dark: 'text-blue-400', light: 'text-blue-600' }, ctaBg: { dark: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/20', light: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' }, benefitIcon: { dark: 'text-sky-400', light: 'text-sky-600' }, stepsBg: { dark: 'bg-sky-500/10 border border-sky-500/20', light: 'bg-sky-50 border border-sky-200' }, stepsBorder: { dark: 'border-sky-500/20', light: 'border-sky-200' }, stepsNum: { dark: 'text-sky-400', light: 'text-sky-600' }, accentMuted: { dark: 'text-blue-400/70', light: 'text-blue-600/70' }, borderAccent: 'border-blue-500/20' },
  green: { label: 'Green', swatch: '#22c55e', accent: { dark: 'text-green-400', light: 'text-green-600' }, ctaBg: { dark: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20', light: 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' }, benefitIcon: { dark: 'text-emerald-400', light: 'text-emerald-600' }, stepsBg: { dark: 'bg-emerald-500/10 border border-emerald-500/20', light: 'bg-emerald-50 border border-emerald-200' }, stepsBorder: { dark: 'border-emerald-500/20', light: 'border-emerald-200' }, stepsNum: { dark: 'text-emerald-400', light: 'text-emerald-600' }, accentMuted: { dark: 'text-green-400/70', light: 'text-green-600/70' }, borderAccent: 'border-green-500/20' },
  red: { label: 'Red', swatch: '#ef4444', accent: { dark: 'text-red-400', light: 'text-red-600' }, ctaBg: { dark: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/20', light: 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200' }, benefitIcon: { dark: 'text-rose-400', light: 'text-rose-600' }, stepsBg: { dark: 'bg-rose-500/10 border border-rose-500/20', light: 'bg-rose-50 border border-rose-200' }, stepsBorder: { dark: 'border-rose-500/20', light: 'border-rose-200' }, stepsNum: { dark: 'text-rose-400', light: 'text-rose-600' }, accentMuted: { dark: 'text-red-400/70', light: 'text-red-600/70' }, borderAccent: 'border-red-500/20' },
};

const benefitIcons = [Users, DollarSign, Smartphone, MapPin, CreditCard, TrendingUp, Clock, Star];

const DEFAULT_CONFIG: VendorFlyerConfig = {
  en: {
    headerTitle: "Food Truck Partner Flyer",
    headerSub: "Download and distribute to local food trucks",
    partnerTitle: "Partner With Happy Eats",
    partnerSub: "Reach More Customers — We Deliver For You",
    ctaLine: "We deliver YOUR food to drivers, offices & warehouses — Free to Join, Pay Only When You Earn!",
    whyPartner: "Why Partner With Us?",
    benefits: [
      { title: "Reach More Customers", desc: "Drivers, offices & warehouses order from you" },
      { title: "Free to Join", desc: "Zero cost to sign up — no risk at all" },
      { title: "Easy Order Management", desc: "See orders come in through our simple app" },
      { title: "We Handle Delivery", desc: "We pick up and deliver — you just cook" },
      { title: "Weekly Direct Deposit", desc: "Get paid every week, no chasing payments" },
      { title: "Only 20% Per Order", desc: "No monthly fees — pay only when you earn" },
      { title: "Batch Orders by 11 AM", desc: "Know exactly what to prep — zero waste" },
      { title: "Free Marketing Support", desc: "We promote your food truck for you" },
    ],
    howItWorks: "How It Works",
    steps: [
      "Sign up free — zero cost to join",
      "Upload your menu and set your hours",
      "We collect orders by 11 AM — you prep the batch",
      "We pick up and deliver — you get paid weekly",
    ],
    readyToGrow: "Ready to grow your business?",
    scanToApply: "Scan to apply or visit happyeats.app/vendor-portal",
    footer: "Happy Eats • A Trust Layer Driver Connect Franchise",
    powered: "Powered by trustshield.tech • © 2026 Trust Layer. All rights reserved.",
    printNote: "High resolution PNG • Ready for print shops (FedEx, UPS, Staples) • 8.5\" x 11\" format",
    locationTags: ["I-24 Corridor", "La Vergne", "Smyrna, TN"],
  },
  es: {
    headerTitle: "Folleto para Socios de Food Trucks",
    headerSub: "Descarga y distribuye a food trucks locales",
    partnerTitle: "Asóciate con Happy Eats",
    partnerSub: "Llega a Más Clientes — Nosotros Entregamos Por Ti",
    ctaLine: "¡Entregamos TU comida a conductores, oficinas y almacenes — Gratis para Unirse, Paga Solo Cuando Ganes!",
    whyPartner: "¿Por Qué Asociarte Con Nosotros?",
    benefits: [
      { title: "Llega a Más Clientes", desc: "Conductores, oficinas y almacenes piden de ti" },
      { title: "Gratis para Unirse", desc: "Cero costo para registrarse — sin riesgo" },
      { title: "Gestión Fácil de Pedidos", desc: "Ve los pedidos llegar a través de nuestra app" },
      { title: "Nosotros Entregamos", desc: "Recogemos y entregamos — tú solo cocinas" },
      { title: "Depósito Directo Semanal", desc: "Cobra cada semana, sin perseguir pagos" },
      { title: "Solo 20% Por Pedido", desc: "Sin tarifas mensuales — paga solo cuando ganes" },
      { title: "Pedidos en Lote a las 11 AM", desc: "Sabe exactamente qué preparar — cero desperdicio" },
      { title: "Marketing Gratis", desc: "Promocionamos tu food truck por ti" },
    ],
    howItWorks: "Cómo Funciona",
    steps: [
      "Regístrate gratis — cero costo para unirse",
      "Sube tu menú y establece tus horarios",
      "Recopilamos pedidos antes de las 11 AM — tú preparas el lote",
      "Recogemos y entregamos — te pagan semanalmente",
    ],
    readyToGrow: "¿Listo para hacer crecer tu negocio?",
    scanToApply: "Escanea para aplicar o visita happyeats.app/vendor-portal",
    footer: "Happy Eats • Una Franquicia de Trust Layer Driver Connect",
    powered: "Impulsado por trustshield.tech • © 2026 Trust Layer. Todos los derechos reservados.",
    printNote: "PNG de alta resolución • Listo para imprenta (FedEx, UPS, Staples) • Formato 8.5\" x 11\"",
    locationTags: ["Corredor I-24", "La Vergne", "Smyrna, TN"],
  },
  logoUrl: "/trustlayer-emblem.jpg",
  brandLogoUrl: "/happyeats-emblem.png",
  bgImageUrl: null,
  bgOverlayOpacity: 0.6,
  qrUrl: "https://happyeats.app/vendor-portal",
  websiteUrl: "happyeats.app",
};

const STOCK_BGS = [
  { id: 'none', label: 'None', url: '' },
  { id: 'food-truck', label: 'Food Truck', url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=700&h=900&fit=crop' },
  { id: 'kitchen', label: 'Kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=900&fit=crop' },
  { id: 'market', label: 'Market', url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&h=900&fit=crop' },
  { id: 'nashville', label: 'Nashville', url: 'https://images.unsplash.com/photo-1545419913-775e3e0e9b96?w=700&h=900&fit=crop' },
  { id: 'abstract', label: 'Abstract', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=700&h=900&fit=crop' },
];

function EditableList({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1">
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50" placeholder={placeholder} data-testid={`input-list-${i}`} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-white/30 hover:text-red-400" data-testid={`button-remove-${i}`}><Trash2 className="size-3" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 mt-1" data-testid="button-add-list-item"><Plus className="size-3" /> Add</button>
    </div>
  );
}

function BenefitEditor({ benefits, onChange }: { benefits: Benefit[]; onChange: (b: Benefit[]) => void }) {
  return (
    <div className="space-y-2">
      {benefits.map((b, i) => (
        <div key={i} className="bg-white/5 rounded p-1.5 border border-white/5">
          <div className="flex gap-1 mb-1">
            <input value={b.title} onChange={e => { const n = [...benefits]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-cyan-500/50" placeholder="Title" data-testid={`input-benefit-title-${i}`} />
            <button onClick={() => onChange(benefits.filter((_, j) => j !== i))} className="p-1 text-white/30 hover:text-red-400" data-testid={`button-remove-benefit-${i}`}><Trash2 className="size-3" /></button>
          </div>
          <input value={b.desc} onChange={e => { const n = [...benefits]; n[i] = { ...n[i], desc: e.target.value }; onChange(n); }} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white/70 focus:outline-none focus:border-cyan-500/50" placeholder="Description" data-testid={`input-benefit-desc-${i}`} />
        </div>
      ))}
      <button onClick={() => onChange([...benefits, { title: "New Benefit", desc: "Description" }])} className="w-full flex items-center justify-center gap-1 py-1.5 rounded border border-dashed border-white/20 text-[10px] text-white/50 hover:text-cyan-400 hover:border-cyan-500/40" data-testid="button-add-benefit"><Plus className="size-3" /> Add Benefit</button>
    </div>
  );
}

function FlyerPanel({ data, theme, scheme, logoUrl, brandLogoUrl, bgImageUrl, bgOverlayOpacity, qrUrl, websiteUrl }: {
  data: VendorFlyerContentData; theme: 'dark' | 'light'; scheme: ColorScheme; logoUrl: string; brandLogoUrl: string; bgImageUrl: string | null; bgOverlayOpacity: number; qrUrl: string; websiteUrl: string;
}) {
  const cs = colorSchemes[scheme];
  const t = theme;
  return (
    <div className={`w-full max-w-[600px] rounded-xl p-4 relative overflow-hidden ${
      t === 'dark'
        ? `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border ${cs.borderAccent}`
        : 'bg-white border border-slate-200 shadow-xl'
    }`}>
      {bgImageUrl && (
        <>
          <div className="absolute inset-0 bg-cover bg-center rounded-xl" style={{ backgroundImage: `url(${bgImageUrl})` }} />
          <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: t === 'dark' ? '#000' : '#fff', opacity: bgOverlayOpacity }} />
        </>
      )}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`size-12 rounded-xl overflow-hidden border ${cs.borderAccent} flex-shrink-0`}>
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.partnerTitle}</h2>
            <p className={`text-xs ${cs.accent[t]}`}>{data.partnerSub}</p>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl mb-4 ${cs.ctaBg[t]}`}>
          <p className={`text-center text-sm font-medium ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.ctaLine}</p>
        </div>

        <h3 className={`font-bold mb-2 flex items-center gap-2 text-sm ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <Zap className={`size-3.5 ${cs.accent[t]}`} />
          {data.whyPartner}
        </h3>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {data.benefits.map((benefit, idx) => {
            const BIcon = benefitIcons[idx % benefitIcons.length];
            return (
              <div key={idx} className={`p-1.5 rounded-lg flex items-start gap-1.5 ${t === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <BIcon className={`size-3.5 mt-0.5 flex-shrink-0 ${cs.benefitIcon[t]}`} />
                <div>
                  <p className={`text-[11px] font-medium leading-tight ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>{benefit.title}</p>
                  <p className={`text-[9px] leading-tight ${t === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{benefit.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`p-3 rounded-xl mb-4 ${cs.stepsBg[t]}`}>
          <h3 className={`font-bold mb-2 text-center text-sm ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.howItWorks}</h3>
          <div className="grid grid-cols-2 gap-2">
            {data.steps.map((text, i) => (
              <div key={i} className={`flex items-start gap-1.5 ${t === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                <span className={`font-bold text-xs ${cs.stepsNum[t]}`}>{i + 1}.</span>
                <span className="text-[11px] leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-0.5 ${t === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.readyToGrow}</p>
            <p className={`text-[11px] ${cs.accent[t]}`}>{data.scanToApply}</p>
          </div>
          <div className={`p-1.5 rounded-lg ${t === 'dark' ? 'bg-white' : 'bg-white border border-slate-200'}`}>
            <QRCodeSVG value={qrUrl} size={56} level="M" includeMargin={false} />
          </div>
        </div>

        <div className={`mt-3 pt-3 border-t ${t === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                <img src={brandLogoUrl} alt="Brand" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className={`text-[9px] block ${t === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{data.footer}</span>
                <span className={`text-[9px] font-medium ${cs.accent[t]}`}>{websiteUrl}</span>
              </div>
            </div>
            <div className={`flex flex-col items-end gap-0 text-[9px] ${cs.accentMuted[t]}`}>
              {data.locationTags.map((tag, i) => (
                <span key={i}>{tag}</span>
              ))}
            </div>
          </div>
          <p className={`text-[8px] text-center mt-1 ${t === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{data.powered}</p>
        </div>
      </div>
    </div>
  );
}

export default function FoodTruckFlyer() {
  const [flyerTheme, setFlyerTheme] = useState<'dark' | 'light'>('dark');
  const [flyerLang, setFlyerLang] = useState<FlyerLang>('en');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('cyan');
  const [showColors, setShowColors] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [editorSection, setEditorSection] = useState<string | null>('header');
  const [config, setConfig] = useState<VendorFlyerConfig>(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  const flyerRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const cs = colorSchemes[colorScheme];
  const bgColor = flyerTheme === 'dark' ? '#0f172a' : '#ffffff';
  const langSuffix = flyerLang === 'both' ? 'bilingual' : flyerLang;
  const currentData = config[editLang];

  const updateField = useCallback((lang: 'en' | 'es', field: keyof VendorFlyerContentData, value: any) => {
    setConfig(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  }, []);

  const handleFileUpload = (setter: (url: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetToDefaults = () => setConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  const toggleSection = (id: string) => setEditorSection(editorSection === id ? null : id);

  const runAction = async (fn: () => Promise<void>) => {
    setIsDownloading(true);
    try { await fn(); } catch (err) {
      console.error("Export failed:", err);
      alert("Something went wrong. Please try again or use a different export option.");
    }
    setIsDownloading(false);
  };

  const handleDownloadPNG = () => runAction(async () => { if (flyerRef.current) await captureElementAsImage(flyerRef.current, `food-truck-partner-flyer-${flyerTheme}-${langSuffix}.png`, { scale: 3, backgroundColor: bgColor }); });
  const handleDownloadPDF = () => runAction(async () => { if (flyerRef.current) await captureElementAsPDF(flyerRef.current, `food-truck-partner-flyer-${flyerTheme}-${langSuffix}.pdf`, { scale: 3, backgroundColor: bgColor }); });
  const handleShare = () => runAction(async () => { if (flyerRef.current) await captureElementAndShare(flyerRef.current, `food-truck-partner-flyer-${flyerTheme}-${langSuffix}.png`, { scale: 3, backgroundColor: bgColor }); });
  const handleEmail = () => runAction(async () => { if (flyerRef.current) await captureElementAndEmail(flyerRef.current, `food-truck-partner-flyer-${flyerTheme}-${langSuffix}.png`, "Happy Eats Food Truck Partner Flyer", { scale: 3, backgroundColor: bgColor }); });
  const handlePrint = () => runAction(async () => { if (flyerRef.current) await captureElementAndPrint(flyerRef.current, { scale: 3, backgroundColor: bgColor }); });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleFileUpload(url => setConfig(p => ({ ...p, logoUrl: url })))} className="hidden" />
      <input ref={brandLogoInputRef} type="file" accept="image/*" onChange={handleFileUpload(url => setConfig(p => ({ ...p, brandLogoUrl: url })))} className="hidden" />
      <input ref={bgInputRef} type="file" accept="image/*" onChange={handleFileUpload(url => setConfig(p => ({ ...p, bgImageUrl: url })))} className="hidden" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-xl overflow-hidden border ${cs.borderAccent}`}>
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-white">
                {flyerLang === 'both' ? `${config.en.headerTitle} / ${config.es.headerTitle}` : config[flyerLang === 'es' ? 'es' : 'en'].headerTitle}
              </h1>
              <p className="text-xs text-muted-foreground">
                {flyerLang === 'both' ? `${config.en.headerSub} / ${config.es.headerSub}` : config[flyerLang === 'es' ? 'es' : 'en'].headerSub}
              </p>
            </div>
            <Link href="/flyer-catalog">
              <button className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/25 transition-all min-h-[36px]" data-testid="link-flyer-catalog">
                <FolderOpen className="size-3.5" />
                Flyer Catalog
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setEditMode(!editMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editMode ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`} data-testid="button-toggle-edit">
              {editMode ? <Eye className="size-3.5" /> : <Edit3 className="size-3.5" />}
              {editMode ? 'Preview' : 'Edit'}
            </button>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1">
              {(['en', 'es', 'both'] as FlyerLang[]).map(l => (
                <button key={l} onClick={() => setFlyerLang(l)} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${flyerLang === l ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/50 border border-white/10'}`} data-testid={`button-flyer-lang-${l}`}>
                  {l === 'both' ? 'EN+ES' : l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-white/20" />
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
            <div className="w-px h-6 bg-white/20" />
            <button onClick={() => setFlyerTheme('dark')} className={`px-3 py-1 rounded-md text-xs transition-colors ${flyerTheme === 'dark' ? 'bg-slate-800 text-white border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10'}`} data-testid="button-theme-dark">Dark</button>
            <button onClick={() => setFlyerTheme('light')} className={`px-3 py-1 rounded-md text-xs transition-colors ${flyerTheme === 'light' ? 'bg-white text-slate-900 border border-slate-300' : 'bg-white/5 text-white/50 border border-white/10'}`} data-testid="button-theme-light">Light</button>
            <div className="w-px h-6 bg-white/20" />
            <FlyerTipsModal />
          </div>
        </div>

        <div className={`flex ${editMode ? 'flex-col lg:flex-row' : 'justify-center'} gap-6`}>
          {editMode && (
            <div className="w-full lg:w-80 lg:min-w-[320px] flex-shrink-0 space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto">
              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Edit Flyer</p>
                  <button onClick={resetToDefaults} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-cyan-400" data-testid="button-reset"><RotateCcw className="size-3" /> Reset</button>
                </div>
                <div className="flex gap-1 mb-3">
                  <button onClick={() => setEditLang('en')} className={`flex-1 px-2 py-1.5 rounded text-xs font-bold ${editLang === 'en' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60'}`} data-testid="button-edit-en">English</button>
                  <button onClick={() => setEditLang('es')} className={`flex-1 px-2 py-1.5 rounded text-xs font-bold ${editLang === 'es' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60'}`} data-testid="button-edit-es">Español</button>
                </div>

                {/* Header */}
                <div className="border border-white/10 rounded-lg mb-2">
                  <button onClick={() => toggleSection('header')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-sec-header">
                    Header & Titles {editorSection === 'header' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {editorSection === 'header' && (
                    <div className="p-2.5 pt-0 space-y-2">
                      {[
                        { label: "Page Title", field: "headerTitle" as keyof VendorFlyerContentData },
                        { label: "Page Subtitle", field: "headerSub" as keyof VendorFlyerContentData },
                        { label: "Partner Title", field: "partnerTitle" as keyof VendorFlyerContentData },
                        { label: "Partner Subtitle", field: "partnerSub" as keyof VendorFlyerContentData },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="text-[10px] text-white/40 mb-0.5 block">{label}</label>
                          <input value={currentData[field] as string} onChange={e => updateField(editLang, field, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" data-testid={`input-${field}`} />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">CTA Line</label>
                        <textarea value={currentData.ctaLine} onChange={e => updateField(editLang, 'ctaLine', e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none" data-testid="input-ctaLine" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="border border-white/10 rounded-lg mb-2">
                  <button onClick={() => toggleSection('benefits')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-sec-benefits">
                    Benefits ({currentData.benefits.length}) {editorSection === 'benefits' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {editorSection === 'benefits' && (
                    <div className="p-2.5 pt-0">
                      <div className="mb-1"><label className="text-[10px] text-white/40 block">Section Title</label><input value={currentData.whyPartner} onChange={e => updateField(editLang, 'whyPartner', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 mb-2" data-testid="input-whyPartner" /></div>
                      <BenefitEditor benefits={currentData.benefits} onChange={v => updateField(editLang, 'benefits', v)} />
                    </div>
                  )}
                </div>

                {/* Steps */}
                <div className="border border-white/10 rounded-lg mb-2">
                  <button onClick={() => toggleSection('steps')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-sec-steps">
                    How It Works ({currentData.steps.length}) {editorSection === 'steps' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {editorSection === 'steps' && (
                    <div className="p-2.5 pt-0 space-y-2">
                      <div><label className="text-[10px] text-white/40 block mb-0.5">Section Title</label><input value={currentData.howItWorks} onChange={e => updateField(editLang, 'howItWorks', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" data-testid="input-howItWorks" /></div>
                      <EditableList items={currentData.steps} onChange={v => updateField(editLang, 'steps', v)} placeholder="Step description" />
                    </div>
                  )}
                </div>

                {/* Footer / CTA */}
                <div className="border border-white/10 rounded-lg mb-2">
                  <button onClick={() => toggleSection('footer')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-sec-footer">
                    Footer & QR Code {editorSection === 'footer' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {editorSection === 'footer' && (
                    <div className="p-2.5 pt-0 space-y-2">
                      {[
                        { label: "Ready to Grow?", field: "readyToGrow" as keyof VendorFlyerContentData },
                        { label: "Scan/Apply Text", field: "scanToApply" as keyof VendorFlyerContentData },
                        { label: "Footer Text", field: "footer" as keyof VendorFlyerContentData },
                        { label: "Powered By Text", field: "powered" as keyof VendorFlyerContentData },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="text-[10px] text-white/40 mb-0.5 block">{label}</label>
                          <input value={currentData[field] as string} onChange={e => updateField(editLang, field, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" data-testid={`input-${field}`} />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">Website URL</label>
                        <input value={config.websiteUrl} onChange={e => setConfig(p => ({ ...p, websiteUrl: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" data-testid="input-website-url" />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">QR Code URL</label>
                        <input value={config.qrUrl} onChange={e => setConfig(p => ({ ...p, qrUrl: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" data-testid="input-qr-url" />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-0.5 block">Location Tags</label>
                        <EditableList items={currentData.locationTags} onChange={v => updateField(editLang, 'locationTags', v)} placeholder="e.g., I-24 Corridor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="border border-white/10 rounded-lg mb-2">
                  <button onClick={() => toggleSection('images')} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white/70 hover:text-white" data-testid="button-sec-images">
                    Images & Logos {editorSection === 'images' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {editorSection === 'images' && (
                    <div className="p-2.5 pt-0 space-y-3">
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Main Logo</label>
                        <div className="flex items-center gap-2">
                          <img src={config.logoUrl} alt="" className="size-10 rounded-lg border border-white/10 object-cover" />
                          <button onClick={() => logoInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white" data-testid="button-upload-logo"><Upload className="size-3" /> Upload Logo</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Brand Logo (footer)</label>
                        <div className="flex items-center gap-2">
                          <img src={config.brandLogoUrl} alt="" className="size-10 rounded-lg border border-white/10 object-cover" />
                          <button onClick={() => brandLogoInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white" data-testid="button-upload-brand-logo"><Upload className="size-3" /> Upload Brand Logo</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 mb-1 block">Background Image</label>
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                          {STOCK_BGS.map(bg => (
                            <button key={bg.id} onClick={() => setConfig(p => ({ ...p, bgImageUrl: bg.url || null }))} className={`rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${config.bgImageUrl === (bg.url || null) ? 'border-cyan-500' : 'border-white/10 hover:border-white/30'}`} data-testid={`button-bg-${bg.id}`}>
                              {bg.url ? <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[9px] text-white/40">None</div>}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => bgInputRef.current?.click()} className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white" data-testid="button-upload-bg"><Upload className="size-3" /> Upload Custom</button>
                        {config.bgImageUrl && (
                          <div className="mt-2">
                            <label className="text-[10px] text-white/40 mb-0.5 block">Overlay Darkness</label>
                            <input type="range" min={0} max={0.9} step={0.05} value={config.bgOverlayOpacity} onChange={e => setConfig(p => ({ ...p, bgOverlayOpacity: Number(e.target.value) }))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-cyan-500 bg-white/10" data-testid="range-overlay" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-center mb-6" ref={flyerRef}>
              {flyerLang === 'both' ? (
                <div className="space-y-4">
                  <FlyerPanel data={config.en} theme={flyerTheme} scheme={colorScheme} logoUrl={config.logoUrl} brandLogoUrl={config.brandLogoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} qrUrl={config.qrUrl} websiteUrl={config.websiteUrl} />
                  <div className="flex items-center gap-4 px-4">
                    <div className="flex-1 border-t border-dashed border-cyan-500/30" />
                    <span className="text-[10px] text-cyan-400/50 font-medium">ENGLISH / ESPAÑOL</span>
                    <div className="flex-1 border-t border-dashed border-cyan-500/30" />
                  </div>
                  <FlyerPanel data={config.es} theme={flyerTheme} scheme={colorScheme} logoUrl={config.logoUrl} brandLogoUrl={config.brandLogoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} qrUrl={config.qrUrl} websiteUrl={config.websiteUrl} />
                </div>
              ) : (
                <FlyerPanel data={config[flyerLang === 'es' ? 'es' : 'en']} theme={flyerTheme} scheme={colorScheme} logoUrl={config.logoUrl} brandLogoUrl={config.brandLogoUrl} bgImageUrl={config.bgImageUrl} bgOverlayOpacity={config.bgOverlayOpacity} qrUrl={config.qrUrl} websiteUrl={config.websiteUrl} />
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button onClick={handleDownloadPNG} disabled={isDownloading} className="gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 min-h-[44px]" data-testid="button-download-png">
                {isDownloading ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</> : <><Download className="size-4" /> Download PNG</>}
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isDownloading} variant="outline" className="gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[44px]" data-testid="button-download-pdf"><Download className="size-4" /> PDF</Button>
              <Button onClick={handlePrint} disabled={isDownloading} variant="outline" className="gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[44px]" data-testid="button-print"><Printer className="size-4" /> Print</Button>
              <Button onClick={handleShare} disabled={isDownloading} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 min-h-[44px]" data-testid="button-share"><Share2 className="size-4" /> Share</Button>
              <Button onClick={handleEmail} disabled={isDownloading} variant="outline" className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]" data-testid="button-email"><Mail className="size-4" /> Email</Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mb-8">
              {flyerLang === 'both' ? `${config.en.printNote} / ${config.es.printNote}` : config[flyerLang === 'es' ? 'es' : 'en'].printNote}
            </p>

            <div className="text-center text-xs text-muted-foreground pb-8">
              <div className="flex justify-center gap-3 mb-2">
                <div className="size-10 rounded-lg overflow-hidden border border-cyan-500/20 opacity-60">
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="size-10 rounded-lg overflow-hidden border border-orange-500/20 opacity-80">
                  <img src={config.brandLogoUrl} alt="Brand" className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-white/70 mb-1">{flyerLang === 'both' ? `${config.en.footer} / ${config.es.footer}` : config[flyerLang === 'es' ? 'es' : 'en'].footer}</p>
              <p className="text-[10px]">Visit <span className="text-cyan-400">{config.websiteUrl}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
