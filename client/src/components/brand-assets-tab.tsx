import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Download, Copy, Check, Palette, Type, Image,
  ExternalLink, Layers, Star, Share2, Mail
} from "lucide-react";
import { downloadFileAsset, shareFileAsset, emailFileAsset } from "@/lib/download-utils";

const BRAND_LOGOS = [
  { id: "smiley", name: "Happy Eats Smiley", desc: "Primary logo — cards, social, app icons", src: "/happyeats-smiley-hires.png", category: "Primary", formats: ["PNG"], bestFor: "Cards, Social, Avatars", gradient: "from-orange-500/20 to-rose-500/20", border: "border-orange-500/30" },
  { id: "icon-full", name: "Happy Eats Retro", desc: "Full retro poster logo — print & signage", src: "/happyeats-icon.png", category: "Full Logo", formats: ["PNG"], bestFor: "Print, Signage, Merch", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
  { id: "app-icon", name: "App Badge Icon", desc: "Square app icon — app store & favicons", src: "/icon-512.png", category: "App Icon", formats: ["PNG"], bestFor: "App Store, Favicon", gradient: "from-violet-500/20 to-fuchsia-500/20", border: "border-violet-500/30" },
  { id: "tl-badge", name: "Trust Layer Emblem", desc: "Ecosystem badge — compliance & partnerships", src: "/trustlayer-emblem.jpg", category: "Ecosystem", formats: ["JPG"], bestFor: "Documents, Partners", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
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

const TYPOGRAPHY = [
  { name: "System Sans", family: "system-ui, -apple-system, sans-serif", weight: "400–900", usage: "Primary UI text, body content", sample: "Happy Eats Nashville" },
  { name: "Monospace", family: "ui-monospace, monospace", weight: "400–700", usage: "Membership IDs, codes, data", sample: "TL-HE-2026-0001" },
  { name: "Georgia Serif", family: "Georgia, serif", weight: "400–700", usage: "Elegant templates, formal docs", sample: "Franchise Partner" },
];

const GUIDELINES = [
  { title: "Clear Space", desc: "Maintain padding equal to logo height around the mark. Never crowd it.", icon: "📐" },
  { title: "Minimum Size", desc: "Smiley: never smaller than 32px on screen or 0.5\" in print.", icon: "📏" },
  { title: "Dark Backgrounds", desc: "Use smiley or retro icon. Orange pops on navy (#0f172a) or black.", icon: "🌙" },
  { title: "Light Backgrounds", desc: "Use retro icon or app badge. Add drop shadow if needed.", icon: "☀️" },
  { title: "No Modifications", desc: "Don't rotate, skew, recolor, or add effects to logos.", icon: "🚫" },
  { title: "Print Ready", desc: "All logos are 512px+ — cards, flyers, wraps, and merch ready.", icon: "🖨️" },
];

export default function BrandAssetsTab() {
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async (src: string, filename: string) => {
    setDownloading(filename);
    try {
      await downloadFileAsset(src, filename);
    } catch (e) {
      console.error("Download failed:", e);
    }
    setDownloading(null);
  };

  const handleShare = async (src: string, filename: string) => {
    setDownloading(`share-${filename}`);
    try {
      await shareFileAsset(src, filename);
    } catch (e) {
      console.error("Share failed:", e);
    }
    setDownloading(null);
  };

  const handleEmail = async (src: string, filename: string) => {
    setDownloading(`email-${filename}`);
    try {
      await emailFileAsset(src, filename, "Happy Eats Brand Asset");
    } catch (e) {
      console.error("Email failed:", e);
    }
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel border-l-4 border-l-orange-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Image className="size-4 text-orange-400" />
            Brand Logos
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] ml-auto">{BRAND_LOGOS.length} Files</Badge>
          </CardTitle>
          <p className="text-xs text-white/40 mt-1">Swipe to browse — tap Download or long-press on mobile to save.</p>
        </CardHeader>
        <CardContent>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {BRAND_LOGOS.map(logo => (
                <CarouselItem key={logo.id} className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-[45%]">
                  <div data-testid={`card-logo-${logo.id}`}
                    className={`rounded-xl bg-gradient-to-br ${logo.gradient} border ${logo.border} hover:scale-[1.02] transition-all overflow-hidden h-full`}>
                    <div className="h-40 sm:h-48 bg-white/5 flex items-center justify-center p-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <img src={logo.src} alt={logo.name} className="max-w-full max-h-full object-contain rounded-lg relative z-10 drop-shadow-lg" />
                      <Badge className="absolute top-3 right-3 bg-black/40 text-white/80 border-white/10 text-[9px] backdrop-blur-sm">{logo.category}</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white">{logo.name}</h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{logo.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-white/30 flex items-center gap-1">
                          <Star className="size-3" /> {logo.bestFor}
                        </span>
                        <span className="text-[10px] text-white/30 ml-auto">{logo.formats.join(" / ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3">
                        <Button size="sm" onClick={() => handleDownload(logo.src, `${logo.id}.${logo.formats[0].toLowerCase()}`)}
                          disabled={!!downloading}
                          className="h-8 text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 flex-1 min-h-[44px]"
                          data-testid={`button-download-${logo.id}`}>
                          <Download className="size-3 mr-1" />
                          {downloading === logo.id ? "..." : "Save"}
                        </Button>
                        <Button size="sm" onClick={() => handleShare(logo.src, `${logo.id}.${logo.formats[0].toLowerCase()}`)}
                          disabled={!!downloading}
                          className="h-8 text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 min-h-[44px]"
                          data-testid={`button-share-${logo.id}`}>
                          <Share2 className="size-3" />
                        </Button>
                        <Button size="sm" onClick={() => handleEmail(logo.src, `${logo.id}.${logo.formats[0].toLowerCase()}`)}
                          disabled={!!downloading}
                          className="h-8 text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 min-h-[44px]"
                          data-testid={`button-email-${logo.id}`}>
                          <Mail className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-4">
              <CarouselPrevious className="static translate-y-0 size-8 bg-transparent border-0 text-orange-400 hover:text-white hover:bg-transparent" />
              <div className="flex gap-1.5">
                {BRAND_LOGOS.map((_, i) => (
                  <div key={i} className={`size-1.5 rounded-full ${i === 0 ? 'bg-orange-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <CarouselNext className="static translate-y-0 size-8 bg-transparent border-0 text-orange-400 hover:text-white hover:bg-transparent" />
            </div>
          </Carousel>
        </CardContent>
      </Card>

      <Card className="glass-panel border-l-4 border-l-rose-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="size-4 text-rose-400" />
            Color Palette
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] ml-auto">{BRAND_COLORS.length} Colors</Badge>
          </CardTitle>
          <p className="text-xs text-white/40 mt-1">Swipe to browse — tap any color to copy its hex code.</p>
        </CardHeader>
        <CardContent>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {BRAND_COLORS.map(color => (
                <CarouselItem key={color.hex} className="pl-2 basis-[42%] sm:basis-1/3 lg:basis-1/4">
                  <button onClick={() => handleCopyColor(color.hex)}
                    data-testid={`button-color-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all overflow-hidden text-left w-full">
                    <div className="h-20 sm:h-24 relative" style={{ background: color.hex }}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                        {copied === color.hex ? (
                          <span className="text-xs text-white font-bold flex items-center gap-1"><Check className="size-3" /> Copied!</span>
                        ) : (
                          <span className="text-xs text-white font-medium flex items-center gap-1"><Copy className="size-3" /> Copy</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-white truncate">{color.name}</p>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">{color.hex}</p>
                      <p className="text-[10px] text-white/30 mt-1 line-clamp-1">{color.usage}</p>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-4">
              <CarouselPrevious className="static translate-y-0 size-8 bg-transparent border-0 text-rose-400 hover:text-white hover:bg-transparent" />
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`size-1.5 rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <CarouselNext className="static translate-y-0 size-8 bg-transparent border-0 text-rose-400 hover:text-white hover:bg-transparent" />
            </div>
          </Carousel>
        </CardContent>
      </Card>

      <Card className="glass-panel border-l-4 border-l-violet-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Type className="size-4 text-violet-400" />
            Typography
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">{TYPOGRAPHY.length} Fonts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {TYPOGRAPHY.map(font => (
                <CarouselItem key={font.name} className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-[45%]">
                  <div data-testid={`card-typography-${font.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 p-5 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white">{font.name}</h3>
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px]">{font.weight}</Badge>
                    </div>
                    <p className="text-2xl text-white/80 mb-3 truncate" style={{ fontFamily: font.family }}>
                      {font.sample}
                    </p>
                    <div className="text-[10px] text-white/30 space-y-1">
                      <p className="font-mono text-white/50 truncate">{font.family}</p>
                      <p>{font.usage}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-4">
              <CarouselPrevious className="static translate-y-0 size-8 bg-transparent border-0 text-violet-400 hover:text-white hover:bg-transparent" />
              <div className="flex gap-1.5">
                {TYPOGRAPHY.map((_, i) => (
                  <div key={i} className={`size-1.5 rounded-full ${i === 0 ? 'bg-violet-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <CarouselNext className="static translate-y-0 size-8 bg-transparent border-0 text-violet-400 hover:text-white hover:bg-transparent" />
            </div>
          </Carousel>
        </CardContent>
      </Card>

      <Card className="glass-panel border-l-4 border-l-cyan-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="size-4 text-cyan-400" />
            Usage Guidelines
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] ml-auto">{GUIDELINES.length} Rules</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {GUIDELINES.map((item, i) => (
                <CarouselItem key={i} className="pl-2 basis-[70%] sm:basis-1/2 lg:basis-1/3">
                  <div data-testid={`card-guideline-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{item.icon}</span>
                      <h4 className="text-xs font-bold text-cyan-300">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-4">
              <CarouselPrevious className="static translate-y-0 size-8 bg-transparent border-0 text-cyan-400 hover:text-white hover:bg-transparent" />
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`size-1.5 rounded-full ${i === 0 ? 'bg-cyan-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <CarouselNext className="static translate-y-0 size-8 bg-transparent border-0 text-cyan-400 hover:text-white hover:bg-transparent" />
            </div>
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );
}
