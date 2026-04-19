import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Sparkles, Download, Printer, Mail, Share2, ArrowLeft,
  Loader2, Wand2, RefreshCw, Palette, Image as ImageIcon, Type,
  Upload, Trash2, Plus, X
} from "lucide-react";
import { jsPDF } from "jspdf";
import { FlyerTipsModal } from "@/components/flyer-tips-modal";

type Brand = "happy-eats" | "tl-driver-connect";
type Language = "en" | "es" | "both";
type FlyerStyle = "bold" | "elegant" | "playful" | "minimal";
type Orientation = "portrait" | "landscape";

interface GeneratedCopy {
  headline: string;
  tagline: string;
  bodyLines: string[];
  cta: string;
  ctaSubtext: string;
  imagePrompt: string;
}

const STYLES: Record<FlyerStyle, { label: string; bg: string; textColor: string; ctaGrad: string; accent: string }> = {
  bold: { label: "Bold", bg: "from-slate-900 via-slate-800 to-slate-900", textColor: "text-white", ctaGrad: "from-orange-500 to-rose-500", accent: "text-orange-400" },
  elegant: { label: "Elegant", bg: "from-zinc-900 via-neutral-900 to-zinc-900", textColor: "text-white", ctaGrad: "from-amber-500 to-yellow-500", accent: "text-amber-400" },
  playful: { label: "Playful", bg: "from-purple-900 via-fuchsia-900 to-purple-900", textColor: "text-white", ctaGrad: "from-pink-500 to-violet-500", accent: "text-pink-400" },
  minimal: { label: "Clean", bg: "from-white via-gray-50 to-white", textColor: "text-gray-900", ctaGrad: "from-cyan-500 to-blue-500", accent: "text-cyan-600" },
};

const brandConfigs = {
  "happy-eats": { name: "Happy Eats", logo: "/happy-eats-logo.png", accent: "orange" },
  "tl-driver-connect": { name: "TL Driver Connect", logo: "/tl-logo.png", accent: "cyan" },
};

const STYLE_COLORS: Record<FlyerStyle, { bg1: string; bg2: string; text: string; accent: string; ctaGrad: [string, string]; subtext: string; bodyText: string }> = {
  bold: { bg1: "#0f172a", bg2: "#1e293b", text: "#ffffff", accent: "#fb923c", ctaGrad: ["#f97316", "#f43f5e"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  elegant: { bg1: "#18181b", bg2: "#1c1917", text: "#ffffff", accent: "#fbbf24", ctaGrad: ["#f59e0b", "#eab308"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  playful: { bg1: "#581c87", bg2: "#701a75", text: "#ffffff", accent: "#ec4899", ctaGrad: ["#ec4899", "#8b5cf6"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  minimal: { bg1: "#ffffff", bg2: "#f9fafb", text: "#111827", accent: "#0891b2", ctaGrad: ["#06b6d4", "#3b82f6"], subtext: "rgba(107,114,128,1)", bodyText: "rgba(75,85,99,1)" },
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const renderFlyerToCanvas = async (
  copy: GeneratedCopy,
  flyerImage: string | null,
  style: FlyerStyle,
  brandName: string,
  orientation: Orientation = "portrait",
): Promise<HTMLCanvasElement> => {
  const W = orientation === "portrait" ? 2550 : 3300;
  const H = orientation === "portrait" ? 3300 : 2550;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const sc = STYLE_COLORS[style];

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, sc.bg1);
  grad.addColorStop(0.5, sc.bg2);
  grad.addColorStop(1, sc.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const isLandscape = orientation === "landscape";
  const imgSection = isLandscape ? Math.round(W * 0.45) : Math.round(H * 0.45);
  if (flyerImage) {
    try {
      const img = await loadImage(flyerImage);
      const imgRatio = img.width / img.height;
      if (isLandscape) {
        const drawH = Math.max(H, imgSection / imgRatio);
        const drawW = Math.max(imgSection, H * imgRatio);
        const offsetX = (imgSection - drawW) / 2;
        const offsetY = (H - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        const overlay = ctx.createLinearGradient(0, 0, imgSection, 0);
        const overlayColor = style === "minimal" ? "255,255,255" : "0,0,0";
        overlay.addColorStop(0, `rgba(${overlayColor},0.6)`);
        overlay.addColorStop(0.4, `rgba(${overlayColor},0.1)`);
        overlay.addColorStop(1, `rgba(${overlayColor},0.8)`);
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, imgSection, H);
      } else {
        const drawW = Math.max(W, imgSection * imgRatio);
        const drawH = Math.max(imgSection, W / imgRatio);
        const offsetX = (W - drawW) / 2;
        const offsetY = (imgSection - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        const overlay = ctx.createLinearGradient(0, 0, 0, imgSection);
        const overlayColor = style === "minimal" ? "255,255,255" : "0,0,0";
        overlay.addColorStop(0, `rgba(${overlayColor},0.6)`);
        overlay.addColorStop(0.4, `rgba(${overlayColor},0.1)`);
        overlay.addColorStop(1, `rgba(${overlayColor},0.8)`);
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, W, imgSection);
      }
    } catch (e) {
      console.error("Failed to draw flyer image:", e);
    }
  }

  const textStartX = isLandscape ? imgSection + 80 : 160;
  const textAreaW = isLandscape ? W - imgSection - 160 : W - 320;

  ctx.fillStyle = sc.text;
  ctx.font = "bold 48px system-ui, -apple-system, sans-serif";
  ctx.fillText(brandName, textStartX, isLandscape ? 120 : 120);

  const textTop = isLandscape ? 200 : imgSection + 120;
  const pad = textStartX;
  const maxTextW = textAreaW;

  ctx.fillStyle = sc.text;
  ctx.font = "900 120px system-ui, -apple-system, sans-serif";
  const headlineLines = wrapText(ctx, copy.headline, maxTextW);
  let y = textTop;
  for (const line of headlineLines) {
    ctx.fillText(line, pad, y);
    y += 140;
  }

  y += 20;
  ctx.fillStyle = sc.accent;
  ctx.font = "600 64px system-ui, -apple-system, sans-serif";
  const taglineLines = wrapText(ctx, copy.tagline, maxTextW);
  for (const line of taglineLines) {
    ctx.fillText(line, pad, y);
    y += 80;
  }

  y += 60;
  ctx.fillStyle = sc.bodyText;
  ctx.font = "400 52px system-ui, -apple-system, sans-serif";
  for (const bodyLine of copy.bodyLines) {
    const ctaGrd = ctx.createLinearGradient(pad, y, pad + 20, y);
    ctaGrd.addColorStop(0, sc.ctaGrad[0]);
    ctaGrd.addColorStop(1, sc.ctaGrad[1]);
    ctx.fillStyle = ctaGrd;
    ctx.beginPath();
    ctx.arc(pad + 10, y - 14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sc.bodyText;
    const bLines = wrapText(ctx, bodyLine, maxTextW - 60);
    for (const bl of bLines) {
      ctx.fillText(bl, pad + 40, y);
      y += 68;
    }
    y += 16;
  }

  const ctaH = isLandscape ? 120 : 150;
  const ctaW = maxTextW;
  const ctaY = H - (isLandscape ? 350 : 420);
  const ctaR = 40;
  const ctaGrad = ctx.createLinearGradient(pad, ctaY, pad + ctaW, ctaY);
  ctaGrad.addColorStop(0, sc.ctaGrad[0]);
  ctaGrad.addColorStop(1, sc.ctaGrad[1]);
  ctx.fillStyle = ctaGrad;
  ctx.beginPath();
  drawRoundRect(ctx, pad, ctaY, ctaW, ctaH, ctaR);
  ctx.fill();

  const textCenterX = pad + ctaW / 2;

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${isLandscape ? 60 : 72}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(copy.cta, textCenterX, ctaY + ctaH / 2 + 24);

  ctx.fillStyle = sc.subtext;
  ctx.font = `400 ${isLandscape ? 34 : 40}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(copy.ctaSubtext, textCenterX, ctaY + ctaH + 70);

  ctx.fillStyle = sc.subtext;
  ctx.font = "400 32px system-ui, -apple-system, sans-serif";
  ctx.fillText(`${brandName} • www.tldriverconnect.com`, textCenterX, H - 80);

  ctx.textAlign = "start";

  return canvas;
};

const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) {
      if (current) { lines.push(current); current = ""; }
      let remaining = word;
      while (remaining.length > 0) {
        let fit = remaining.length;
        while (fit > 1 && ctx.measureText(remaining.substring(0, fit)).width > maxWidth) fit--;
        lines.push(remaining.substring(0, fit));
        remaining = remaining.substring(fit);
      }
      continue;
    }
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

type CreationMode = "choose" | "ai" | "manual" | "hybrid";

export default function AIFlyerCreator() {
  const [message, setMessage] = useState("");
  const [brand, setBrand] = useState<Brand>("happy-eats");
  const [language, setLanguage] = useState<Language>("en");
  const [style, setStyle] = useState<FlyerStyle>("bold");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [step, setStep] = useState<"input" | "generating" | "preview">("input");
  const [creationMode, setCreationMode] = useState<CreationMode>("choose");
  const [generatingPhase, setGeneratingPhase] = useState("");
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);
  const [flyerImage, setFlyerImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hybridAiText, setHybridAiText] = useState(true);
  const [hybridAiImage, setHybridAiImage] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const manualImageInputRef = useRef<HTMLInputElement>(null);

  const generateFlyer = useCallback(async () => {
    if (!message.trim()) return;
    setStep("generating");
    setErrorMessage("");

    const needsAiText = creationMode === "ai" || (creationMode === "hybrid" && hybridAiText);
    const needsAiImage = creationMode === "ai" || (creationMode === "hybrid" && hybridAiImage);

    try {
      if (needsAiText) {
        setGeneratingPhase("Writing your marketing copy...");
        const copyRes = await fetch("/api/flyers/generate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message.trim(), brand, language }),
        });
        if (!copyRes.ok) {
          const errData = await copyRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to generate copy");
        }
        const copyData: GeneratedCopy = await copyRes.json();
        setCopy(copyData);

        if (needsAiImage) {
          setGeneratingPhase("Creating your custom image...");
          const imgRes = await fetch("/api/flyers/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: copyData.imagePrompt }),
          });
          if (!imgRes.ok) throw new Error("Failed to generate image");
          const imgData = await imgRes.json();
          setFlyerImage(`data:image/png;base64,${imgData.b64_json}`);
        }
      } else if (needsAiImage && copy) {
        setGeneratingPhase("Creating your custom image...");
        const prompt = copy.imagePrompt || message.trim();
        const imgRes = await fetch("/api/flyers/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!imgRes.ok) throw new Error("Failed to generate image");
        const imgData = await imgRes.json();
        setFlyerImage(`data:image/png;base64,${imgData.b64_json}`);
      }

      setStep("preview");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "";
      if (msg.includes("temporarily unavailable")) {
        setErrorMessage("AI service is temporarily unavailable. Your text is saved — try again in a few minutes.");
      } else {
        setErrorMessage("Something went wrong. Your text is saved — tap the button to try again.");
      }
      setStep("input");
    }
  }, [message, brand, language, creationMode, hybridAiText, hybridAiImage, copy]);

  const startManualFlyer = useCallback(() => {
    setCopy({
      headline: "Your Headline Here",
      tagline: "Your tagline goes here",
      bodyLines: ["First key point", "Second key point", "Third key point"],
      cta: "Order Now",
      ctaSubtext: "www.tldriverconnect.com",
      imagePrompt: "",
    });
    setFlyerImage(null);
    setStep("preview");
  }, []);

  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFlyerImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const regenerateImage = useCallback(async () => {
    if (!copy) return;
    setIsExporting(true);
    try {
      const imgRes = await fetch("/api/flyers/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: copy.imagePrompt }),
      });
      if (!imgRes.ok) throw new Error("Failed");
      const imgData = await imgRes.json();
      setFlyerImage(`data:image/png;base64,${imgData.b64_json}`);
    } catch (err) {
      console.error(err);
    }
    setIsExporting(false);
  }, [copy]);

  const s = STYLES[style];
  const bc = brandConfigs[brand];

  const updateCopyField = (field: keyof GeneratedCopy, value: string | string[]) => {
    if (copy) setCopy({ ...copy, [field]: value });
  };

  const addBodyLine = () => {
    if (copy) setCopy({ ...copy, bodyLines: [...copy.bodyLines, "New point"] });
  };

  const removeBodyLine = (index: number) => {
    if (copy && copy.bodyLines.length > 1) {
      const lines = copy.bodyLines.filter((_, i) => i !== index);
      setCopy({ ...copy, bodyLines: lines });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFlyerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getCanvas = useCallback(async () => {
    if (!copy) throw new Error("No copy");
    return renderFlyerToCanvas(copy, flyerImage, style, bc.name, orientation);
  }, [copy, flyerImage, style, bc.name, orientation]);

  const downloadPNG = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-flyer.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas]);

  const downloadPDF = useCallback(async () => {
    const canvas = await getCanvas();
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ orientation, unit: "in", format: "letter" });
    const pW = pdf.internal.pageSize.getWidth();
    const pH = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "JPEG", 0, 0, pW, pH);
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-flyer.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas]);

  const printFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    const base64 = await blobToBase64(blob);
    const pageSize = orientation === "portrait" ? "8.5in 11in" : "11in 8.5in";
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Print Flyer</title>
<style>
  @page { size: ${pageSize}; margin: 0 !important; }
  * { margin: 0 !important; padding: 0 !important; box-sizing: border-box; }
  html, body { width: ${orientation === "portrait" ? "8.5in" : "11in"}; height: ${orientation === "portrait" ? "11in" : "8.5in"}; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  img { width: 100%; height: 100%; object-fit: fill; display: block; page-break-inside: avoid; }
  @media print {
    html, body { width: 100%; height: 100%; }
    img { width: 100%; height: 100vh; object-fit: fill; }
  }
</style>
</head><body><img src="${base64}" onload="setTimeout(function(){window.print()},300)" /></body></html>`);
    w.document.close();
  }, [getCanvas, orientation]);

  const shareFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "ai-flyer.png", { type: "image/png" });
      const data = { files: [file], title: "AI Flyer" };
      try { if (navigator.canShare(data)) { await navigator.share(data); return; } } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-flyer.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas]);

  const emailFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "ai-flyer.png", { type: "image/png" });
      const data = { files: [file], title: "Marketing Flyer" };
      try { if (navigator.canShare(data)) { await navigator.share(data); return; } } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-flyer.png";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const subject = encodeURIComponent("Marketing Flyer");
      const body = encodeURIComponent("Here is the flyer from Happy Eats.\n\nThe file has been downloaded — please attach it to this email.");
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    }, 1500);
  }, [getCanvas]);

  const runAction = async (fn: () => Promise<void>) => {
    setIsExporting(true);
    try { await fn(); } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setIsExporting(false);
  };

  const startOver = () => {
    setStep("input");
    setCreationMode("choose");
    setCopy(null);
    setFlyerImage(null);
    setMessage("");
    setErrorMessage("");
    setHybridAiText(true);
    setHybridAiImage(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={manualImageInputRef} type="file" accept="image/*" onChange={handleManualImageUpload} className="hidden" />
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all" data-testid="button-back">
                <ArrowLeft className="size-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="size-5 text-orange-400" />
                Flyer Creator
              </h1>
              <p className="text-xs text-slate-400">
                {creationMode === "choose" ? "Choose how you want to build your flyer" :
                 creationMode === "ai" ? "AI handles the text and image for you" :
                 creationMode === "manual" ? "You write everything — full control" :
                 "Mix AI and your own content"}
              </p>
            </div>
            <Link href="/flyer-catalog">
              <button className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/25 transition-all min-h-[36px]" data-testid="link-flyer-catalog">
                <ImageIcon className="size-3.5" />
                Flyer Catalog
              </button>
            </Link>
          </div>
          {step === "preview" && (
            <div className="flex items-center gap-2 flex-wrap">
              <FlyerTipsModal />
              <button onClick={() => runAction(downloadPNG)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white disabled:opacity-50 transition-all" data-testid="button-download-png">
                <Download className="size-3.5" />{isExporting ? "..." : "PNG"}
              </button>
              <button onClick={() => runAction(downloadPDF)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-download-pdf">
                <Download className="size-3.5" />PDF
              </button>
              <button onClick={() => runAction(printFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-print">
                <Printer className="size-3.5" />Print
              </button>
              <button onClick={() => runAction(shareFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-share">
                <Share2 className="size-3.5" />Share
              </button>
              <button onClick={() => runAction(emailFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-email">
                <Mail className="size-3.5" />Email
              </button>
            </div>
          )}
        </div>

        {step === "input" && creationMode === "choose" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-2">How do you want to create your flyer?</h2>
              <p className="text-sm text-slate-400">Pick the option that works best for you. You can always change things later.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setCreationMode("ai")}
                className="group relative bg-slate-800/80 backdrop-blur-xl border-2 border-orange-500/30 hover:border-orange-500 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10"
                data-testid="button-mode-ai"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mb-4">
                  <Wand2 className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">AI Does It All</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Just tell AI what you want. It writes the text and creates an image for you. Fastest option.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-orange-400">
                    <Sparkles className="size-3" /> AI writes your text
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-400">
                    <ImageIcon className="size-3" /> AI creates the image
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Type className="size-3" /> You can still edit everything after
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                  Easiest
                </div>
              </button>

              <button
                onClick={() => setCreationMode("manual")}
                className="group relative bg-slate-800/80 backdrop-blur-xl border-2 border-cyan-500/30 hover:border-cyan-500 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
                data-testid="button-mode-manual"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                  <Type className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Do It Yourself</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Write your own text and upload your own image. Full creative control, no AI involved.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Type className="size-3" /> You write the text
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Upload className="size-3" /> You upload your image
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Palette className="size-3" /> Choose your style and colors
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  Full Control
                </div>
              </button>

              <button
                onClick={() => setCreationMode("hybrid")}
                className="group relative bg-slate-800/80 backdrop-blur-xl border-2 border-violet-500/30 hover:border-violet-500 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10"
                data-testid="button-mode-hybrid"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <Sparkles className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Mix & Match</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Use AI for some parts and add your own for others. Best of both worlds.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-violet-400">
                    <Wand2 className="size-3" /> AI text + your image
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-400">
                    <Upload className="size-3" /> Your text + AI image
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="size-3" /> You pick what AI handles
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                  Flexible
                </div>
              </button>
            </div>

            <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 text-center">
                No matter which option you pick, you can always edit everything before downloading. Nothing is locked in.
              </p>
            </div>
          </div>
        )}

        {step === "input" && creationMode === "ai" && (
          <div className="max-w-2xl mx-auto space-y-4 pb-24">
            <button onClick={() => setCreationMode("choose")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2" data-testid="button-back-to-modes">
              <ArrowLeft className="size-3" /> Back to options
            </button>
            <div className="bg-slate-800/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shrink-0">
                  <Wand2 className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Does It All</h3>
                  <p className="text-[11px] text-slate-400">Tell AI what you want and it creates everything</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white mb-1.5 block">What should your flyer say?</label>
                <p className="text-xs text-slate-400 mb-2">Just talk naturally — speak or type what you want on the flyer.</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={"e.g. \"We're launching food delivery in Lebanon soon. Free delivery first week. We got burgers, tacos, BBQ, and more. Order from your phone.\""}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 resize-none"
                  data-testid="input-message"
                />
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-300 leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={generateFlyer}
                disabled={!message.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                data-testid="button-generate"
              >
                <Wand2 className="size-4" />
                {errorMessage ? "Try Again" : "Create My Flyer with AI"}
              </button>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-xs text-white/50 hover:text-white/80 transition-colors py-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Palette className="size-3" />
                    Customize Style & Options
                  </span>
                  <span className="text-[10px] text-slate-500 group-open:hidden">{STYLES[style].label} · {orientation === "portrait" ? "Portrait" : "Landscape"} · {brand === "happy-eats" ? "HE" : "DC"}</span>
                </summary>
                <div className="space-y-4 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Brand</label>
                      <div className="flex gap-2">
                        {(["happy-eats", "tl-driver-connect"] as Brand[]).map((b) => (
                          <button key={b} onClick={() => setBrand(b)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${brand === b ? (b === "happy-eats" ? "bg-orange-500 text-white" : "bg-cyan-500 text-white") : "bg-white/5 text-white/50 border border-white/10"}`} data-testid={`button-brand-${b}`}>
                            {b === "happy-eats" ? "Happy Eats" : "TL Driver Connect"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Language</label>
                      <div className="flex gap-2">
                        {(["en", "es", "both"] as Language[]).map((l) => (
                          <button key={l} onClick={() => setLanguage(l)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${language === l ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 border border-white/10"}`} data-testid={`button-lang-${l}`}>
                            {l === "both" ? "EN+ES" : l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Flyer Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                          <button key={k} onClick={() => setStyle(k)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${style === k ? "bg-orange-500 text-white ring-2 ring-orange-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid={`button-style-${k}`}>
                            {STYLES[k].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Orientation</label>
                      <div className="flex gap-2">
                        <button onClick={() => setOrientation("portrait")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "portrait" ? "bg-orange-500 text-white ring-2 ring-orange-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-portrait">
                          <div className="w-3 h-4 border-2 border-current rounded-sm" />Portrait
                        </button>
                        <button onClick={() => setOrientation("landscape")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "landscape" ? "bg-orange-500 text-white ring-2 ring-orange-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-landscape">
                          <div className="w-4 h-3 border-2 border-current rounded-sm" />Landscape
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="bg-slate-800/40 border border-white/5 rounded-xl p-3">
              <p className="text-xs text-slate-500 text-center">
                <Sparkles className="size-3 inline mr-1" />
                AI will write professional marketing copy and generate a custom image. You can edit everything after.
              </p>
            </div>

            {message.trim() && (
              <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent sm:hidden">
                <button
                  onClick={generateFlyer}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-base hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 min-h-[52px]"
                  data-testid="button-generate-sticky"
                >
                  <Wand2 className="size-5" />
                  {errorMessage ? "Try Again" : "Create My Flyer"}
                </button>
              </div>
            )}
          </div>
        )}

        {step === "input" && creationMode === "manual" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => setCreationMode("choose")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2" data-testid="button-back-to-modes">
              <ArrowLeft className="size-3" /> Back to options
            </button>
            <div className="bg-slate-800/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Type className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Do It Yourself</h3>
                  <p className="text-[11px] text-slate-400">Write your own text and upload your own photo</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                <p className="text-xs text-white/70 font-medium">You'll get a blank flyer template where you can:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Type className="size-3.5" /> Type your own headline, tagline, and bullet points
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Upload className="size-3.5" /> Upload your own photo or logo
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Palette className="size-3.5" /> Choose colors, style, and layout
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <Download className="size-3.5" /> Download as PNG, PDF, or print
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Flyer Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                      <button key={k} onClick={() => setStyle(k)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${style === k ? "bg-cyan-500 text-white ring-2 ring-cyan-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid={`button-style-manual-${k}`}>
                        {STYLES[k].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Orientation</label>
                  <div className="flex gap-2">
                    <button onClick={() => setOrientation("portrait")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "portrait" ? "bg-cyan-500 text-white ring-2 ring-cyan-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-manual-portrait">
                      <div className="w-3 h-4 border-2 border-current rounded-sm" />Portrait
                    </button>
                    <button onClick={() => setOrientation("landscape")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "landscape" ? "bg-cyan-500 text-white ring-2 ring-cyan-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-manual-landscape">
                      <div className="w-4 h-3 border-2 border-current rounded-sm" />Landscape
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={startManualFlyer}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                data-testid="button-start-manual"
              >
                <Type className="size-4" />
                Start Building My Flyer
              </button>
            </div>
          </div>
        )}

        {step === "input" && creationMode === "hybrid" && (
          <div className="max-w-2xl mx-auto space-y-4 pb-24">
            <button onClick={() => setCreationMode("choose")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2" data-testid="button-back-to-modes">
              <ArrowLeft className="size-3" /> Back to options
            </button>
            <div className="bg-slate-800/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Mix & Match</h3>
                  <p className="text-[11px] text-slate-400">Pick what AI handles and what you do yourself</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">What should AI handle?</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setHybridAiText(!hybridAiText)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${hybridAiText ? "bg-violet-500/20 border-violet-500/50 text-white" : "bg-white/5 border-white/10 text-white/50"}`}
                    data-testid="button-hybrid-ai-text"
                  >
                    <div className="flex items-center gap-3">
                      <Type className="size-4" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Text & Copy</p>
                        <p className="text-[10px] text-white/40">{hybridAiText ? "AI writes the headline, tagline, and bullet points" : "You'll write everything yourself"}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${hybridAiText ? "bg-violet-500 border-violet-400" : "border-white/20"}`}>
                      {hybridAiText && <span className="text-white text-xs font-bold">AI</span>}
                    </div>
                  </button>
                  <button
                    onClick={() => setHybridAiImage(!hybridAiImage)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${hybridAiImage ? "bg-violet-500/20 border-violet-500/50 text-white" : "bg-white/5 border-white/10 text-white/50"}`}
                    data-testid="button-hybrid-ai-image"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="size-4" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Background Image</p>
                        <p className="text-[10px] text-white/40">{hybridAiImage ? "AI generates a custom image" : "You'll upload your own photo"}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${hybridAiImage ? "bg-violet-500 border-violet-400" : "border-white/20"}`}>
                      {hybridAiImage && <span className="text-white text-xs font-bold">AI</span>}
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center pt-1">
                  {hybridAiText && hybridAiImage ? "Tip: This is the same as \"AI Does It All\" — both text and image are AI-generated" :
                   !hybridAiText && !hybridAiImage ? "Tip: This is the same as \"Do It Yourself\" — you control everything" :
                   hybridAiText && !hybridAiImage ? "AI writes your text, you upload your own photo" :
                   "You write the text, AI generates the background image"}
                </p>
              </div>

              {(hybridAiText || hybridAiImage) && (
                <div>
                  <label className="text-sm font-bold text-white mb-1.5 block">
                    {hybridAiText ? "What should your flyer say?" : "Describe the image you want AI to create"}
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    {hybridAiText ? "Just talk naturally — speak or type what you want." : "Describe the scene, mood, or subject for your background image."}
                  </p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={hybridAiText
                      ? "e.g. \"We're launching food delivery in Lebanon soon. Free delivery first week.\""
                      : "e.g. \"A delicious spread of burgers and tacos on a rustic wooden table, warm lighting\""
                    }
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 resize-none"
                    data-testid="input-hybrid-message"
                  />
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-300 leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!hybridAiText && !hybridAiImage) {
                    startManualFlyer();
                  } else if (hybridAiText || hybridAiImage) {
                    if ((hybridAiText || hybridAiImage) && !message.trim()) return;
                    generateFlyer();
                  }
                }}
                disabled={(hybridAiText || hybridAiImage) && !message.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                data-testid="button-create-hybrid"
              >
                <Sparkles className="size-4" />
                {!hybridAiText && !hybridAiImage ? "Start Building" : hybridAiText && hybridAiImage ? "Generate Everything" : "Create My Flyer"}
              </button>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-xs text-white/50 hover:text-white/80 transition-colors py-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Palette className="size-3" />
                    Customize Style & Options
                  </span>
                  <span className="text-[10px] text-slate-500 group-open:hidden">{STYLES[style].label} · {orientation === "portrait" ? "Portrait" : "Landscape"} · {brand === "happy-eats" ? "HE" : "DC"}</span>
                </summary>
                <div className="space-y-4 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Brand</label>
                      <div className="flex gap-2">
                        {(["happy-eats", "tl-driver-connect"] as Brand[]).map((b) => (
                          <button key={b} onClick={() => setBrand(b)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${brand === b ? (b === "happy-eats" ? "bg-orange-500 text-white" : "bg-cyan-500 text-white") : "bg-white/5 text-white/50 border border-white/10"}`} data-testid={`button-brand-hybrid-${b}`}>
                            {b === "happy-eats" ? "Happy Eats" : "TL Driver Connect"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Language</label>
                      <div className="flex gap-2">
                        {(["en", "es", "both"] as Language[]).map((l) => (
                          <button key={l} onClick={() => setLanguage(l)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${language === l ? "bg-violet-500 text-white" : "bg-white/5 text-white/50 border border-white/10"}`} data-testid={`button-lang-hybrid-${l}`}>
                            {l === "both" ? "EN+ES" : l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Flyer Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                          <button key={k} onClick={() => setStyle(k)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${style === k ? "bg-violet-500 text-white ring-2 ring-violet-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid={`button-style-hybrid-${k}`}>
                            {STYLES[k].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Orientation</label>
                      <div className="flex gap-2">
                        <button onClick={() => setOrientation("portrait")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "portrait" ? "bg-violet-500 text-white ring-2 ring-violet-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-hybrid-portrait">
                          <div className="w-3 h-4 border-2 border-current rounded-sm" />Portrait
                        </button>
                        <button onClick={() => setOrientation("landscape")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orientation === "landscape" ? "bg-violet-500 text-white ring-2 ring-violet-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid="button-orient-hybrid-landscape">
                          <div className="w-4 h-3 border-2 border-current rounded-sm" />Landscape
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {(hybridAiText || hybridAiImage) && message.trim() && (
              <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent sm:hidden">
                <button
                  onClick={() => generateFlyer()}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-base hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 min-h-[52px]"
                  data-testid="button-create-hybrid-sticky"
                >
                  <Sparkles className="size-5" />
                  {hybridAiText && hybridAiImage ? "Generate Everything" : "Create My Flyer"}
                </button>
              </div>
            )}
          </div>
        )}

        {step === "generating" && (
          <div className="max-w-md mx-auto mt-20 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 animate-ping opacity-20" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center">
                <Loader2 className="size-8 text-white animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{generatingPhase}</h2>
              <p className="text-xs text-slate-400 mt-2">This usually takes 15-30 seconds</p>
            </div>
          </div>
        )}

        {step === "preview" && copy && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-72 flex-shrink-0 space-y-3 order-2 lg:order-1 max-h-[50vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><Type className="size-3.5" /> Edit Copy</p>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 mb-0.5 block">Headline</label>
                  <input value={copy.headline} onChange={(e) => updateCopyField("headline", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-headline" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-0.5 block">Tagline</label>
                  <input value={copy.tagline} onChange={(e) => updateCopyField("tagline", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-tagline" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-white/40">Key Points</label>
                    <button onClick={addBodyLine} className="flex items-center gap-0.5 text-[10px] text-orange-400 hover:text-orange-300 transition-colors" data-testid="button-add-point">
                      <Plus className="size-3" /> Add
                    </button>
                  </div>
                  {copy.bodyLines.map((line, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <input value={line} onChange={(e) => {
                        const lines = [...copy.bodyLines];
                        lines[i] = e.target.value;
                        updateCopyField("bodyLines", lines);
                      }} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid={`input-body-${i}`} />
                      {copy.bodyLines.length > 1 && (
                        <button onClick={() => removeBodyLine(i)} className="px-1.5 text-white/30 hover:text-red-400 transition-colors" data-testid={`button-remove-point-${i}`}>
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-0.5 block">Call to Action</label>
                  <input value={copy.cta} onChange={(e) => updateCopyField("cta", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-cta" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 mb-0.5 block">CTA Subtext</label>
                  <input value={copy.ctaSubtext} onChange={(e) => updateCopyField("ctaSubtext", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-cta-sub" />
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><Palette className="size-3.5" /> Style</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                    <button key={k} onClick={() => setStyle(k)} className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${style === k ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid={`button-style-prev-${k}`}>
                      {STYLES[k].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Orientation</p>
                <div className="flex gap-2">
                  <button onClick={() => setOrientation("portrait")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${orientation === "portrait" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid="button-orient-prev-portrait">
                    <div className="w-2.5 h-3.5 border-2 border-current rounded-sm" />
                    Portrait
                  </button>
                  <button onClick={() => setOrientation("landscape")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${orientation === "landscape" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid="button-orient-prev-landscape">
                    <div className="w-3.5 h-2.5 border-2 border-current rounded-sm" />
                    Landscape
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><ImageIcon className="size-3.5" /> Image</p>
                <button onClick={() => imageInputRef.current?.click()} className="w-full py-2 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-1.5" data-testid="button-upload-image">
                  <Upload className="size-3.5" /> Upload Your Own
                </button>
                <button onClick={regenerateImage} disabled={isExporting} className="w-full py-2 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5" data-testid="button-regen-image">
                  <RefreshCw className={`size-3.5 ${isExporting ? "animate-spin" : ""}`} /> AI Generate New
                </button>
                {flyerImage && (
                  <button onClick={() => setFlyerImage(null)} className="w-full py-2 rounded-lg bg-red-500/10 text-red-400/70 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1.5" data-testid="button-remove-image">
                    <Trash2 className="size-3.5" /> Remove Image
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={startOver} className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-xs font-bold hover:bg-white/10 transition-all" data-testid="button-start-over">
                  Start Over
                </button>
                <button onClick={() => { setStep("input"); }} className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-xs font-bold hover:bg-white/10 transition-all" data-testid="button-new-message">
                  New Message
                </button>
              </div>
            </div>

            <div className="flex-1 flex justify-center order-1 lg:order-2">
              <div
                ref={flyerRef}
                className={`w-full ${orientation === "landscape" ? "max-w-[800px]" : "max-w-[600px]"} bg-gradient-to-b ${s.bg} overflow-hidden`}
                style={{ aspectRatio: orientation === "portrait" ? "8.5/11" : "11/8.5" }}
                data-testid="flyer-preview"
              >
                <div className={`relative h-full flex ${orientation === "landscape" ? "flex-row" : "flex-col"}`}>
                  {flyerImage && (
                    <div className={`relative overflow-hidden ${orientation === "landscape" ? "w-[45%] h-full" : "h-[45%] w-full"}`}>
                      <img src={flyerImage} alt="Generated" className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 ${orientation === "landscape"
                        ? `bg-gradient-to-r ${style === "minimal" ? "from-white/60 via-transparent to-white" : "from-black/60 via-transparent to-black/80"}`
                        : `bg-gradient-to-b ${style === "minimal" ? "from-white/60 via-transparent to-white" : "from-black/60 via-transparent to-black/80"}`
                      }`} />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="size-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                          <Sparkles className={`size-5 ${style === "minimal" ? "text-gray-800" : "text-white"}`} />
                        </div>
                        <span className={`text-xs font-bold ${style === "minimal" ? "text-gray-800" : "text-white/80"}`}>{bc.name}</span>
                      </div>
                    </div>
                  )}

                  <div className={`flex-1 px-6 ${flyerImage ? "pt-4" : "pt-8"} pb-6 flex flex-col justify-between`}>
                    <div className="space-y-3">
                      <h2 className={`${orientation === "landscape" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-black leading-tight ${s.textColor}`}>
                        {copy.headline}
                      </h2>
                      <p className={`${orientation === "landscape" ? "text-xs sm:text-sm" : "text-sm sm:text-base"} font-medium ${s.accent} leading-snug`}>
                        {copy.tagline}
                      </p>
                      <div className="space-y-2 mt-4">
                        {copy.bodyLines.map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`size-1.5 rounded-full mt-2 flex-shrink-0 bg-gradient-to-r ${s.ctaGrad}`} />
                            <p className={`text-xs ${orientation === "landscape" ? "" : "sm:text-sm"} ${style === "minimal" ? "text-gray-600" : "text-white/80"} leading-relaxed`}>
                              {line}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className={`bg-gradient-to-r ${s.ctaGrad} rounded-xl ${orientation === "landscape" ? "py-2 px-4" : "py-3 px-5"} text-center`}>
                        <p className={`text-white font-black ${orientation === "landscape" ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}>{copy.cta}</p>
                      </div>
                      <p className={`text-center text-xs ${style === "minimal" ? "text-gray-500" : "text-white/50"}`}>
                        {copy.ctaSubtext}
                      </p>
                      <div className={`text-center text-[10px] ${style === "minimal" ? "text-gray-400" : "text-white/30"} mt-1`}>
                        {bc.name} &bull; www.tldriverconnect.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
