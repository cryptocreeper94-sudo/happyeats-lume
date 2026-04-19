import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { useCustomerSession } from "./customer-auth";
import {
  ArrowLeft, Image, Video, Music, Layers, Loader2, ExternalLink,
  Upload, FolderOpen, Sparkles, Shield, Crown, X, RefreshCw,
  Camera, Film, Mic, Combine, Download, Printer, Mail, Share2,
  Wand2, Palette, Type, Plus, Trash2, FileText, ChevronRight,
  Lock, Check, Zap
} from "lucide-react";

type EditorType = "image" | "video" | "audio" | "merge";
type FlyerStyle = "bold" | "elegant" | "playful" | "minimal";
type Orientation = "portrait" | "landscape";
type Brand = "happy-eats" | "tl-driver-connect";
type FlyerStep = "setup" | "generating" | "edit";

interface FlyerCopy {
  headline: string;
  tagline: string;
  bodyLines: string[];
  cta: string;
  ctaSubtext: string;
  imagePrompt: string;
}

const EDITOR_CONFIGS: Record<EditorType, { icon: typeof Image; label: string; description: string; color: string; gradient: string }> = {
  image: { icon: Camera, label: "Photo Editor", description: "Crop, filter, adjust, add text overlays", color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
  video: { icon: Film, label: "Video Editor", description: "Trim, merge, add captions and transitions", color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
  audio: { icon: Mic, label: "Audio Editor", description: "Edit audio tracks, add effects, normalize", color: "text-green-400", gradient: "from-green-500 to-emerald-500" },
  merge: { icon: Combine, label: "Merge Studio", description: "Combine multiple media files into one project", color: "text-orange-400", gradient: "from-orange-500 to-amber-500" },
};

const STYLES: Record<FlyerStyle, { label: string; bg: string; textColor: string; ctaGrad: string; accent: string }> = {
  bold: { label: "Bold", bg: "from-slate-900 via-slate-800 to-slate-900", textColor: "text-white", ctaGrad: "from-orange-500 to-rose-500", accent: "text-orange-400" },
  elegant: { label: "Elegant", bg: "from-zinc-900 via-neutral-900 to-zinc-900", textColor: "text-white", ctaGrad: "from-amber-500 to-yellow-500", accent: "text-amber-400" },
  playful: { label: "Playful", bg: "from-purple-900 via-fuchsia-900 to-purple-900", textColor: "text-white", ctaGrad: "from-pink-500 to-violet-500", accent: "text-pink-400" },
  minimal: { label: "Clean", bg: "from-white via-gray-50 to-white", textColor: "text-gray-900", ctaGrad: "from-cyan-500 to-blue-500", accent: "text-cyan-600" },
};

const STYLE_COLORS: Record<FlyerStyle, { bg1: string; bg2: string; text: string; accent: string; ctaGrad: [string, string]; subtext: string; bodyText: string }> = {
  bold: { bg1: "#0f172a", bg2: "#1e293b", text: "#ffffff", accent: "#fb923c", ctaGrad: ["#f97316", "#f43f5e"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  elegant: { bg1: "#18181b", bg2: "#1c1917", text: "#ffffff", accent: "#fbbf24", ctaGrad: ["#f59e0b", "#eab308"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  playful: { bg1: "#581c87", bg2: "#701a75", text: "#ffffff", accent: "#ec4899", ctaGrad: ["#ec4899", "#8b5cf6"], subtext: "rgba(255,255,255,0.5)", bodyText: "rgba(255,255,255,0.8)" },
  minimal: { bg1: "#ffffff", bg2: "#f9fafb", text: "#111827", accent: "#0891b2", ctaGrad: ["#06b6d4", "#3b82f6"], subtext: "rgba(107,114,128,1)", bodyText: "rgba(75,85,99,1)" },
};

const brandConfigs = {
  "happy-eats": { name: "Happy Eats", accent: "orange" },
  "tl-driver-connect": { name: "TL Driver Connect", accent: "cyan" },
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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

const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const renderFlyerToCanvas = async (
  copy: FlyerCopy,
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
  const ctaGrad2 = ctx.createLinearGradient(pad, ctaY, pad + ctaW, ctaY);
  ctaGrad2.addColorStop(0, sc.ctaGrad[0]);
  ctaGrad2.addColorStop(1, sc.ctaGrad[1]);
  ctx.fillStyle = ctaGrad2;
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

export default function MediaEditor() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { getSession, getToken } = useCustomerSession();
  const customer = getSession();
  const [selectedEditor, setSelectedEditor] = useState<EditorType | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const [flyerMode, setFlyerMode] = useState(false);
  const [flyerStep, setFlyerStep] = useState<FlyerStep>("setup");
  const [flyerCopy, setFlyerCopy] = useState<FlyerCopy | null>(null);
  const [flyerImage, setFlyerImage] = useState<string | null>(null);
  const [flyerStyle, setFlyerStyle] = useState<FlyerStyle>("bold");
  const [flyerOrientation, setFlyerOrientation] = useState<Orientation>("portrait");
  const [flyerBrand, setFlyerBrand] = useState<Brand>("happy-eats");
  const [flyerMessage, setFlyerMessage] = useState("");
  const [flyerGenerating, setFlyerGenerating] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("tl-sso-token");
    setSsoToken(token);
  }, []);

  const { data: subscriptionStatus, isLoading: subLoading } = useQuery({
    queryKey: ["/api/stripe/subscription-status", customer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/subscription-status/${customer?.id}`);
      return res.json();
    },
    enabled: !!customer?.id,
  });

  const hasMediaStudio = subscriptionStatus?.mediaStudioSubscription === true;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") {
      toast({ title: "Media Studio Pro activated!", description: "You now have full access to all editing tools" });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription-status"] });
      window.history.replaceState({}, "", "/media-editor");
    } else if (params.get("subscription") === "canceled") {
      toast({ title: "Checkout canceled", variant: "destructive" });
      window.history.replaceState({}, "", "/media-editor");
    }
  }, []);

  const handleMediaStudioSubscribe = async () => {
    if (!customer) {
      navigate("/signin");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/stripe/create-media-studio-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, customerEmail: customer.email, customerName: customer.name }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast({ title: "Could not start checkout", description: data.error, variant: "destructive" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  const { data: vaultStatus } = useQuery({
    queryKey: ["/api/trustvault/status"],
    queryFn: async () => {
      const res = await fetch("/api/trustvault/status");
      return res.json();
    },
  });

  const { data: mediaList, refetch: refetchMedia } = useQuery({
    queryKey: ["/api/trustvault/media", selectedEditor],
    queryFn: async () => {
      if (!ssoToken) return { items: [] };
      const category = selectedEditor === "merge" ? undefined : selectedEditor;
      const res = await fetch(`/api/trustvault/media?${category ? `category=${category}` : ""}`, {
        headers: { Authorization: `Bearer ${ssoToken}` },
      });
      return res.json();
    },
    enabled: !!ssoToken && !!selectedEditor,
  });

  const launchEditor = async (editorType: EditorType, mediaId?: string) => {
    if (!ssoToken) {
      toast({ title: "Sign in required", description: "Please sign in with Trust Layer SSO first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const domain = window.location.origin;
      const res = await fetch("/api/trustvault/editor-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ssoToken}` },
        body: JSON.stringify({ editorType, mediaId, returnUrl: `${domain}/media-editor` }),
      });
      const data = await res.json();
      if (data.embedUrl) {
        setEmbedUrl(data.embedUrl);
        setSelectedEditor(editorType);
      } else {
        toast({ title: "Could not open editor", description: data.error || "Try again", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const closeEditor = () => setEmbedUrl(null);

  const updatePreview = useCallback(async () => {
    if (!flyerCopy) return;
    try {
      const canvas = await renderFlyerToCanvas(flyerCopy, flyerImage, flyerStyle, brandConfigs[flyerBrand].name, flyerOrientation);
      const smallCanvas = document.createElement("canvas");
      const scale = 0.25;
      smallCanvas.width = canvas.width * scale;
      smallCanvas.height = canvas.height * scale;
      const sctx = smallCanvas.getContext("2d")!;
      sctx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
      setPreviewDataUrl(smallCanvas.toDataURL("image/jpeg", 0.85));
    } catch (e) {
      console.error("Preview failed:", e);
    }
  }, [flyerCopy, flyerImage, flyerStyle, flyerBrand, flyerOrientation]);

  useEffect(() => {
    if (flyerStep === "edit" && flyerCopy) {
      const timer = setTimeout(updatePreview, 300);
      return () => clearTimeout(timer);
    }
  }, [flyerStep, flyerCopy, flyerImage, flyerStyle, flyerBrand, flyerOrientation, updatePreview]);

  const getCanvas = useCallback(async () => {
    if (!flyerCopy) throw new Error("No copy");
    return renderFlyerToCanvas(flyerCopy, flyerImage, flyerStyle, brandConfigs[flyerBrand].name, flyerOrientation);
  }, [flyerCopy, flyerImage, flyerStyle, flyerBrand, flyerOrientation]);

  const generateFlyer = async () => {
    if (!flyerMessage.trim()) return;
    setFlyerStep("generating");
    setFlyerGenerating("Writing your marketing copy...");
    try {
      const copyRes = await fetch("/api/flyers/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: flyerMessage.trim(), brand: flyerBrand, language: "en" }),
      });
      if (!copyRes.ok) throw new Error("Failed to generate copy");
      const copyData: FlyerCopy = await copyRes.json();
      setFlyerCopy(copyData);

      setFlyerGenerating("Creating your custom image...");
      const imgRes = await fetch("/api/flyers/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: copyData.imagePrompt }),
      });
      if (!imgRes.ok) throw new Error("Failed to generate image");
      const imgData = await imgRes.json();
      setFlyerImage(`data:image/png;base64,${imgData.b64_json}`);
      setFlyerStep("edit");
    } catch (err) {
      console.error(err);
      toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
      setFlyerStep("setup");
    }
  };

  const startManualFlyer = () => {
    setFlyerCopy({
      headline: "Your Headline Here",
      tagline: "Add your tagline",
      bodyLines: ["First key point", "Second key point", "Third key point"],
      cta: "ORDER NOW",
      ctaSubtext: "Tap here to get started",
      imagePrompt: "",
    });
    setFlyerStep("edit");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFlyerImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const regenerateImage = async () => {
    if (!flyerCopy) return;
    setIsExporting(true);
    try {
      const imgRes = await fetch("/api/flyers/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: flyerCopy.imagePrompt || flyerCopy.headline }),
      });
      if (!imgRes.ok) throw new Error("Failed");
      const imgData = await imgRes.json();
      setFlyerImage(`data:image/png;base64,${imgData.b64_json}`);
    } catch {
      toast({ title: "Image generation failed", variant: "destructive" });
    }
    setIsExporting(false);
  };

  const downloadPNG = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "flyer.png";
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas]);

  const downloadPDF = useCallback(async () => {
    const canvas = await getCanvas();
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ orientation: flyerOrientation, unit: "in", format: "letter" });
    const pW = pdf.internal.pageSize.getWidth();
    const pH = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "JPEG", 0, 0, pW, pH);
    const pdfBlob = pdf.output("blob");
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], "flyer.pdf", { type: "application/pdf" });
      try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Flyer" }); return; } } catch {}
    }
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a"); a.href = url; a.download = "flyer.pdf";
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas, flyerOrientation]);

  const printFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    const base64 = await blobToBase64(blob);
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Print Flyer</title>
<style>@page{size:letter ${flyerOrientation};margin:0}*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%}img{width:100%;height:auto;display:block}@media print{img{width:100%;max-height:100vh;object-fit:contain}}</style>
</head><body><img src="${base64}" onload="setTimeout(function(){window.print()},300)" /></body></html>`);
    w.document.close();
  }, [getCanvas, flyerOrientation]);

  const shareFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "flyer.png", { type: "image/png" });
      try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Flyer" }); return; } } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flyer.png";
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }, [getCanvas]);

  const emailFlyer = useCallback(async () => {
    const canvas = await getCanvas();
    const blob = await canvasToBlob(canvas);
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "flyer.png", { type: "image/png" });
      try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Marketing Flyer" }); return; } } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flyer.png";
    document.body.appendChild(a); a.click();
    setTimeout(() => {
      document.body.removeChild(a); URL.revokeObjectURL(url);
      window.open(`mailto:?subject=${encodeURIComponent("Marketing Flyer")}&body=${encodeURIComponent("Here is the flyer. The file has been downloaded — please attach it to this email.")}`, "_blank");
    }, 1500);
  }, [getCanvas]);

  const runAction = async (fn: () => Promise<void>) => {
    setIsExporting(true);
    try { await fn(); } catch (err) {
      console.error(err);
      toast({ title: "Export failed", description: "Please try again", variant: "destructive" });
    }
    setIsExporting(false);
  };

  if (embedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900 border-b border-white/10 flex items-center px-4 z-10">
          <button onClick={closeEditor} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors" data-testid="button-close-editor">
            <X className="w-4 h-4" />
            <span className="text-sm">Close Editor</span>
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-medium text-white/80">
              {selectedEditor && EDITOR_CONFIGS[selectedEditor].label} — TrustVault
            </span>
          </div>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-xs transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
          </a>
        </div>
        <iframe
          src={embedUrl}
          className="w-full border-0"
          style={{ height: "calc(100vh - 48px)", marginTop: "48px" }}
          allow="camera; microphone; clipboard-write; clipboard-read"
          data-testid="iframe-editor"
        />
      </div>
    );
  }

  if (flyerMode) {
    const s = STYLES[flyerStyle];
    const bc = brandConfigs[flyerBrand];

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setFlyerMode(false); setFlyerStep("setup"); setFlyerCopy(null); setFlyerImage(null); setPreviewDataUrl(null); }} className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all" data-testid="button-back-from-flyer">
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="size-5 text-orange-400" />
                  Create Flyer
                </h1>
                <p className="text-xs text-slate-400">
                  {flyerStep === "setup" ? "Tell us what you want or start from scratch" :
                   flyerStep === "generating" ? "AI is working on it..." :
                   "Edit your flyer, then save or share"}
                </p>
              </div>
            </div>
            {flyerStep === "edit" && (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => runAction(downloadPNG)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white disabled:opacity-50 transition-all" data-testid="button-flyer-png">
                  <Download className="size-3.5" />{isExporting ? "..." : "PNG"}
                </button>
                <button onClick={() => runAction(downloadPDF)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-flyer-pdf">
                  <Download className="size-3.5" />PDF
                </button>
                <button onClick={() => runAction(printFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-flyer-print">
                  <Printer className="size-3.5" />Print
                </button>
                <button onClick={() => runAction(shareFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-flyer-share">
                  <Share2 className="size-3.5" />Share
                </button>
                <button onClick={() => runAction(emailFlyer)} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all" data-testid="button-flyer-email">
                  <Mail className="size-3.5" />Email
                </button>
              </div>
            )}
          </div>

          {flyerStep === "setup" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <GlassCard glow className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI-Powered Flyer</h2>
                    <p className="text-xs text-white/40">Describe what you want and AI creates everything</p>
                  </div>
                </div>

                <textarea
                  value={flyerMessage}
                  onChange={(e) => setFlyerMessage(e.target.value)}
                  placeholder={'e.g. "We\'re launching food delivery in Lebanon soon. Free delivery first week. Burgers, tacos, BBQ. Order from your phone."'}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 resize-none mb-4"
                  data-testid="input-flyer-message"
                />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Brand</label>
                    <div className="flex gap-2">
                      {(["happy-eats", "tl-driver-connect"] as Brand[]).map((b) => (
                        <button key={b} onClick={() => setFlyerBrand(b)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${flyerBrand === b ? (b === "happy-eats" ? "bg-orange-500 text-white" : "bg-cyan-500 text-white") : "bg-white/5 text-white/50 border border-white/10"}`} data-testid={`button-flyer-brand-${b}`}>
                          {b === "happy-eats" ? "Happy Eats" : "TL Driver"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Orientation</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFlyerOrientation("portrait")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${flyerOrientation === "portrait" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 border border-white/10"}`} data-testid="button-flyer-portrait">
                        <div className="w-2.5 h-3.5 border-2 border-current rounded-sm" /> Portrait
                      </button>
                      <button onClick={() => setFlyerOrientation("landscape")} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${flyerOrientation === "landscape" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 border border-white/10"}`} data-testid="button-flyer-landscape">
                        <div className="w-3.5 h-2.5 border-2 border-current rounded-sm" /> Landscape
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                      <button key={k} onClick={() => setFlyerStyle(k)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${flyerStyle === k ? "bg-orange-500 text-white ring-2 ring-orange-400/50" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`} data-testid={`button-flyer-style-${k}`}>
                        {STYLES[k].label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateFlyer}
                  disabled={!flyerMessage.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-ai-generate"
                >
                  <Wand2 className="size-4" />
                  AI Create My Flyer
                </button>
              </GlassCard>

              <div className="relative flex items-center justify-center my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-4 text-xs text-white/30 font-medium">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Type className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Start from Scratch</h2>
                    <p className="text-xs text-white/40">Upload your own image and write your own text</p>
                  </div>
                </div>
                <button
                  onClick={startManualFlyer}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/15 transition-all flex items-center justify-center gap-2 border border-white/10"
                  data-testid="button-manual-flyer"
                >
                  <Plus className="size-4" />
                  Build My Own Flyer
                </button>
              </GlassCard>
            </div>
          )}

          {flyerStep === "generating" && (
            <div className="max-w-md mx-auto mt-20 text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 animate-ping opacity-20" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center">
                  <Loader2 className="size-8 text-white animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{flyerGenerating}</h2>
                <p className="text-xs text-slate-400 mt-2">This usually takes 15-30 seconds</p>
              </div>
            </div>
          )}

          {flyerStep === "edit" && flyerCopy && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="w-full lg:w-72 flex-shrink-0 space-y-3 order-2 lg:order-1 max-h-[50vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto">
                <GlassCard className="p-4 space-y-3">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><Type className="size-3.5" /> Edit Text</p>
                  <div>
                    <label className="text-[10px] text-white/40 mb-0.5 block">Headline</label>
                    <input value={flyerCopy.headline} onChange={(e) => setFlyerCopy({ ...flyerCopy, headline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-edit-headline" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-0.5 block">Tagline</label>
                    <input value={flyerCopy.tagline} onChange={(e) => setFlyerCopy({ ...flyerCopy, tagline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-edit-tagline" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-white/40">Key Points</label>
                      <button onClick={() => setFlyerCopy({ ...flyerCopy, bodyLines: [...flyerCopy.bodyLines, "New point"] })} className="flex items-center gap-0.5 text-[10px] text-orange-400 hover:text-orange-300 transition-colors" data-testid="button-add-body-line">
                        <Plus className="size-3" /> Add
                      </button>
                    </div>
                    {flyerCopy.bodyLines.map((line, i) => (
                      <div key={i} className="flex gap-1 mb-1">
                        <input value={line} onChange={(e) => {
                          const lines = [...flyerCopy.bodyLines];
                          lines[i] = e.target.value;
                          setFlyerCopy({ ...flyerCopy, bodyLines: lines });
                        }} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid={`input-body-line-${i}`} />
                        {flyerCopy.bodyLines.length > 1 && (
                          <button onClick={() => setFlyerCopy({ ...flyerCopy, bodyLines: flyerCopy.bodyLines.filter((_, idx) => idx !== i) })} className="px-1.5 text-white/30 hover:text-red-400 transition-colors" data-testid={`button-remove-line-${i}`}>
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-0.5 block">Call to Action</label>
                    <input value={flyerCopy.cta} onChange={(e) => setFlyerCopy({ ...flyerCopy, cta: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-edit-cta" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-0.5 block">CTA Subtext</label>
                    <input value={flyerCopy.ctaSubtext} onChange={(e) => setFlyerCopy({ ...flyerCopy, ctaSubtext: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50" data-testid="input-edit-subtext" />
                  </div>
                </GlassCard>

                <GlassCard className="p-4 space-y-3">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><Palette className="size-3.5" /> Style & Layout</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(STYLES) as FlyerStyle[]).map((k) => (
                      <button key={k} onClick={() => setFlyerStyle(k)} className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${flyerStyle === k ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid={`button-edit-style-${k}`}>
                        {STYLES[k].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFlyerOrientation("portrait")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${flyerOrientation === "portrait" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid="button-edit-portrait">
                      <div className="w-2.5 h-3.5 border-2 border-current rounded-sm" /> Portrait
                    </button>
                    <button onClick={() => setFlyerOrientation("landscape")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${flyerOrientation === "landscape" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid="button-edit-landscape">
                      <div className="w-3.5 h-2.5 border-2 border-current rounded-sm" /> Landscape
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {(["happy-eats", "tl-driver-connect"] as Brand[]).map((b) => (
                      <button key={b} onClick={() => setFlyerBrand(b)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${flyerBrand === b ? (b === "happy-eats" ? "bg-orange-500 text-white" : "bg-cyan-500 text-white") : "bg-white/5 text-white/50 hover:bg-white/10"}`} data-testid={`button-edit-brand-${b}`}>
                        {b === "happy-eats" ? "Happy Eats" : "TL Driver"}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 space-y-3">
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><Camera className="size-3.5" /> Image</p>
                  <button onClick={() => imageInputRef.current?.click()} className="w-full py-2 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-1.5" data-testid="button-upload-flyer-image">
                    <Upload className="size-3.5" /> Upload Your Own
                  </button>
                  <button onClick={regenerateImage} disabled={isExporting} className="w-full py-2 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5" data-testid="button-ai-new-image">
                    <Sparkles className={`size-3.5 ${isExporting ? "animate-spin" : ""}`} /> AI Generate Image
                  </button>
                  {flyerImage && (
                    <button onClick={() => setFlyerImage(null)} className="w-full py-2 rounded-lg bg-red-500/10 text-red-400/70 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1.5" data-testid="button-remove-flyer-image">
                      <Trash2 className="size-3.5" /> Remove Image
                    </button>
                  )}
                </GlassCard>

                <button onClick={() => { setFlyerStep("setup"); setFlyerCopy(null); setFlyerImage(null); setPreviewDataUrl(null); }} className="w-full py-2 rounded-lg bg-white/5 text-white/50 text-xs font-bold hover:bg-white/10 transition-all" data-testid="button-start-new">
                  Start Over
                </button>
              </div>

              <div className="flex-1 flex justify-center order-1 lg:order-2">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Flyer Preview"
                    className={`w-full ${flyerOrientation === "landscape" ? "max-w-[800px]" : "max-w-[600px]"} rounded-lg shadow-2xl border border-white/10`}
                    style={{ aspectRatio: flyerOrientation === "portrait" ? "8.5/11" : "11/8.5" }}
                    data-testid="flyer-canvas-preview"
                  />
                ) : (
                  <div className={`w-full ${flyerOrientation === "landscape" ? "max-w-[800px]" : "max-w-[600px]"} rounded-lg bg-white/5 border border-white/10 flex items-center justify-center`}
                    style={{ aspectRatio: flyerOrientation === "portrait" ? "8.5/11" : "11/8.5" }}
                  >
                    <div className="text-center">
                      <Loader2 className="size-8 text-white/20 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-white/30">Rendering preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <button className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Media Studio
              </h1>
              <p className="text-xs text-white/40">Create flyers, edit photos, videos & more</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${vaultStatus?.connected !== false ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-white/40">{vaultStatus?.connected !== false ? "Connected" : "Offline"}</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mb-6">
          <div
            onClick={() => setFlyerMode(true)}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-[2px] cursor-pointer group"
            data-testid="card-create-flyer"
          >
            <div className="relative bg-gradient-to-r from-orange-900/90 via-rose-900/90 to-pink-900/90 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">Create Flyer</h2>
                <p className="text-sm text-white/70">
                  AI-powered or build your own — add images, text, choose your style, then save as PNG, PDF, print, email, or share
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </div>
        </motion.div>

        {!hasMediaStudio && !subLoading && (
          <GlassCard glow className="p-6 mb-6 border-2 border-purple-500/30">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Media Studio Pro</h2>
              <p className="text-sm text-white/50 mb-4 max-w-sm">
                Unlock the full creative suite — photo, video, audio editors and AI flyer creation powered by TrustVault
              </p>
              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                {[
                  { icon: Camera, label: "Photo Editor" },
                  { icon: Film, label: "Video Editor" },
                  { icon: Mic, label: "Audio Editor" },
                  { icon: Combine, label: "Merge Studio" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 bg-white/[0.04] rounded-lg p-2.5">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-xs text-white/70">{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg p-2.5">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-white/70">AI Flyer Creator</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg p-2.5">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-white/70">Ad-Free Included</span>
                </div>
              </div>
              <Button
                onClick={handleMediaStudioSubscribe}
                disabled={subscribing}
                className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20"
                data-testid="button-subscribe-media-studio"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {subscribing ? "Starting checkout..." : "Upgrade for $15/month"}
              </Button>
              <p className="text-[10px] text-white/30 mt-2">Cancel anytime. Includes ad-free experience.</p>
            </div>
          </GlassCard>
        )}

        {hasMediaStudio && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-300">Media Studio Pro</span>
            <span className="text-[10px] text-white/40 ml-1">Active</span>
            {subscriptionStatus?.mediaStudioExpiresAt && (
              <span className="text-[10px] text-amber-400/60 ml-auto">Ends {new Date(subscriptionStatus.mediaStudioExpiresAt).toLocaleDateString()}</span>
            )}
          </div>
        )}

        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Advanced Editors</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(Object.entries(EDITOR_CONFIGS) as [EditorType, typeof EDITOR_CONFIGS[EditorType]][]).map(([type, config]) => (
            <motion.div key={type} whileHover={{ scale: hasMediaStudio ? 1.02 : 1 }} whileTap={{ scale: hasMediaStudio ? 0.98 : 1 }}>
              <GlassCard
                glow
                className={`p-5 transition-all duration-300 ${!hasMediaStudio ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${selectedEditor === type && hasMediaStudio ? "ring-2 ring-white/30" : "hover:border-white/20"}`}
                onClick={() => {
                  if (!hasMediaStudio) {
                    toast({ title: "Media Studio Pro Required", description: "Subscribe to unlock the full editing suite", variant: "destructive" });
                    return;
                  }
                  if (selectedEditor === type) launchEditor(type);
                  else setSelectedEditor(type);
                }}
                data-testid={`card-editor-${type}`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <config.icon className="w-5 h-5 text-white" />
                  </div>
                  {!hasMediaStudio && (
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white/50" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{config.label}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{config.description}</p>
                {selectedEditor === type && hasMediaStudio && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-white/10">
                    <Button
                      onClick={(e) => { e.stopPropagation(); launchEditor(type); }}
                      disabled={loading || !ssoToken}
                      className={`w-full bg-gradient-to-r ${config.gradient} text-white text-xs h-9`}
                      data-testid={`button-launch-${type}`}
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <ExternalLink className="w-3.5 h-3.5 mr-1.5" />}
                      {loading ? "Opening..." : "Launch Editor"}
                    </Button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {selectedEditor && ssoToken && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <GlassCard glow className="p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-white/60" /> Your Media
                  </h2>
                  <button onClick={() => refetchMedia()} className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 transition-colors" data-testid="button-refresh-media">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                {mediaList?.items && mediaList.items.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mediaList.items.map((item: any) => (
                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-all group" data-testid={`media-item-${item.id}`}>
                        <div onClick={() => launchEditor(selectedEditor!, item.id)} className="w-full h-full">
                          {item.thumbnailUrl || item.url ? (
                            <img src={item.thumbnailUrl || item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {selectedEditor === "video" ? <Film className="w-6 h-6 text-white/20" /> : selectedEditor === "audio" ? <Mic className="w-6 h-6 text-white/20" /> : <Image className="w-6 h-6 text-white/20" />}
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-stretch justify-end p-1.5 gap-1">
                          <span className="text-[10px] text-white font-medium truncate px-1">{item.title || item.filename}</span>
                          {(item.thumbnailUrl || item.url) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlyerImage(item.thumbnailUrl || item.url);
                                setFlyerMode(true);
                                if (!flyerCopy) {
                                  setFlyerCopy({
                                    headline: "Your Headline Here",
                                    tagline: "Add your tagline",
                                    bodyLines: ["First key point", "Second key point", "Third key point"],
                                    cta: "ORDER NOW",
                                    ctaSubtext: "Tap here to get started",
                                    imagePrompt: "",
                                  });
                                  setFlyerStep("edit");
                                }
                              }}
                              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold py-1 px-2 rounded text-center hover:brightness-110 transition-all"
                              data-testid={`button-use-as-flyer-${item.id}`}
                            >
                              <FileText className="w-3 h-3 inline mr-1" />Use as Flyer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-white/40">No media yet</p>
                    <p className="text-[10px] text-white/25 mt-1">Launch the editor to create or upload media</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
