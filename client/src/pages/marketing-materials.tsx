import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Download, FileText, Truck, Users, Mail,
  Printer, Copy, Shield, CreditCard, Camera,
  ChevronRight, Share2,
  Palette, Eye, EyeOff, Type, ImageIcon, Layers, RotateCcw,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Square, Circle, Minus, ChevronLeft, Check, ExternalLink, Star, Image
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { QRCodeSVG } from "qrcode.react";
import {
  captureElementAsImage,
  captureElementAsPDF,
  captureElementAndShare,
  captureElementAndEmail,
  captureElementAndPrint,
} from "@/lib/download-utils";

type TemplateId = 'classic' | 'centered' | 'minimal' | 'bold' | 'gradient' | 'corporate' | 'retro' | 'modern' | 'elegant' | 'trucker' | 'neon' | 'split';

interface CardConfig {
  name: string;
  title: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  membershipId: string;
  accentColor: string;
  fontStyle: 'sans' | 'serif' | 'mono';
  showQR: boolean;
  showBadge: boolean;
  showLogo: boolean;
  theme: 'dark' | 'light';
  bgImage: string | null;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
  bgFit: 'cover' | 'contain' | 'fill';
  bgPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  borderStyle: 'none' | 'solid' | 'accent-left' | 'accent-top' | 'accent-bottom' | 'double' | 'rounded-thick';
  borderWidth: number;
  textShadow: boolean;
  nameSize: 'sm' | 'md' | 'lg' | 'xl';
  nameWeight: 'normal' | 'bold' | 'black';
  nameAlign: 'left' | 'center' | 'right';
  cornerRadius: number;
  logoSize: number;
  qrSize: number;
}

const ACCENT_COLORS = [
  { id: 'orange', value: '#FF7849' }, { id: 'cyan', value: '#06B6D4' },
  { id: 'rose', value: '#F43F5E' }, { id: 'emerald', value: '#10B981' },
  { id: 'violet', value: '#8B5CF6' }, { id: 'amber', value: '#F59E0B' },
  { id: 'blue', value: '#3B82F6' }, { id: 'pink', value: '#EC4899' },
  { id: 'red', value: '#EF4444' }, { id: 'teal', value: '#14B8A6' },
  { id: 'indigo', value: '#6366F1' }, { id: 'gold', value: '#D4A017' },
  { id: 'slate', value: '#64748B' }, { id: 'white', value: '#FFFFFF' },
  { id: 'black', value: '#000000' },
];

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Logo left, info right' },
  { id: 'centered', label: 'Centered', desc: 'Balanced center layout' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean type-focused' },
  { id: 'bold', label: 'Bold', desc: 'Strong accent bar' },
  { id: 'gradient', label: 'Gradient', desc: 'Color gradient bg' },
  { id: 'corporate', label: 'Corporate', desc: 'Professional sidebar' },
  { id: 'retro', label: 'Retro 70s', desc: 'Warm retro vibes' },
  { id: 'modern', label: 'Modern', desc: 'Geometric clean' },
  { id: 'elegant', label: 'Elegant', desc: 'Refined thin lines' },
  { id: 'trucker', label: 'Trucker', desc: 'Road-themed driver' },
  { id: 'neon', label: 'Neon', desc: 'Glowing highlights' },
  { id: 'split', label: 'Split', desc: 'Two-tone layout' },
];

const BG_PATTERNS = [
  { id: 'none', label: 'None', css: '' },
  { id: 'dots', label: 'Dots', css: 'radial-gradient(circle, currentColor 1px, transparent 1px)' },
  { id: 'grid', label: 'Grid', css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' },
  { id: 'diagonal', label: 'Diagonal', css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)' },
  { id: 'waves', label: 'Waves', css: 'repeating-linear-gradient(0deg, transparent, transparent 15px, currentColor 15px, currentColor 16px)' },
  { id: 'chevron', label: 'Chevron', css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%)' },
];

const STOCK_BGS = [
  { id: 'dark-wood', label: 'Dark Wood', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&h=400&fit=crop' },
  { id: 'marble', label: 'Marble', url: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=700&h=400&fit=crop' },
  { id: 'concrete', label: 'Concrete', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=700&h=400&fit=crop' },
  { id: 'leather', label: 'Leather', url: 'https://images.unsplash.com/photo-1528458876861-544fd1d01a07?w=700&h=400&fit=crop' },
  { id: 'night-sky', label: 'Night Sky', url: 'https://images.unsplash.com/photo-1475274047050-1d0c55b7f341?w=700&h=400&fit=crop' },
  { id: 'sunset', label: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=700&h=400&fit=crop' },
  { id: 'road', label: 'Open Road', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&h=400&fit=crop' },
  { id: 'food-truck', label: 'Food Truck', url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=700&h=400&fit=crop' },
  { id: 'nashville', label: 'Nashville', url: 'https://images.unsplash.com/photo-1545419913-775e3e0e9b96?w=700&h=400&fit=crop' },
  { id: 'abstract-dark', label: 'Abstract Dark', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=700&h=400&fit=crop' },
  { id: 'abstract-color', label: 'Abstract Color', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=700&h=400&fit=crop' },
  { id: 'paper', label: 'Paper Texture', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&h=400&fit=crop' },
];

const BRAND_LOGOS = [
  { id: "smiley", name: "Happy Eats Smiley", desc: "Primary logo — cards, social, app icons", src: "/happyeats-smiley-hires.png", category: "Primary", formats: ["PNG"], bestFor: "Cards, Social, Avatars", gradient: "from-orange-500/20 to-rose-500/20", border: "border-orange-500/30" },
  { id: "icon-full", name: "Happy Eats Retro", desc: "Full retro poster logo — print & signage", src: "/happyeats-icon.png", category: "Full Logo", formats: ["PNG"], bestFor: "Print, Signage, Merch", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  { id: "app-icon", name: "App Badge Icon", desc: "Square app icon — app store & favicons", src: "/icon-512.png", category: "App Icon", formats: ["PNG"], bestFor: "App Store, Favicon", gradient: "from-violet-500/20 to-fuchsia-500/20", border: "border-violet-500/30" },
  { id: "tl-badge", name: "Trust Layer Emblem", desc: "Ecosystem badge — compliance docs & partnerships", src: "/trustlayer-emblem.jpg", category: "Ecosystem", formats: ["JPG"], bestFor: "Documents, Partners", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
  { id: "tl-icon", name: "TL Driver Connect", desc: "Driver Connect icon — franchise demos", src: "/tl-icon-512.png", category: "Ecosystem", formats: ["PNG"], bestFor: "Franchise Sales", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
];

const BRAND_COLORS = [
  { name: "Happy Eats Orange", hex: "#FF7849", usage: "Primary brand, buttons, accents" },
  { name: "Rose Gradient", hex: "#F43F5E", usage: "Gradient endpoints, highlights" },
  { name: "Deep Navy", hex: "#0f172a", usage: "Background, dark theme base" },
  { name: "Slate Dark", hex: "#1e293b", usage: "Cards, elevated surfaces" },
  { name: "Emerald", hex: "#10B981", usage: "Success states, active indicators" },
  { name: "Amber Gold", hex: "#F59E0B", usage: "Warnings, premium badges" },
  { name: "Violet", hex: "#8B5CF6", usage: "Marketing, onboarding accents" },
  { name: "Cyan", hex: "#06B6D4", usage: "Links, info highlights" },
];

const BRAND_TYPOGRAPHY = [
  { name: "System Sans", family: "system-ui, -apple-system, sans-serif", weight: "400–900", usage: "Primary UI text, body content", sample: "Happy Eats Nashville" },
  { name: "Monospace", family: "ui-monospace, monospace", weight: "400–700", usage: "Membership IDs, codes, data", sample: "TL-HE-2026-0001" },
  { name: "Georgia Serif", family: "Georgia, serif", weight: "400–700", usage: "Elegant templates, formal docs", sample: "Franchise Partner" },
];

const BRAND_GUIDELINES = [
  { title: "Clear Space", desc: "Maintain padding equal to logo height around the mark. Never crowd it.", icon: "📐" },
  { title: "Minimum Size", desc: "Smiley: never smaller than 32px on screen or 0.5\" in print.", icon: "📏" },
  { title: "Dark Backgrounds", desc: "Use smiley or retro icon. Orange pops on navy (#0f172a) or black.", icon: "🌙" },
  { title: "Light Backgrounds", desc: "Use retro icon or app badge. Add drop shadow if needed.", icon: "☀️" },
  { title: "No Modifications", desc: "Don't rotate, skew, recolor, or add effects to logos.", icon: "🚫" },
  { title: "Print Ready", desc: "All logos are 512px+ — cards, flyers, wraps, and merch ready.", icon: "🖨️" },
];

const FONT_MAP: Record<string, string> = { sans: 'font-sans', serif: 'font-serif', mono: 'font-mono' };
const NAME_SIZE_MAP: Record<string, string> = { sm: '14px', md: '18px', lg: '22px', xl: '28px' };
const NAME_WEIGHT_MAP: Record<string, number> = { normal: 400, bold: 700, black: 900 };

const DEFAULT_CONFIG: CardConfig = {
  name: '', title: '', businessName: '', tagline: '', phone: '', email: '',
  website: 'happyeats.app', membershipId: 'TL-HE-2026-0001',
  accentColor: '#FF7849', fontStyle: 'sans', showQR: true, showBadge: true, showLogo: true, theme: 'dark',
  bgImage: null, bgOverlayColor: '#000000', bgOverlayOpacity: 0, bgFit: 'cover', bgPosition: 'center',
  borderStyle: 'none', borderWidth: 2, textShadow: false,
  nameSize: 'lg', nameWeight: 'bold', nameAlign: 'left',
  cornerRadius: 12, logoSize: 64, qrSize: 60,
};

function SliderControl({ label, value, min, max, step = 1, onChange, unit = '' }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] text-muted-foreground">{label}</label>
        <span className="text-[11px] text-white/60 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-rose-500 bg-white/10" />
    </div>
  );
}

function ToggleChip({ active, onClick, children, testId }: { active: boolean; onClick: () => void; children: React.ReactNode; testId?: string }) {
  return (
    <button onClick={onClick} data-testid={testId}
      className={`px-2.5 py-1.5 rounded-md text-[11px] transition-all flex items-center gap-1 ${active ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
      {children}
    </button>
  );
}

export default function MarketingMaterials() {
  const [cardConfig, setCardConfig] = useState<CardConfig>({ ...DEFAULT_CONFIG });
  const [cardTemplate, setCardTemplate] = useState<TemplateId>('classic');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFlyer, setDownloadingFlyer] = useState<string | null>(null);
  const [templatePage, setTemplatePage] = useState(0);
  const [activePanel, setActivePanel] = useState<string>('template');
  const [bgPattern, setBgPattern] = useState('none');
  const businessCardRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const driverFlyerRef = useRef<HTMLDivElement>(null);
  const vendorFlyerRef = useRef<HTMLDivElement>(null);
  const vendorLetterRef = useRef<HTMLDivElement>(null);

  const u = useCallback((key: keyof CardConfig, value: any) => {
    setCardConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 25 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => u('bgImage', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const downloadAsImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    await captureElementAsImage(ref.current, `${filename}.png`, { scale: 4 });
  };

  const downloadAsPDF = async (ref: React.RefObject<HTMLDivElement | null>, filename: string, orientation: 'portrait' | 'landscape' = 'portrait') => {
    if (!ref.current) return;
    await captureElementAsPDF(ref.current, `${filename}.pdf`, {
      scale: 3,
      orientation,
      format: orientation === 'landscape' ? [3.5, 2] : 'letter',
    });
  };

  const shareAsImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    await captureElementAndShare(ref.current, `${filename}.png`, { scale: 3 });
  };

  const emailAsImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    await captureElementAndEmail(ref.current, `${filename}.png`, `Happy Eats - ${filename}`, { scale: 3 });
  };

  const handleDownloadPNG = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try { await downloadAsImage(businessCardRef, `business-card-${cardTemplate}`); }
    catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const handleDownloadPDF = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try { await downloadAsPDF(businessCardRef, `business-card-${cardTemplate}`, 'landscape'); }
    catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const handleDownloadPrintPDF = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try {
      await captureElementAsPDF(businessCardRef.current, 'business-cards-print-sheet.pdf', {
        scale: 4,
        orientation: 'portrait',
        format: 'letter',
      });
    } catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const handleEmailCard = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try {
      await emailAsImage(businessCardRef, `business-card-${cardTemplate}`);
    } catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const resetToDefaults = () => {
    setCardConfig({ ...DEFAULT_CONFIG });
    setCustomLogo(null);
    setBgPattern('none');
    setCardTemplate('classic');
  };

  const loadImageAsDataUrl = async (src: string): Promise<string> => {
    let fetchUrl = src;
    if (src.startsWith("http") && !src.includes(window.location.host)) {
      try {
        const resp = await fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`);
        if (resp.ok) {
          const blob = await resp.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch { /* fall through to canvas approach */ }
    }
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch { reject(new Error('Canvas tainted')); }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = fetchUrl;
    });
  };

  const deliverPdfBlob = async (pdfBlob: Blob, filename: string) => {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });

    try {
      const resp = await fetch('/api/download/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, filename, contentType: 'application/pdf' }),
      });
      if (!resp.ok) throw new Error('Server error');
      const { url } = await resp.json();
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 2000);
      return;
    } catch (e) {
      console.warn('Server download failed, using blob fallback:', e);
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
  };

  const buildFlyerPDF = async (type: 'driver' | 'vendor'): Promise<Blob> => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
    const pw = pdf.internal.pageSize.getWidth();
    const bgColor = [15, 23, 42];
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(0, 0, pw, 11, 'F');

    try {
      const imgData = await loadImageAsDataUrl('/flyers/happyeats-partner-flyer.png');
      pdf.addImage(imgData, 'JPEG', 0, 0, pw, 3.2);
    } catch (e) { console.warn('Emblem image failed to load for PDF'); }

    const cx = pw / 2;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.text('HAPPY', cx - 0.8, 3.7);
    pdf.setTextColor(255, 120, 73);
    pdf.text('EATS', cx + 0.5, 3.7);

    pdf.setFontSize(13);
    if (type === 'driver') {
      pdf.setTextColor(6, 182, 212);
      pdf.text('Hot Food Delivered to Your Location', cx, 4.1, { align: 'center' });
    } else {
      pdf.setTextColor(255, 120, 73);
      pdf.text('Partner With Us \u2014 Reach More Customers', cx, 4.1, { align: 'center' });
    }
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('I-24 Corridor \u2022 La Vergne \u2022 Smyrna, TN', cx, 4.4, { align: 'center' });

    const items = type === 'driver'
      ? ['Hot meals from local food trucks', 'Delivered right to your location', 'Order ahead \u2014 skip the line', 'Track your delivery in real time']
      : ['Only 20% Per Order', 'No Monthly Fees', 'Weekly Direct Deposit', 'Free Marketing Support'];

    let y = 4.8;
    if (type === 'driver') {
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Hungry at the truck stop, warehouse, or office?', cx, y, { align: 'center' });
      y += 0.35;
      pdf.setTextColor(6, 182, 212);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order by 11 AM \u2014 delivered by 11:30!', cx, y, { align: 'center' });
      y += 0.4;
    }

    const boxW = 3.2;
    const boxH = 0.45;
    const gap = 0.15;
    const startX = (pw - (boxW * 2 + gap)) / 2;
    const accent = type === 'driver' ? [6, 182, 212] : [255, 120, 73];

    for (let i = 0; i < items.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = startX + col * (boxW + gap);
      const by = y + row * (boxH + gap);
      pdf.setFillColor(accent[0], accent[1], accent[2]);
      pdf.roundedRect(bx, by, boxW, boxH, 0.08, 0.08, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(items[i], bx + boxW / 2, by + 0.28, { align: 'center' });
    }

    y += Math.ceil(items.length / 2) * (boxH + gap) + 0.3;

    if (type === 'vendor') {
      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(startX, y, boxW * 2 + gap, 0.45, 0.08, 0.08, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FREE TO JOIN \u2014 We Only Take 20% When We Bring You Business', cx, y + 0.28, { align: 'center' });
      y += 0.65;

      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(startX, y, boxW * 2 + gap, 1.6, 0.1, 0.1, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 120, 73);
      pdf.setFont('helvetica', 'bold');
      pdf.text('How It Works:', startX + 0.3, y + 0.3);
      pdf.setTextColor(200, 210, 220);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const steps = ['1. Sign up free \u2014 zero cost to join', '2. Upload your menu and set your hours', '3. We collect orders by 11 AM \u2014 you prep the batch', '4. We pick up and deliver \u2014 you get paid weekly'];
      steps.forEach((s, i) => {
        pdf.text(s, startX + 0.3, y + 0.6 + i * 0.25);
      });
      y += 1.8;
    }

    const ctaW = boxW * 2 + gap;
    const ctaH = 0.7;
    pdf.setFillColor(255, 120, 73);
    pdf.roundedRect(startX, y, ctaW, ctaH, 0.1, 0.1, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    const ctaText = type === 'driver' ? 'Order now at' : 'Apply today \u2014 start free!';
    pdf.text(ctaText, cx, y + 0.28, { align: 'center' });
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const ctaUrl = type === 'driver' ? 'happyeats.app' : 'happyeats.app';
    pdf.text(ctaUrl, cx, y + 0.55, { align: 'center' });

    y += ctaH + 0.3;
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('\u00A9 2026 Happy Eats \u2022 A Trust Layer Driver Connect Franchise', cx, y, { align: 'center' });

    return pdf.output('blob');
  };

  const handleDownloadFlyer = async (_ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    setDownloadingFlyer(name);
    try {
      const type = name.includes('vendor') ? 'vendor' : 'driver';
      const blob = await buildFlyerPDF(type);
      await deliverPdfBlob(blob, `${name}.pdf`);
    } catch (e) { console.error('Flyer PDF failed:', e); }
    setDownloadingFlyer(null);
  };

  const handleShareFlyer = async (_ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    setDownloadingFlyer(`share-${name}`);
    try {
      const type = name.includes('vendor') ? 'vendor' : 'driver';
      const blob = await buildFlyerPDF(type);
      await deliverPdfBlob(blob, `${name}.pdf`);
    } catch (e) { console.error(e); }
    setDownloadingFlyer(null);
  };

  const handleEmailFlyer = async (_ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    setDownloadingFlyer(`email-${name}`);
    try {
      const type = name.includes('vendor') ? 'vendor' : 'driver';
      const blob = await buildFlyerPDF(type);
      await deliverPdfBlob(blob, `${name}.pdf`);
      const mailSubject = encodeURIComponent(`Happy Eats - ${name}`);
      const mailBody = encodeURIComponent(`Here is the ${name} flyer from Happy Eats. The PDF has been saved to your Downloads.`);
      setTimeout(() => { window.location.href = `mailto:?subject=${mailSubject}&body=${mailBody}`; }, 1500);
    } catch (e) { console.error(e); }
    setDownloadingFlyer(null);
  };

  const handlePrintFlyer = async (_ref: React.RefObject<HTMLDivElement | null>) => {
    setDownloadingFlyer('printing');
    try {
      const blob = await buildFlyerPDF('driver');
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) {
        w.onload = () => setTimeout(() => w.print(), 500);
      }
    } catch (e) { console.error(e); }
    setDownloadingFlyer(null);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(`Dear [Vendor Name],\n\nWe are excited to invite you to partner with Happy Eats, a new delivery service designed specifically for truck drivers in the Nashville area. Many drivers are unable to leave their trucks during mandatory breaks, which limits their access to meals and essentials. By joining our network, your business can reach this underserved market directly.\n\nBenefits of partnership:\n- New revenue stream from drivers who otherwise could not visit your store\n- Simple order management through our vendor portal\n- Weekly payouts and clear reporting\n- Free marketing exposure through our app and social channels\n\nWe believe your business would be a perfect fit for this program. Let's schedule a quick call to discuss how we can get started.\n\nSincerely,\n[Your Name]\n[Title]\n[Contact Information]`);
  };

  const defaultLogoUrl = "/happyeats-smiley-hires.png";
  const logoSrc = customLogo || defaultLogoUrl;
  const c = cardConfig;
  const dn = c.name || 'Your Name';
  const dt = c.title || 'Franchise Owner';
  const db = c.businessName || 'Happy Eats Nashville';
  const dtag = c.tagline || 'Delivering happiness, one meal at a time';
  const isDark = c.theme === 'dark';
  const accent = c.accentColor;
  const ff = FONT_MAP[c.fontStyle];
  const txP = isDark ? '#ffffff' : '#1e293b';
  const txS = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(100,116,139,1)';
  const txM = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(148,163,184,1)';
  const tShadow = c.textShadow ? '0 1px 3px rgba(0,0,0,0.5)' : 'none';

  const cardBg = (): React.CSSProperties => {
    const base: React.CSSProperties = {};
    if (c.bgImage) {
      base.backgroundImage = `url(${c.bgImage})`;
      base.backgroundSize = c.bgFit;
      base.backgroundPosition = c.bgPosition;
      base.backgroundRepeat = 'no-repeat';
    } else if (cardTemplate === 'neon') {
      base.background = '#0a0a0a';
    } else if (cardTemplate === 'retro') {
      base.background = isDark ? 'linear-gradient(135deg, #2D1B00, #4A2800, #2D1B00)' : 'linear-gradient(135deg, #FFF8E7, #FFE8C2, #FFF8E7)';
    } else if (cardTemplate === 'trucker') {
      base.background = isDark ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #e2e8f0, #f1f5f9)';
    } else if (cardTemplate === 'gradient') {
      base.background = `linear-gradient(135deg, ${accent}22, ${accent}44, ${accent}22)`;
    } else {
      base.background = isDark ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' : '#ffffff';
    }
    return base;
  };

  const borderStyles = (): React.CSSProperties => {
    const bs = c.borderStyle;
    const bw = c.borderWidth;
    if (bs === 'none') return {};
    if (bs === 'solid') return { border: `${bw}px solid ${accent}` };
    if (bs === 'accent-left') return { borderLeft: `${bw + 2}px solid ${accent}` };
    if (bs === 'accent-top') return { borderTop: `${bw + 2}px solid ${accent}` };
    if (bs === 'accent-bottom') return { borderBottom: `${bw + 2}px solid ${accent}` };
    if (bs === 'double') return { border: `${bw}px double ${accent}` };
    if (bs === 'rounded-thick') return { border: `${bw + 1}px solid ${accent}`, boxShadow: `0 0 0 ${bw}px ${accent}33` };
    return {};
  };

  const overlayStyle = (): React.CSSProperties => {
    if (c.bgOverlayOpacity <= 0 && bgPattern === 'none') return { display: 'none' };
    const patternCss = bgPattern !== 'none' ? BG_PATTERNS.find(p => p.id === bgPattern)?.css || '' : '';
    return {
      position: 'absolute', inset: 0, zIndex: 1, borderRadius: c.cornerRadius,
      background: c.bgOverlayOpacity > 0
        ? `${c.bgOverlayColor}${Math.round(c.bgOverlayOpacity * 2.55).toString(16).padStart(2, '0')}`
        : 'transparent',
      ...(patternCss ? { backgroundImage: patternCss.replace(/currentColor/g, accent + '15'), backgroundSize: bgPattern === 'dots' ? '20px 20px' : bgPattern === 'grid' ? '20px 20px' : undefined } : {}),
    };
  };

  const qrBlock = c.showQR ? (
    <div style={{ padding: 8, borderRadius: 8, background: '#fff', display: 'inline-block', flexShrink: 0 }}>
      <QRCodeSVG value={`https://${c.website}`} size={c.qrSize} level="M" includeMargin={false} fgColor={accent} />
    </div>
  ) : null;

  const badgeBlock = c.showBadge ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: accent }}>
      <Shield style={{ width: 12, height: 12 }} />
      <span style={{ fontSize: 9, textShadow: tShadow }}>Trust Layer Verified</span>
    </div>
  ) : null;

  const memberBlock = c.membershipId ? (
    <p style={{ fontSize: 9, fontFamily: 'monospace', color: txM, textShadow: tShadow }}>{c.membershipId}</p>
  ) : null;

  const logoBlock = c.showLogo ? (
    <div style={{ width: c.logoSize, height: c.logoSize, borderRadius: c.logoSize > 80 ? 16 : 10, overflow: 'hidden', flexShrink: 0, border: `1px solid ${accent}50` }}>
      <img src={logoSrc} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  ) : null;

  const contactBlock = (align: 'left' | 'center' | 'right' = 'left') => (
    <div style={{ textAlign: align }}>
      {c.phone && <p style={{ fontSize: 11, color: txS, margin: '1px 0', textShadow: tShadow }}>{c.phone}</p>}
      {c.email && <p style={{ fontSize: 11, color: txS, margin: '1px 0', textShadow: tShadow }}>{c.email}</p>}
      {c.website && <p style={{ fontSize: 11, fontWeight: 500, color: accent, margin: '1px 0', textShadow: tShadow }}>{c.website}</p>}
    </div>
  );

  const nameStyle: React.CSSProperties = {
    fontSize: NAME_SIZE_MAP[c.nameSize], fontWeight: NAME_WEIGHT_MAP[c.nameWeight],
    color: txP, textAlign: c.nameAlign, lineHeight: 1.2, margin: 0, textShadow: tShadow,
  };

  const cardWrapper: React.CSSProperties = {
    width: 420, height: 240, borderRadius: c.cornerRadius, overflow: 'hidden',
    position: 'relative', fontFamily: c.fontStyle === 'serif' ? 'Georgia, serif' : c.fontStyle === 'mono' ? 'monospace' : 'system-ui, sans-serif',
    ...cardBg(), ...borderStyles(),
    ...((!c.bgImage && !isDark && cardTemplate !== 'neon') ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
  };

  const renderCard = () => {
    const t = cardTemplate;
    const content = { position: 'relative' as const, zIndex: 2, width: '100%', height: '100%' };

    if (t === 'classic') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 20, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {logoBlock}
              <div style={{ minWidth: 0 }}>
                <h2 style={nameStyle}>{dn}</h2>
                <p style={{ fontSize: 12, color: accent, margin: '3px 0', textShadow: tShadow }}>{dt}</p>
                <p style={{ fontSize: 11, color: txS, margin: 0, textShadow: tShadow }}>{db}</p>
              </div>
            </div>
            {contactBlock()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
            {qrBlock}
            <div style={{ textAlign: 'right' }}>{memberBlock}{badgeBlock}</div>
          </div>
        </div>
      </div>
    );

    if (t === 'centered') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {logoBlock}
            <div>
              <h2 style={{ ...nameStyle, textAlign: 'center' }}>{dn}</h2>
              <p style={{ fontSize: 11, color: accent, textShadow: tShadow }}>{dt} &bull; {db}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {contactBlock('center')}
            {qrBlock}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{memberBlock}{badgeBlock}</div>
        </div>
      </div>
    );

    if (t === 'minimal') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 20, display: 'flex' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={nameStyle}>{dn}</h2>
            <p style={{ fontSize: 13, color: accent, margin: '4px 0 12px', textShadow: tShadow }}>{dt}</p>
            <p style={{ fontSize: 11, color: txS, marginBottom: 8, textShadow: tShadow }}>{db}</p>
            {contactBlock()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {logoBlock}
            {qrBlock}
            {memberBlock}
          </div>
        </div>
      </div>
    );

    if (t === 'bold') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 8, background: accent, width: '100%' }} />
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ ...nameStyle, letterSpacing: '-0.5px' }}>{dn}</h2>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: accent, marginTop: 4, textShadow: tShadow }}>{dt}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: txP, textShadow: tShadow }}>{db}</p>
                {contactBlock()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {qrBlock}
                <div style={{ textAlign: 'right' }}>{memberBlock}{badgeBlock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'gradient') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 16 }}>
          <div style={{ background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.75)', borderRadius: 8, padding: 12, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {logoBlock}
              <div>
                <h2 style={nameStyle}>{dn}</h2>
                <p style={{ fontSize: 11, fontWeight: 500, color: accent, textShadow: tShadow }}>{dt}</p>
                <p style={{ fontSize: 11, color: txS, textShadow: tShadow }}>{db}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {contactBlock()}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{badgeBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'corporate') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ width: 100, background: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
            {logoBlock && <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 }}>{logoBlock}</div>}
            {qrBlock}
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={nameStyle}>{dn}</h2>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, textShadow: tShadow }}>{dt}</p>
              <p style={{ fontSize: 11, color: txS, marginTop: 2, textShadow: tShadow }}>{db}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {contactBlock()}
              <div style={{ textAlign: 'right' }}>{memberBlock}{badgeBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'retro') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ ...nameStyle, fontFamily: 'Georgia, serif' }}>{dn}</h2>
              <p style={{ fontSize: 11, fontStyle: 'italic', color: accent, textShadow: tShadow }}>{dt} — {db}</p>
            </div>
            {logoBlock}
          </div>
          <div style={{ height: 1, background: accent + '60', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, fontStyle: 'italic', color: txS, marginBottom: 4, textShadow: tShadow }}>"{dtag}"</p>
              {contactBlock()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{memberBlock}{badgeBlock}</div>
          </div>
        </div>
      </div>
    );

    if (t === 'modern') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 4, borderRadius: 2, background: accent }} />
                <div style={{ width: 16, height: 4, borderRadius: 2, background: accent + '60' }} />
              </div>
              <h2 style={nameStyle}>{dn}</h2>
              <p style={{ fontSize: 11, fontWeight: 500, color: accent, marginTop: 2, textShadow: tShadow }}>{dt}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: txP, marginBottom: 4, textShadow: tShadow }}>{db}</p>
              {contactBlock()}
            </div>
          </div>
          <div style={{ width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: accent + '15', borderLeft: `1px solid ${accent}40`, position: 'relative', zIndex: 2 }}>
            {logoBlock}
            {qrBlock}
            {memberBlock}
            {badgeBlock}
          </div>
        </div>
      </div>
    );

    if (t === 'elegant') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 4 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: c.cornerRadius - 4, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${accent}40` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ ...nameStyle, fontWeight: 300 }}>{dn}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div style={{ width: 24, height: 1, background: accent }} />
                  <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: accent, textShadow: tShadow }}>{dt}</p>
                </div>
              </div>
              {logoBlock}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 11, fontStyle: 'italic', color: txS, marginBottom: 6, textShadow: tShadow }}>{db}</p>
                {contactBlock()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{memberBlock}{badgeBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'trucker') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ width: 12, background: `repeating-linear-gradient(45deg, ${accent}, ${accent} 4px, transparent 4px, transparent 8px)`, position: 'relative', zIndex: 2 }} />
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck style={{ width: 20, height: 20, color: accent }} />
                  <h2 style={nameStyle}>{dn}</h2>
                </div>
                <p style={{ fontSize: 11, color: accent, marginTop: 2, textShadow: tShadow }}>{dt} &bull; {db}</p>
              </div>
              {logoBlock}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 10, color: txM, marginBottom: 4, textShadow: tShadow }}>{dtag}</p>
                {contactBlock()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{memberBlock}{badgeBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'neon') return (
      <div ref={businessCardRef} style={{ ...cardWrapper, boxShadow: `inset 0 0 30px ${accent}15, 0 0 15px ${accent}10` }}>
        <div style={overlayStyle()} />
        <div style={{ ...content, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ ...nameStyle, textShadow: `0 0 10px ${accent}80` }}>{dn}</h2>
              <p style={{ fontSize: 11, fontWeight: 500, color: accent, textShadow: `0 0 5px ${accent}60` }}>{dt}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{db}</p>
            </div>
            {logoBlock}
          </div>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              {c.phone && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{c.phone}</p>}
              {c.email && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{c.email}</p>}
              {c.website && <p style={{ fontSize: 11, fontWeight: 500, color: accent }}>{c.website}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {qrBlock}
              {memberBlock}
              {c.showBadge && <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: accent }}><Shield style={{ width: 12, height: 12, filter: `drop-shadow(0 0 3px ${accent})` }} /><span style={{ fontSize: 9 }}>Verified</span></div>}
            </div>
          </div>
        </div>
      </div>
    );

    if (t === 'split') return (
      <div ref={businessCardRef} style={cardWrapper}>
        <div style={overlayStyle()} />
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ width: 140, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: accent, position: 'relative', zIndex: 2 }}>
            {logoBlock && <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 4 }}>{logoBlock}</div>}
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>{db}</h2>
            {c.showBadge && <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)' }}><Shield style={{ width: 12, height: 12 }} /><span style={{ fontSize: 8 }}>Verified</span></div>}
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: c.bgImage ? 'transparent' : (isDark ? '#0f172a' : '#ffffff') }}>
            <div>
              <h2 style={nameStyle}>{dn}</h2>
              <p style={{ fontSize: 11, color: accent, textShadow: tShadow }}>{dt}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {contactBlock()}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{memberBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    return null;
  };

  const templatesPerPage = 6;
  const totalPages = Math.ceil(TEMPLATES.length / templatesPerPage);
  const visibleTemplates = TEMPLATES.slice(templatePage * templatesPerPage, (templatePage + 1) * templatesPerPage);

  const panels: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'template', label: 'Template', icon: <Layers className="size-3" /> },
    { id: 'info', label: 'Info', icon: <Type className="size-3" /> },
    { id: 'style', label: 'Style', icon: <Palette className="size-3" /> },
    { id: 'background', label: 'Background', icon: <ImageIcon className="size-3" /> },
    { id: 'elements', label: 'Elements', icon: <Square className="size-3" /> },
  ];

  const printContent = (
    <>
        <Accordion type="multiple" defaultValue={["business-card"]} className="space-y-4">
          <AccordionItem value="business-card" className="border-0">
            <Card className="glass-panel border-l-4 border-l-rose-400 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1">
                  <CreditCard className="size-4 text-rose-400" />
                  <span className="font-bold text-white text-sm">Business Card Designer</span>
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] ml-auto mr-2">12 Templates &bull; Full Customization</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-4">

                  <div className="flex justify-center mb-2 overflow-x-auto pb-2 -mx-2 px-2">
                    <div className="flex-shrink-0">{renderCard()}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <Button onClick={handleDownloadPNG} disabled={isDownloading} data-testid="button-download-card-png" size="sm" className="gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 min-h-[44px] text-xs">
                      {isDownloading ? <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="size-3" />} PNG
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={isDownloading} data-testid="button-download-card-pdf" size="sm" variant="outline" className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 min-h-[44px] text-xs">
                      <FileText className="size-3" /> PDF
                    </Button>
                    <Button onClick={handleDownloadPrintPDF} disabled={isDownloading} data-testid="button-download-print-sheet" size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[44px] text-xs">
                      <Printer className="size-3" /> Print (10)
                    </Button>
                    <Button onClick={handleEmailCard} disabled={isDownloading} data-testid="button-email-card" size="sm" variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[44px] text-xs">
                      <Mail className="size-3" /> Email
                    </Button>
                    <Button onClick={resetToDefaults} size="sm" variant="outline" className="gap-1.5 border-white/10 text-white/50 hover:bg-white/5 min-h-[44px] text-xs col-span-2 sm:col-span-1" data-testid="button-reset-card">
                      <RotateCcw className="size-3" /> Reset
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">3.5" x 2" standard &bull; 300+ DPI &bull; Print-ready for Office Max, FedEx, Staples &bull; Email-ready</p>

                  <div className="flex gap-0.5 sm:gap-1 border-b border-white/10 pb-1 overflow-x-auto -mx-2 px-2">
                    {panels.map(p => (
                      <button key={p.id} onClick={() => setActivePanel(p.id)} data-testid={`tab-${p.id}`}
                        className={`px-2 sm:px-3 py-2 rounded-t-md text-[11px] flex items-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors min-h-[44px] ${activePanel === p.id ? 'bg-white/10 text-white border-b-2 border-rose-400' : 'text-white/40 hover:text-white/60'}`}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>

                  {activePanel === 'template' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {visibleTemplates.map(t => (
                          <button key={t.id} onClick={() => setCardTemplate(t.id)} data-testid={`button-card-template-${t.id}`}
                            className={`px-2 py-2 rounded-md text-[11px] transition-all ${cardTemplate === t.id ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-1 ring-rose-500/20' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                            <span className="font-semibold block">{t.label}</span>
                            <span className="text-[9px] opacity-60 block mt-0.5 leading-tight">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} onClick={() => setTemplatePage(i)} data-testid={`button-template-page-${i}`}
                              className={`size-6 rounded-full text-[10px] font-bold transition-colors ${templatePage === i ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/15'}`}>
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Theme</label>
                          <div className="flex gap-2">
                            <ToggleChip active={c.theme === 'dark'} onClick={() => u('theme', 'dark')} testId="button-card-theme-dark">Dark</ToggleChip>
                            <ToggleChip active={c.theme === 'light'} onClick={() => u('theme', 'light')} testId="button-card-theme-light">Light</ToggleChip>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Font</label>
                          <div className="flex gap-1">
                            {(['sans', 'serif', 'mono'] as const).map(f => (
                              <ToggleChip key={f} active={c.fontStyle === f} onClick={() => u('fontStyle', f)} testId={`button-font-${f}`}>
                                {f === 'sans' ? 'Sans' : f === 'serif' ? 'Serif' : 'Mono'}
                              </ToggleChip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePanel === 'info' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'name', label: 'Your Name', placeholder: 'Kathy Grater' },
                        { key: 'title', label: 'Title / Role', placeholder: 'Franchise Owner' },
                        { key: 'businessName', label: 'Business Name', placeholder: 'Happy Eats Nashville' },
                        { key: 'tagline', label: 'Tagline', placeholder: 'Delivering happiness, one meal at a time' },
                        { key: 'phone', label: 'Phone', placeholder: '(615) 555-1234' },
                        { key: 'email', label: 'Email', placeholder: 'kathy@happyeats.app' },
                        { key: 'website', label: 'Website', placeholder: 'happyeats.app' },
                        { key: 'membershipId', label: 'Membership ID', placeholder: 'TL-HE-2026-0001' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</label>
                          <input type="text" value={(c as any)[f.key]} onChange={e => u(f.key as keyof CardConfig, e.target.value)} placeholder={f.placeholder}
                            data-testid={`input-card-${f.key}`}
                            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-rose-500/50" />
                        </div>
                      ))}
                    </div>
                  )}

                  {activePanel === 'style' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1.5 block">Accent Color</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {ACCENT_COLORS.map(col => (
                            <button key={col.id} onClick={() => u('accentColor', col.value)} data-testid={`button-color-${col.id}`}
                              className={`size-7 rounded-full transition-all border ${c.accentColor === col.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 border-white/50' : 'border-white/10 hover:scale-105'}`}
                              style={{ backgroundColor: col.value }} />
                          ))}
                          <div className="relative">
                            <input type="color" value={c.accentColor} onChange={e => u('accentColor', e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer size-7" data-testid="input-custom-color" />
                            <div className="size-7 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-white/40 hover:border-white/50 cursor-pointer">
                              <span className="text-[10px]">+</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Name Size</label>
                          <div className="flex gap-1">
                            {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
                              <ToggleChip key={s} active={c.nameSize === s} onClick={() => u('nameSize', s)}>{s.toUpperCase()}</ToggleChip>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Name Weight</label>
                          <div className="flex gap-1">
                            <ToggleChip active={c.nameWeight === 'normal'} onClick={() => u('nameWeight', 'normal')}><Type className="size-3" /></ToggleChip>
                            <ToggleChip active={c.nameWeight === 'bold'} onClick={() => u('nameWeight', 'bold')}><Bold className="size-3" /></ToggleChip>
                            <ToggleChip active={c.nameWeight === 'black'} onClick={() => u('nameWeight', 'black')}>Black</ToggleChip>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Text Align</label>
                          <div className="flex gap-1">
                            <ToggleChip active={c.nameAlign === 'left'} onClick={() => u('nameAlign', 'left')}><AlignLeft className="size-3" /></ToggleChip>
                            <ToggleChip active={c.nameAlign === 'center'} onClick={() => u('nameAlign', 'center')}><AlignCenter className="size-3" /></ToggleChip>
                            <ToggleChip active={c.nameAlign === 'right'} onClick={() => u('nameAlign', 'right')}><AlignRight className="size-3" /></ToggleChip>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1.5 block">Border Style</label>
                          <div className="flex gap-1 flex-wrap">
                            {(['none', 'solid', 'accent-left', 'accent-top', 'accent-bottom', 'double', 'rounded-thick'] as const).map(bs => (
                              <ToggleChip key={bs} active={c.borderStyle === bs} onClick={() => u('borderStyle', bs)}>
                                {bs === 'none' ? 'None' : bs === 'solid' ? <Square className="size-3" /> : bs === 'accent-left' ? 'L' : bs === 'accent-top' ? 'T' : bs === 'accent-bottom' ? 'B' : bs === 'double' ? '||' : <Circle className="size-3" />}
                              </ToggleChip>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SliderControl label="Corner Radius" value={c.cornerRadius} min={0} max={24} onChange={v => u('cornerRadius', v)} unit="px" />
                        <SliderControl label="Border Width" value={c.borderWidth} min={1} max={6} onChange={v => u('borderWidth', v)} unit="px" />
                      </div>

                      <div className="flex items-center gap-2">
                        <ToggleChip active={c.textShadow} onClick={() => u('textShadow', !c.textShadow)} testId="button-toggle-shadow">
                          {c.textShadow ? <Eye className="size-3" /> : <EyeOff className="size-3" />} Text Shadow
                        </ToggleChip>
                      </div>
                    </div>
                  )}

                  {activePanel === 'background' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-2 block">Stock Backgrounds</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                          <button onClick={() => u('bgImage', null)} data-testid="button-bg-none"
                            className={`aspect-video rounded-md text-[10px] flex items-center justify-center transition-all ${!c.bgImage ? 'ring-2 ring-rose-500 bg-white/10 text-white' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'}`}>
                            None
                          </button>
                          {STOCK_BGS.map(bg => (
                            <button key={bg.id} onClick={() => u('bgImage', bg.url)} data-testid={`button-bg-${bg.id}`}
                              className={`aspect-video rounded-md overflow-hidden transition-all relative ${c.bgImage === bg.url ? 'ring-2 ring-rose-500' : 'border border-white/10 hover:border-white/30'}`}>
                              <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white/80 text-center py-0.5">{bg.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted-foreground mb-2 block">Upload Custom Background</label>
                        <div className="flex gap-2">
                          <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                          <button onClick={() => bgInputRef.current?.click()} className="px-3 py-2 rounded-md text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-1.5" data-testid="button-upload-bg">
                            <Camera className="size-3" /> Upload Image
                          </button>
                          {c.bgImage && !STOCK_BGS.some(b => b.url === c.bgImage) && (
                            <button onClick={() => u('bgImage', null)} data-testid="button-clear-bg" className="px-3 py-2 rounded-md text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300">Clear</button>
                          )}
                        </div>
                      </div>

                      {c.bgImage && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1.5 block">Fit</label>
                            <div className="flex gap-1">
                              {(['cover', 'contain', 'fill'] as const).map(f => (
                                <ToggleChip key={f} active={c.bgFit === f} onClick={() => u('bgFit', f)}>{f}</ToggleChip>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1.5 block">Position</label>
                            <div className="flex gap-1 flex-wrap">
                              {(['center', 'top', 'bottom', 'left', 'right'] as const).map(p => (
                                <ToggleChip key={p} active={c.bgPosition === p} onClick={() => u('bgPosition', p)}>{p}</ToggleChip>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1.5 block">Overlay Pattern</label>
                        <div className="flex gap-1 flex-wrap">
                          {BG_PATTERNS.map(p => (
                            <ToggleChip key={p.id} active={bgPattern === p.id} onClick={() => setBgPattern(p.id)}>{p.label}</ToggleChip>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1.5 block">Overlay Color & Opacity</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={c.bgOverlayColor} onChange={e => u('bgOverlayColor', e.target.value)}
                            className="size-8 rounded cursor-pointer border border-white/20" data-testid="input-overlay-color" />
                          <div className="flex-1">
                            <SliderControl label="Opacity" value={c.bgOverlayOpacity} min={0} max={90} onChange={v => u('bgOverlayOpacity', v)} unit="%" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePanel === 'elements' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-2 block">Logo / Image</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          <button onClick={() => logoInputRef.current?.click()} className="px-3 py-2 rounded-md text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-1.5" data-testid="button-upload-card-image">
                            <Camera className="size-3" /> {customLogo ? 'Change Logo' : 'Upload Logo'}
                          </button>
                          {customLogo && <button onClick={() => setCustomLogo(null)} data-testid="button-reset-logo" className="px-3 py-2 rounded-md text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300">Reset Default</button>}
                          <ToggleChip active={c.showLogo} onClick={() => u('showLogo', !c.showLogo)} testId="button-toggle-logo">
                            {c.showLogo ? <Eye className="size-3" /> : <EyeOff className="size-3" />} Show Logo
                          </ToggleChip>
                        </div>
                        <div className="mt-2">
                          <label className="text-[10px] text-white/40 mb-1 block">Brand Logos</label>
                          <div className="flex gap-2">
                            {[
                              { src: '/happyeats-smiley-hires.png', label: 'Smiley' },
                              { src: '/happyeats-icon.png', label: 'Icon' },
                              { src: '/icon-512.png', label: 'Badge' },
                            ].map(logo => (
                              <button key={logo.label} onClick={() => setCustomLogo(logo.src)}
                                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${customLogo === logo.src ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-white/10 hover:border-white/30'}`}
                                title={logo.label} data-testid={`button-logo-${logo.label.toLowerCase()}`}>
                                <img src={logo.src} alt={logo.label} className="w-full h-full object-contain" />
                              </button>
                            ))}
                          </div>
                        </div>
                        {c.showLogo && (
                          <div className="mt-2">
                            <SliderControl label="Logo Size" value={c.logoSize} min={24} max={140} onChange={v => u('logoSize', v)} unit="px" />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ToggleChip active={c.showQR} onClick={() => u('showQR', !c.showQR)} testId="button-toggle-qr">
                              {c.showQR ? <Eye className="size-3" /> : <EyeOff className="size-3" />} QR Code
                            </ToggleChip>
                          </div>
                          {c.showQR && <SliderControl label="QR Size" value={c.qrSize} min={30} max={120} onChange={v => u('qrSize', v)} unit="px" />}
                        </div>
                        <div>
                          <ToggleChip active={c.showBadge} onClick={() => u('showBadge', !c.showBadge)} testId="button-toggle-badge">
                            {c.showBadge ? <Eye className="size-3" /> : <EyeOff className="size-3" />} Trust Badge
                          </ToggleChip>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="driver-flyer" className="border-0">
            <Card className="glass-panel border-l-4 border-l-cyan-400 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1">
                  <Users className="size-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">Driver Recruitment Flyer</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] ml-auto mr-2">Letter Size</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-4">
                  <div ref={driverFlyerRef} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl overflow-hidden border border-cyan-500/20">
                    <div className="relative">
                      <img src="/flyers/happyeats-partner-flyer.png" alt="Happy Eats" className="w-full h-48 object-cover brightness-110" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
                    </div>
                    <div className="px-6 pb-6 -mt-4 relative">
                      <div className="text-center mb-4">
                        <h3 className="text-3xl font-black text-white">HAPPY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">EATS</span></h3>
                        <p className="text-lg text-cyan-400 font-semibold">Hot Food Delivered to Your Location</p>
                        <p className="text-sm text-white/50">I-24 Corridor • La Vergne • Smyrna, TN</p>
                      </div>
                      <p className="text-white text-center text-base mb-3">Hungry at the truck stop, warehouse, or office?</p>
                      <p className="text-cyan-300 text-center font-bold text-lg mb-4">Order by 11 AM — delivered by 11:30!</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Hot meals from local food trucks</p></div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Delivered right to your location</p></div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Order ahead — skip the line</p></div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Track your delivery in real time</p></div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl p-4 text-center">
                        <p className="text-white font-bold text-base">Order now at</p>
                        <p className="text-white/90 text-lg sm:text-xl font-black mt-1">happyeats.app</p>
                      </div>
                      <p className="text-white/30 text-xs text-center mt-3">© 2026 Happy Eats • A Trust Layer Driver Connect Franchise</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={() => handleDownloadFlyer(driverFlyerRef, 'driver-recruitment-flyer')} disabled={!!downloadingFlyer} data-testid="button-download-driver-flyer" className="gap-2 bg-cyan-500/50 hover:bg-cyan-500/60 min-h-[44px]">
                      {downloadingFlyer === 'driver-recruitment-flyer' ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</> : <><Download className="size-4" /> PDF</>}
                    </Button>
                    <Button onClick={() => handleShareFlyer(driverFlyerRef, 'driver-recruitment-flyer')} disabled={!!downloadingFlyer} data-testid="button-share-driver-flyer" variant="outline" className="gap-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[44px]">
                      <Share2 className="size-4" /> Share
                    </Button>
                    <Button onClick={() => handleEmailFlyer(driverFlyerRef, 'driver-recruitment-flyer')} disabled={!!downloadingFlyer} data-testid="button-email-driver-flyer" variant="outline" className="gap-1 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]">
                      <Mail className="size-4" /> Email
                    </Button>
                    <Button onClick={() => handlePrintFlyer(driverFlyerRef)} disabled={!!downloadingFlyer} data-testid="button-print-driver-flyer" variant="outline" className="gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[44px]">
                      <Printer className="size-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[44px]" data-testid="button-advanced-driver-flyer" onClick={() => window.location.href = '/flyer'}>
                      <ChevronRight className="size-3" /> Advanced Editor
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="vendor-flyer" className="border-0">
            <Card className="glass-panel border-l-4 border-l-orange-400 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1">
                  <Truck className="size-4 text-orange-400" />
                  <span className="font-bold text-white text-sm">Food Truck / Vendor Partner Flyer</span>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] ml-auto mr-2">Print Ready</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-4">
                  <div ref={vendorFlyerRef} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl overflow-hidden border border-orange-500/20">
                    <div className="relative">
                      <img src="/flyers/happyeats-partner-flyer.png" alt="Happy Eats" className="w-full h-48 object-cover brightness-110" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
                    </div>
                    <div className="px-6 pb-6 -mt-4 relative">
                      <div className="text-center mb-4">
                        <h3 className="text-3xl font-black text-white">HAPPY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">EATS</span></h3>
                        <p className="text-lg text-orange-400 font-semibold">Partner With Us — Reach More Customers</p>
                        <p className="text-sm text-white/50">I-24 Corridor • La Vergne • Smyrna, TN</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center mb-3">
                        <p className="text-emerald-400 font-bold text-sm">FREE TO JOIN — Pay Only 20% When We Bring You Sales</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Only 20% Per Order</p></div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">No Monthly Fees</p></div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Weekly Direct Deposit</p></div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center"><p className="text-white font-medium text-sm">Free Marketing Support</p></div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                        <p className="text-orange-400 text-sm mb-2 font-bold">How It Works:</p>
                        <ol className="text-white/80 text-sm space-y-1.5">
                          <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">1.</span> Sign up free — zero cost to join, ever</li>
                          <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">2.</span> Upload your menu and set your hours</li>
                          <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">3.</span> We collect orders by 11 AM — you prep the batch</li>
                          <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">4.</span> We pick up and deliver — you get paid weekly</li>
                        </ol>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl p-4 text-center">
                        <p className="text-white font-bold text-base">Apply today — start free!</p>
                        <p className="text-white/90 text-lg sm:text-xl font-black mt-1 break-words">happyeats.app</p>
                      </div>
                      <p className="text-white/30 text-xs text-center mt-3">© 2026 Happy Eats • A Trust Layer Driver Connect Franchise</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={() => handleDownloadFlyer(vendorFlyerRef, 'vendor-partner-flyer')} disabled={!!downloadingFlyer} data-testid="button-download-vendor-flyer" className="gap-2 bg-orange-500/50 hover:bg-orange-500/60 min-h-[44px]">
                      {downloadingFlyer === 'vendor-partner-flyer' ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</> : <><Download className="size-4" /> PDF</>}
                    </Button>
                    <Button onClick={() => handleShareFlyer(vendorFlyerRef, 'vendor-partner-flyer')} disabled={!!downloadingFlyer} data-testid="button-share-vendor-flyer" variant="outline" className="gap-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 min-h-[44px]">
                      <Share2 className="size-4" /> Share
                    </Button>
                    <Button onClick={() => handleEmailFlyer(vendorFlyerRef, 'vendor-partner-flyer')} disabled={!!downloadingFlyer} data-testid="button-email-vendor-flyer" variant="outline" className="gap-1 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]">
                      <Mail className="size-4" /> Email
                    </Button>
                    <Button onClick={() => handlePrintFlyer(vendorFlyerRef)} disabled={!!downloadingFlyer} data-testid="button-print-vendor-flyer" variant="outline" className="gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[44px]">
                      <Printer className="size-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 min-h-[44px]" data-testid="button-advanced-vendor-flyer" onClick={() => window.location.href = '/food-truck-flyer'}>
                      <ChevronRight className="size-3" /> Advanced Editor
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="vendor-letter" className="border-0">
            <Card className="glass-panel border-l-4 border-l-fuchsia-400 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1">
                  <Mail className="size-4 text-fuchsia-400" />
                  <span className="font-bold text-white text-sm">Vendor Partnership Letter</span>
                  <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 text-[10px] ml-auto mr-2">Email Template</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-4">
                  <div ref={vendorLetterRef} className="bg-white/5 rounded-xl p-6 border border-white/10 font-mono text-sm leading-relaxed">
                    <p className="text-muted-foreground mb-4">Happy Eats<br />I-24 Corridor • La Vergne • Smyrna, TN<br />[Date]</p>
                    <p className="text-white mb-4">Dear [Vendor Name],</p>
                    <p className="text-gray-300 mb-4">We're inviting local food trucks to partner with Happy Eats, a delivery service for the I-24 corridor between La Vergne and Smyrna. We collect orders from truck drivers, office workers, and warehouse employees — then pick up from your truck and deliver in batches. You cook, we deliver.</p>
                    <p className="text-white mb-2">Why partner with us:</p>
                    <ul className="text-gray-300 mb-4 ml-4 space-y-1">
                      <li>- <strong className="text-emerald-400">Free to join</strong> — zero cost to sign up, no risk</li>
                      <li>- Only 20% per order — no monthly fees ever</li>
                      <li>- We collect orders by 11 AM so you know exactly what to prep</li>
                      <li>- We pick up the whole batch from you — no individual deliveries needed</li>
                      <li>- Weekly direct deposit payouts</li>
                      <li>- Free marketing — we promote your food truck to our customers</li>
                    </ul>
                    <p className="text-gray-300 mb-4">We're starting in the I-24 corridor (Exit 62 to Exit 70) where there are thousands of hungry drivers, warehouse workers, and office employees every day. Your food truck is a perfect fit.</p>
                    <p className="text-gray-300 mb-4">Sign up free at happyeats.app or give us a call to learn more.</p>
                    <p className="text-white">Kathy<br />Happy Eats — Owner<br />happyeats.app</p>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={handleCopyLetter} size="sm" data-testid="button-copy-vendor-letter" className="bg-fuchsia-500/50 hover:bg-fuchsia-500/60 gap-1 min-h-[44px]">
                      <Copy className="size-3" /> Copy
                    </Button>
                    <Button onClick={() => handleDownloadFlyer(vendorLetterRef, 'vendor-partnership-letter')} size="sm" variant="outline" data-testid="button-download-vendor-letter" className="gap-1 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 min-h-[44px]">
                      <Download className="size-3" /> PDF
                    </Button>
                    <Button onClick={() => handleShareFlyer(vendorLetterRef, 'vendor-partnership-letter')} size="sm" variant="outline" data-testid="button-share-vendor-letter" className="gap-1 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 min-h-[44px]">
                      <Share2 className="size-3" /> Share
                    </Button>
                    <Button onClick={() => handleEmailFlyer(vendorLetterRef, 'vendor-partnership-letter')} size="sm" variant="outline" data-testid="button-email-vendor-letter" className="gap-1 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]">
                      <Mail className="size-3" /> Email
                    </Button>
                    <Button onClick={() => handlePrintFlyer(vendorLetterRef)} size="sm" variant="outline" className="gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[44px]" data-testid="button-print-vendor-letter">
                      <Printer className="size-3" /> Print
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All materials are full color, print-ready, and optimized for email or professional printing at FedEx, UPS, Staples, Office Max, etc.
        </p>
    </>
  );

  return printContent;
}

export { MarketingMaterials as PrintStudioTab };
