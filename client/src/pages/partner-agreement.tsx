import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Truck, Check, Download, Shield, FileText, 
  TrendingUp, DollarSign, Users, Award, Megaphone,
  CheckCircle, Sparkles, Clock, Wallet, Car,
  AlertTriangle, Building, Handshake, Heart, Printer,
  ChevronLeft, ChevronRight, MapPin, Calendar,
  Moon, Sun, Share2, Mail
} from "lucide-react";
import { useParams, Link, useLocation } from "wouter";
import { useLanguage } from "@/i18n/context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { QRCodeSVG } from "qrcode.react";
import {
  captureElementAsImage,
  captureElementAndShare,
  captureElementAndEmail,
  captureElementAndPrint,
  universalDownload,
} from "@/lib/download-utils";

interface BusinessCardInfo {
  phone: string;
  email: string;
  website: string;
}

interface PartnerData {
  name: string;
  businessName: string;
  membershipNumber: string;
  region: string;
  deliveryShare: number;
  foodTruckCommissionShare: number;
  milestoneDeliveryShare: number;
  milestoneThreshold: number;
  agreementDate: string;
  blockchainHash?: string;
  acknowledged: boolean;
  partnerSlug: string;
}

const getDefaultPartnerData = (slug: string): PartnerData => {
  if (slug === "kathy") {
    return {
      name: "Kathy Grater",
      businessName: "Happy Eats Nashville",
      membershipNumber: "TL-HE-2026-0001",
      region: "LaVergne & Smyrna (Logistics Hub Zone) — expanding to Middle Tennessee",
      deliveryShare: 50,
      foodTruckCommissionShare: 80,
      milestoneDeliveryShare: 55,
      milestoneThreshold: 30000,
      agreementDate: "February 2, 2026",
      acknowledged: false,
      partnerSlug: "kathy"
    };
  }
  return {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    businessName: `Happy Eats ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
    membershipNumber: `TL-HE-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    region: "Territory TBD",
    deliveryShare: 50,
    foodTruckCommissionShare: 80,
    milestoneDeliveryShare: 55,
    milestoneThreshold: 30000,
    agreementDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    acknowledged: false,
    partnerSlug: slug
  };
};

function ActionPlanCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const weeks = [
    { title: "Week 1", subtitle: "Get Materials", items: ["Business cards", "Food truck flyers", "Driver flyers", "Review app"], color: "sky" },
    { title: "Week 2", subtitle: "Scout Trucks", items: ["Drive the area", "Find 10+ trucks", "Introduce yourself", "Get contacts"], color: "violet" },
    { title: "Week 3-4", subtitle: "Build Relations", items: ["Follow up", "Sign 3-5 vendors", "Set up menus", "Truck stop flyers"], color: "rose" },
    { title: "Week 5-6", subtitle: "Pre-Launch", items: ["File LLC", "Get EIN", "Open bank account", "Get supplies"], color: "pink" },
    { title: "Week 7-8", subtitle: "Soft Launch", items: ["Test deliveries", "Work out kinks", "Get feedback", "Final adjustments"], color: "emerald" },
    { title: "Launch!", subtitle: "Go Live", items: ["Accept orders", "Grow customer base", "Sign more trucks", "Build momentum"], color: "cyan" },
  ];

  const next = () => setCurrentSlide((prev) => (prev + 1) % weeks.length);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + weeks.length) % weeks.length);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-300" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {weeks.map((week, idx) => (
            <div key={idx} className="min-w-full p-4">
              <div className={`p-4 rounded-xl bg-${week.color}-500/10 border border-${week.color}-500/20`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white">{week.title}</h4>
                  <Badge className={`bg-${week.color}-500/20 text-${week.color}-300 border-${week.color}-500/30 text-xs`}>
                    {week.subtitle}
                  </Badge>
                </div>
                <ul className="space-y-1 text-sm">
                  {week.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className="size-4 rounded border border-white/20 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Button size="icon" variant="ghost" onClick={prev} className="size-8 rounded-full bg-white/5">
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex gap-1">
          {weeks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`size-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <Button size="icon" variant="ghost" onClick={next} className="size-8 rounded-full bg-white/5">
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function GrowthPathCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const levels = [
    { 
      title: "Level 1", 
      name: "Territory Partner", 
      badge: "Starting",
      desc: "Launch your territory, build the delivery business",
      benefits: ["50% of Happy Eats platform revenue (from 20% commission)", "Vendors keep 80% of every order — lowest rate in the industry"],
      color: "emerald"
    },
    { 
      title: "Level 2", 
      name: "Growth Milestone", 
      badge: "$30K/mo",
      desc: "Hit $30,000/month and unlock better terms",
      benefits: ["Upgrades to 55% of platform revenue", "Priority on new territory expansion"],
      color: "violet"
    },
    { 
      title: "Level 3", 
      name: "Founding Member", 
      badge: "Long-term",
      desc: "Expand to new zones and territories",
      benefits: ["Shape the franchise model", "Founding member status locked forever"],
      color: "rose"
    },
  ];

  const next = () => setCurrentSlide((prev) => (prev + 1) % levels.length);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + levels.length) % levels.length);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-300" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {levels.map((level, idx) => (
            <div key={idx} className="min-w-full p-2">
              <div className={`p-4 rounded-xl bg-gradient-to-br from-${level.color}-500/10 to-${level.color}-600/5 border border-${level.color}-500/20`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{level.title}</span>
                  <Badge className={`bg-${level.color}-500/20 text-${level.color}-300 border-${level.color}-500/30 text-xs`}>
                    {level.badge}
                  </Badge>
                </div>
                <h4 className="font-bold text-white mb-1">{level.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{level.desc}</p>
                <div className="space-y-1">
                  {level.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className={`size-3 text-${level.color}-400`} />
                      <span className="text-white/80">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <Button size="icon" variant="ghost" onClick={prev} className="size-6 rounded-full bg-white/5">
          <ChevronLeft className="size-3" />
        </Button>
        <div className="flex gap-1">
          {levels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`size-1.5 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <Button size="icon" variant="ghost" onClick={next} className="size-6 rounded-full bg-white/5">
          <ChevronRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export default function PartnerAgreement() {
  const params = useParams<{ name: string }>();
  const slug = params.name || "kathy";
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect to team login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/team");
    }
  }, [isAuthenticated, setLocation]);
  
  const [partner, setPartner] = useState<PartnerData>(() => getDefaultPartnerData(slug));
  const [acknowledging, setAcknowledging] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [confirmations, setConfirmations] = useState({
    reviewedTerms: false,
    understandProfitSplit: false,
    understandCostEntry: false,
    readyToPartner: false
  });
  const allConfirmed = confirmations.reviewedTerms && confirmations.understandProfitSplit && confirmations.understandCostEntry && confirmations.readyToPartner;
  const [showQR, setShowQR] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');
  const [certTheme, setCertTheme] = useState<'dark' | 'light'>('dark');
  const [showCertificate, setShowCertificate] = useState(false);
  const [cardInfo, setCardInfo] = useState<BusinessCardInfo>({
    phone: '',
    email: '',
    website: 'happyeats.app'
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardTemplate, setCardTemplate] = useState<'classic' | 'centered' | 'minimal'>('classic');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const businessCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Explanation modal states
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFoundingModal, setShowFoundingModal] = useState(false);

  const { data: existingAgreement } = useQuery({
    queryKey: ["/api/partner-agreements", slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/partner-agreements/${slug}`);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    }
  });

  useEffect(() => {
    if (existingAgreement && !initialized) {
      setPartner({
        name: existingAgreement.partnerName,
        businessName: existingAgreement.businessName,
        membershipNumber: existingAgreement.membershipNumber,
        region: existingAgreement.region,
        deliveryShare: existingAgreement.deliveryShare || 50,
        foodTruckCommissionShare: existingAgreement.foodTruckCommissionShare || 80,
        milestoneDeliveryShare: existingAgreement.milestoneDeliveryShare || 55,
        milestoneThreshold: existingAgreement.milestoneThreshold || 30000,
        agreementDate: existingAgreement.acknowledgedAt 
          ? new Date(existingAgreement.acknowledgedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        blockchainHash: existingAgreement.blockchainHash,
        acknowledged: !!existingAgreement.acknowledgedAt,
        partnerSlug: existingAgreement.partnerSlug
      });
      setInitialized(true);
    }
  }, [existingAgreement, initialized]);

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    
    try {
      if (!existingAgreement) {
        await apiRequest("POST", "/api/partner-agreements", {
          partnerSlug: slug,
          partnerName: partner.name,
          businessName: partner.businessName,
          membershipNumber: partner.membershipNumber,
          region: partner.region,
          deliveryShare: partner.deliveryShare,
          subscriptionShare: partner.foodTruckCommissionShare
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const hash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      
      await apiRequest("POST", `/api/partner-agreements/${slug}/acknowledge`, {
        blockchainHash: hash
      });
      
      setPartner(prev => ({
        ...prev,
        acknowledged: true,
        blockchainHash: hash,
        agreementDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })
      }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/partner-agreements", slug] });
      
      // Redirect to owner dashboard after 2 seconds
      setTimeout(() => {
        setLocation('/owner');
      }, 2000);
    } catch (error) {
      console.error("Failed to acknowledge agreement:", error);
    }
    
    setAcknowledging(false);
  };

  const handleDownload = async () => {
    const agreementEl = document.querySelector('.partner-agreement-content') as HTMLElement;
    if (agreementEl) {
      try {
        await captureElementAndPrint(agreementEl, { scale: 2, backgroundColor: '#0f172a' });
      } catch {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleDownloadReceipt = async () => {
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Partnership Agreement Receipt - ${partner.membershipNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #f8fafc; }
    .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #0f172a; }
    .subtitle { color: #64748b; margin-top: 5px; }
    .verified-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-top: 15px; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .section-title { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 15px; letter-spacing: 1px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; }
    .value { font-weight: 600; color: #0f172a; }
    .hash { font-family: monospace; font-size: 11px; word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 8px; color: #10b981; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; }
    .qr-note { text-align: center; margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; color: #1e40af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Happy Eats</div>
    <div class="subtitle">Partnership Agreement Receipt</div>
    <div class="verified-badge">Blockchain Verified</div>
  </div>
  
  <div class="section">
    <div class="section-title">Partner Information</div>
    <div class="row"><span class="label">Partner Name</span><span class="value">${partner.name}</span></div>
    <div class="row"><span class="label">Business Name</span><span class="value">${partner.businessName}</span></div>
    <div class="row"><span class="label">Membership Number</span><span class="value">${partner.membershipNumber}</span></div>
    <div class="row"><span class="label">Territory</span><span class="value">${partner.region}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Agreement Terms</div>
    <div class="row"><span class="label">Platform Revenue Share</span><span class="value">${partner.deliveryShare}% Kathy / ${100 - partner.deliveryShare - 10}% Jason / 10% Expense</span></div>
    <div class="row"><span class="label">Vendor Keeps (per order)</span><span class="value">${partner.foodTruckCommissionShare}% — lowest in the industry</span></div>
    <div class="row"><span class="label">Milestone ($${(partner.milestoneThreshold/1000).toFixed(0)}K/mo)</span><span class="value">Kathy upgrades to ${partner.milestoneDeliveryShare}% / Jason ${100 - partner.milestoneDeliveryShare - 10}% / Expense 10%</span></div>
    <div class="row"><span class="label">Acknowledged Date</span><span class="value">${partner.agreementDate}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Verification Hash</div>
    <div class="hash">${partner.blockchainHash}</div>
  </div>
  
  <div class="qr-note">
    Verify this agreement at: https://happyeats.app/verify/${partner.membershipNumber}
  </div>
  
  <div class="footer">
    <p>Dark Wave Studios LLC • darkwavestudios.io</p>
    <p>This receipt confirms your partnership agreement has been recorded and verified.</p>
    <p>Keep this document for your records.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    await universalDownload(blob, `HappyEats_Receipt_${partner.membershipNumber}.html`);
  };

  const handleShareReceipt = async () => {
    const receiptText = `Happy Eats Partnership Receipt\nPartner: ${partner.name}\nBusiness: ${partner.businessName}\nMembership: ${partner.membershipNumber}\nTerritory: ${partner.region}\nDelivery Profit: ${partner.deliveryShare}% Kathy / ${100 - partner.deliveryShare}% Jason\nFood Truck Commission: ${partner.foodTruckCommissionShare}/${100 - partner.foodTruckCommissionShare} Split\nMilestone: ${partner.milestoneDeliveryShare}/${100 - partner.milestoneDeliveryShare} at $${(partner.milestoneThreshold/1000).toFixed(0)}K/mo\nVerification: ${partner.blockchainHash}`;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    if (navigator.share) {
      try {
        const file = new File([blob], `HappyEats_Receipt_${partner.membershipNumber}.txt`, { type: 'text/plain' });
        await navigator.share({ files: [file], title: 'Happy Eats Partnership Receipt' });
        return;
      } catch {}
    }
    await universalDownload(blob, `HappyEats_Receipt_${partner.membershipNumber}.txt`);
  };

  const handleDownloadBusinessCard = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try {
      await captureElementAsImage(businessCardRef.current, `${partner.name.toLowerCase()}-business-card-${cardTemplate}-${cardTheme}.png`, {
        scale: 3,
        backgroundColor: cardTheme === 'dark' ? '#0f172a' : '#ffffff',
      });
    } catch (error) {
      console.error('Failed to download business card:', error);
    }
    setIsDownloading(false);
  };

  const handleShareBusinessCard = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try {
      await captureElementAndShare(businessCardRef.current, `${partner.name.toLowerCase()}-business-card.png`, {
        scale: 3,
        backgroundColor: cardTheme === 'dark' ? '#0f172a' : '#ffffff',
      });
    } catch (error) {
      console.error('Failed to share business card:', error);
    }
    setIsDownloading(false);
  };

  const handleEmailBusinessCard = async () => {
    if (!businessCardRef.current) return;
    setIsDownloading(true);
    try {
      await captureElementAndEmail(businessCardRef.current, `${partner.name.toLowerCase()}-business-card.png`, "Happy Eats Partner Business Card", {
        scale: 3,
        backgroundColor: cardTheme === 'dark' ? '#0f172a' : '#ffffff',
      });
    } catch (error) {
      console.error('Failed to email business card:', error);
    }
    setIsDownloading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('Image must be under 25MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cardImageSrc = customImage || '/trustlayer-emblem.jpg';

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d32] to-[#0a1628] overflow-x-hidden">
      <div className="sticky top-14 z-40 px-4 py-2 bg-[#0d1f35]/90 backdrop-blur-xl border-b border-white/5">
        <PageLanguageToggle />
      </div>
      <div className="max-w-6xl 2xl:max-w-[1600px] mx-auto px-4 py-6 2xl:py-8">
        
        {/* Personal Note from Jason */}
        {slug === "kathy" && (
          <div className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <p className="text-sm text-white">
              <span className="font-medium">Hey Kathy!</span> 👋 I had a little help from AI to make all this legal stuff sound better 😂 
              But everything here is exactly what we talked about - just written out nice and professional. 
              Take your time looking through it, and holler if you have any questions!
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Jason</p>
          </div>
        )}
        
        {/* Dashboard Header - Compact View */}
        <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Emblem */}
              <div className="size-14 md:size-16 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex-shrink-0">
                <img src="/trustlayer-emblem.jpg" alt="Trust Layer" className="w-full h-full object-cover" />
              </div>
              
              {/* Info Grid */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                  <h1 className="text-lg md:text-xl font-heading font-bold text-white">{partner.name}</h1>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  <span className="text-sm text-cyan-400">{partner.businessName}</span>
                </div>
                
                {/* Credential Badges - Horizontal Row */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
                  >
                    <Shield className="size-3" />
                    {partner.membershipNumber}
                  </button>
                  
                  {partner.blockchainHash && (
                    <button 
                      onClick={() => setShowHash(!showHash)}
                      className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="size-3" />
                      Verified
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowBusinessCard(!showBusinessCard)}
                    className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                  >
                    <FileText className="size-3" />
                    Business Card
                  </button>
                  
                  <button 
                    onClick={handleDownload}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 transition-colors flex items-center gap-1 print:hidden"
                  >
                    <Printer className="size-3" />
                    Print Kit
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expandable QR Code */}
            {showQR && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG 
                      value={`https://happyeats.app/verify/${partner.membershipNumber}`}
                      size={80}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-white font-medium mb-1">Verification QR Code</p>
                    <p className="text-xs text-muted-foreground">Scan to verify partnership at happyeats.app</p>
                    <p className="text-xs text-cyan-400 mt-1 font-mono">{partner.membershipNumber}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Expandable Hash */}
            {showHash && partner.blockchainHash && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Blockchain Verification Hash</p>
                <p className="text-xs font-mono text-emerald-400/80 break-all">{partner.blockchainHash}</p>
                <p className="text-xs text-muted-foreground mt-1">Acknowledged: {partner.agreementDate}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Card Builder */}
        {showBusinessCard && (
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] mb-6 print:hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileText className="size-4 text-rose-400" />
                  Business Card Builder
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCardTheme('dark')}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      cardTheme === 'dark' 
                        ? 'bg-slate-800 text-white border border-cyan-500/30' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setCardTheme('light')}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      cardTheme === 'light' 
                        ? 'bg-white text-slate-900 border border-slate-300' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Template Style</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCardTemplate('classic')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
                      cardTemplate === 'classic' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    Classic (Logo Left)
                  </button>
                  <button
                    onClick={() => setCardTemplate('centered')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
                      cardTemplate === 'centered' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    Centered
                  </button>
                  <button
                    onClick={() => setCardTemplate('minimal')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
                      cardTemplate === 'minimal' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    Minimal (QR Focus)
                  </button>
                </div>
              </div>

              {/* Custom Image Upload */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Custom Logo/Image (up to 25MB)</label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-md text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
                  >
                    {customImage ? 'Change Image' : 'Upload Custom Image'}
                  </button>
                  {customImage && (
                    <button
                      onClick={() => setCustomImage(null)}
                      className="px-3 py-2 rounded-md text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-colors"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={cardInfo.phone}
                    onChange={(e) => setCardInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(615) 555-1234"
                    className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    value={cardInfo.email}
                    onChange={(e) => setCardInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="kathy@happyeats.app"
                    className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Website</label>
                  <input
                    type="text"
                    value={cardInfo.website}
                    onChange={(e) => setCardInfo(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="happyeats.app"
                    className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Business Card Preview - CLASSIC TEMPLATE */}
              {cardTemplate === 'classic' && (
                <div className="flex justify-center mb-4">
                  <div 
                    ref={businessCardRef}
                    className={`w-[350px] h-[200px] rounded-xl p-4 flex ${
                      cardTheme === 'dark' 
                        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20' 
                        : 'bg-white border border-slate-200 shadow-lg'
                    }`}
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0">
                          <img src={cardImageSrc} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h2 className={`font-bold text-lg leading-tight ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {partner.name}
                          </h2>
                          <p className={`text-xs ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {partner.businessName}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {cardInfo.phone && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.phone}</p>}
                        {cardInfo.email && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.email}</p>}
                        {cardInfo.website && <p className={`text-xs font-medium ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{cardInfo.website}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className={`p-1.5 rounded-lg ${cardTheme === 'dark' ? 'bg-white' : 'bg-white border border-slate-200'}`}>
                        <QRCodeSVG value={`https://happyeats.app/verify/${partner.membershipNumber}`} size={60} level="M" includeMargin={false} />
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-mono ${cardTheme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>{partner.membershipNumber}</p>
                        <div className={`flex items-center gap-1 justify-end ${cardTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          <Shield className="size-3" />
                          <span className="text-[10px]">Trust Layer Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Card Preview - CENTERED TEMPLATE */}
              {cardTemplate === 'centered' && (
                <div className="flex justify-center mb-4">
                  <div 
                    ref={businessCardRef}
                    className={`w-[350px] h-[200px] rounded-xl p-4 flex flex-col items-center justify-between ${
                      cardTheme === 'dark' 
                        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20' 
                        : 'bg-white border border-slate-200 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0">
                        <img src={cardImageSrc} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <h2 className={`font-bold text-xl leading-tight ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {partner.name}
                        </h2>
                        <p className={`text-xs ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {partner.businessName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center space-y-0.5">
                        {cardInfo.phone && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.phone}</p>}
                        {cardInfo.email && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.email}</p>}
                        {cardInfo.website && <p className={`text-xs font-medium ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{cardInfo.website}</p>}
                      </div>
                      <div className={`p-1.5 rounded-lg ${cardTheme === 'dark' ? 'bg-white' : 'bg-white border border-slate-200'}`}>
                        <QRCodeSVG value={`https://happyeats.app/verify/${partner.membershipNumber}`} size={50} level="M" includeMargin={false} />
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${cardTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <Shield className="size-3" />
                      <span className="text-[10px]">{partner.membershipNumber} • Trust Layer Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Card Preview - MINIMAL TEMPLATE */}
              {cardTemplate === 'minimal' && (
                <div className="flex justify-center mb-4">
                  <div 
                    ref={businessCardRef}
                    className={`w-[350px] h-[200px] rounded-xl p-4 flex ${
                      cardTheme === 'dark' 
                        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20' 
                        : 'bg-white border border-slate-200 shadow-lg'
                    }`}
                  >
                    <div className="flex-1 flex flex-col justify-center">
                      <h2 className={`font-bold text-2xl leading-tight mb-1 ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {partner.name}
                      </h2>
                      <p className={`text-sm mb-3 ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        {partner.businessName}
                      </p>
                      <div className="space-y-0.5">
                        {cardInfo.phone && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.phone}</p>}
                        {cardInfo.email && <p className={`text-xs ${cardTheme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>{cardInfo.email}</p>}
                        {cardInfo.website && <p className={`text-xs font-medium ${cardTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{cardInfo.website}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-lg overflow-hidden border border-cyan-500/30">
                        <img src={cardImageSrc} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className={`p-1.5 rounded-lg ${cardTheme === 'dark' ? 'bg-white' : 'bg-white border border-slate-200'}`}>
                        <QRCodeSVG value={`https://happyeats.app/verify/${partner.membershipNumber}`} size={70} level="M" includeMargin={false} />
                      </div>
                      <p className={`text-[9px] font-mono ${cardTheme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{partner.membershipNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Download/Share/Email Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  onClick={handleDownloadBusinessCard}
                  disabled={isDownloading}
                  className="gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 min-h-[44px]"
                  data-testid="button-download-business-card"
                >
                  {isDownloading ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Working...
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Download {cardTemplate.charAt(0).toUpperCase() + cardTemplate.slice(1)} ({cardTheme === 'dark' ? 'Dark' : 'Light'})
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShareBusinessCard}
                  disabled={isDownloading}
                  variant="outline"
                  className="gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 min-h-[44px]"
                  data-testid="button-share-business-card"
                >
                  <Share2 className="size-4" /> Share
                </Button>
                <Button
                  onClick={handleEmailBusinessCard}
                  disabled={isDownloading}
                  variant="outline"
                  className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]"
                  data-testid="button-email-business-card"
                >
                  <Mail className="size-4" /> Email
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Standard business card size (3.5" x 2") • High resolution PNG • Ready for print shops like FedEx, UPS, Staples
              </p>
            </CardContent>
          </Card>
        )}

        {/* FOUNDING MEMBER CERTIFICATE - Floating CTA Button */}
        <button
          onClick={() => setShowCertificate(true)}
          className="w-full group relative bg-gradient-to-br from-[#0d1f35] to-[#162840] rounded-xl p-5 border border-cyan-500/30 shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.25)] hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform duration-300">
              <Award className="size-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Your Partner Certificate</h3>
              <p className="text-sm text-slate-400">Download or print for your files</p>
            </div>
            <div className="size-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <ChevronRight className="size-5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* Certificate Modal */}
        <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
          <DialogContent className="max-w-lg bg-[#0a1628] border-cyan-500/30 p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white font-bold">Your Certificate</DialogTitle>
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={certTheme === 'dark' ? 'default' : 'ghost'}
                    onClick={() => setCertTheme('dark')}
                    className={`h-7 px-2 text-xs ${certTheme === 'dark' ? 'bg-slate-700' : ''}`}
                  >
                    <Moon className="size-3 mr-1" /> Dark
                  </Button>
                  <Button
                    size="sm"
                    variant={certTheme === 'light' ? 'default' : 'ghost'}
                    onClick={() => setCertTheme('light')}
                    className={`h-7 px-2 text-xs ${certTheme === 'light' ? 'bg-white text-slate-800' : ''}`}
                  >
                    <Sun className="size-3 mr-1" /> Print
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Certificate - Portrait Style */}
            <div className="p-4">
              <div 
                id="founding-certificate"
                className={`rounded-lg p-6 border-4 border-double shadow-inner transition-all duration-300 ${
                  certTheme === 'dark' 
                    ? 'bg-gradient-to-br from-[#0a1628] to-[#0f1d32] border-cyan-500/30' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                }`}
                style={{ aspectRatio: '8.5/11' }}
              >
                <div className="h-full flex flex-col items-center justify-between text-center py-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Truck className={`size-6 ${certTheme === 'dark' ? 'text-cyan-400' : 'text-rose-500'}`} />
                      <span className={`text-xl font-bold bg-clip-text text-transparent ${
                        certTheme === 'dark' 
                          ? 'bg-gradient-to-r from-cyan-400 to-violet-400' 
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}>
                        Happy Eats
                      </span>
                    </div>
                    <p className={`text-xs tracking-widest uppercase ${certTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>A Trust Layer Company</p>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-3 py-6">
                    <p className={`text-sm ${certTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>This certificate recognizes</p>
                    <h1 className={`text-2xl font-bold ${certTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{partner.name}</h1>
                    <p className={`text-base font-medium ${certTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{partner.businessName}</p>
                    <div className={`w-20 h-px mx-auto my-2 ${
                      certTheme === 'dark' 
                        ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent' 
                        : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'
                    }`} />
                    <p className={`text-xs max-w-xs mx-auto ${certTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      as a <span className={`font-bold ${certTheme === 'dark' ? 'text-cyan-400' : 'text-rose-600'}`}>Founding Partner</span> of the Happy Eats franchise network.
                    </p>
                    <p className={`text-xs italic ${certTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                      "Here's to the journey ahead!"
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className={`w-24 border-t mb-1 ${certTheme === 'dark' ? 'border-cyan-500/50' : 'border-slate-400'}`} />
                        <p className={`text-[10px] ${certTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Jason Moore, Founder</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-left">
                        <p className={`text-[9px] uppercase tracking-wide ${certTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Territory</p>
                        <p className={`text-[10px] ${certTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{partner.region}</p>
                      </div>
                      <div className="text-right">
                        <QRCodeSVG 
                          value={`https://happyeats.app/verify/${partner.membershipNumber}`} 
                          size={40} 
                          level="M" 
                          includeMargin={false}
                          bgColor="transparent"
                          fgColor={certTheme === 'dark' ? '#22d3ee' : '#000000'}
                        />
                        <p className={`text-[7px] font-mono mt-0.5 ${certTheme === 'dark' ? 'text-cyan-400/70' : 'text-slate-400'}`}>{partner.membershipNumber}</p>
                      </div>
                    </div>
                    <p className={`text-[7px] text-center ${certTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Issued {partner.agreementDate} • trustlayer.io
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download/Share/Email Actions */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={async () => {
                    const element = document.getElementById('founding-certificate');
                    if (element) {
                      await captureElementAsImage(element, `${partner.name.toLowerCase()}-founding-partner-certificate.png`, {
                        scale: 3,
                        backgroundColor: certTheme === 'dark' ? '#0a1628' : '#f8fafc',
                      });
                    }
                  }}
                  className="flex-1 gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 min-h-[44px]"
                  data-testid="button-download-certificate"
                >
                  <Download className="size-4" />
                  Download
                </Button>
                <Button
                  onClick={async () => {
                    const element = document.getElementById('founding-certificate');
                    if (element) {
                      await captureElementAndShare(element, `${partner.name.toLowerCase()}-certificate.png`, {
                        scale: 3,
                        backgroundColor: certTheme === 'dark' ? '#0a1628' : '#f8fafc',
                      });
                    }
                  }}
                  variant="outline"
                  className="gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 min-h-[44px]"
                  data-testid="button-share-certificate"
                >
                  <Share2 className="size-4" /> Share
                </Button>
                <Button
                  onClick={async () => {
                    const element = document.getElementById('founding-certificate');
                    if (element) {
                      await captureElementAndEmail(element, `${partner.name.toLowerCase()}-certificate.png`, "Happy Eats Founding Partner Certificate", {
                        scale: 3,
                        backgroundColor: certTheme === 'dark' ? '#0a1628' : '#f8fafc',
                      });
                    }
                  }}
                  variant="outline"
                  className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 min-h-[44px]"
                  data-testid="button-email-certificate"
                >
                  <Mail className="size-4" /> Email
                </Button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground">
                High resolution • Download, share, email, or print from any device
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Market Opportunity - Large Card */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2 lg:col-span-1 lg:row-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <MapPin className="size-4 text-orange-400" />
                </div>
                <h3 className="font-bold text-white">Market Opportunity</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Daily Trucks</p>
                      <p className="text-white font-bold">6,500-10,000</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Buy Meals</p>
                      <p className="text-white font-bold">90%+</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Spend</p>
                      <p className="text-white font-bold">$20-30</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Meals/Day</p>
                      <p className="text-white font-bold">2-3</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
                  <p className="text-xs text-muted-foreground">Daily Food Spending</p>
                  <p className="text-2xl font-bold text-emerald-400">$250,000+</p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Nobody delivers to these drivers. We're first. This is <span className="text-orange-400 font-medium">DoorDash for food trucks</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Per Order */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <DollarSign className="size-4 text-violet-400" />
                </div>
                <h3 className="font-bold text-white">Per Order Revenue</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-[10px] text-muted-foreground">Example: $25 meal order</p>
                
                <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] text-emerald-400 font-medium mb-1">Delivery Revenue (60/40 split)</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Customer service fee (20%)</span>
                    <span className="text-white text-xs">$3.75</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Kathy's 60%</span>
                    <span className="font-bold">$2.25</span>
                  </div>
                  <div className="flex justify-between text-violet-400 text-xs">
                    <span>Jason's 40%</span>
                    <span className="font-bold">$1.50</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-violet-500/5 border border-violet-500/10">
                  <p className="text-[10px] text-violet-400 font-medium mb-1">Commission Revenue (50/50 split)</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Food truck commission (20%)</span>
                    <span className="text-white text-xs">$3.75</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Kathy's 50%</span>
                    <span className="font-bold">$1.88</span>
                  </div>
                  <div className="flex justify-between text-violet-400 text-xs">
                    <span>Jason's 50%</span>
                    <span className="font-bold">$1.87</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">Kathy's Total Per Order</span>
                  <span className="text-emerald-400 font-bold">$4.13</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Split */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Users className="size-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white">Your Split</h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-auto">Founding Partner</Badge>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-white">Happy Eats Delivery Profits</p>
                    <p className="text-lg font-bold text-emerald-400">{partner.deliveryShare}/{100 - partner.deliveryShare}</p>
                  </div>
                  <p className="text-[10px] text-emerald-300/70">Kathy {partner.deliveryShare}% / Jason {100 - partner.deliveryShare}%</p>
                </div>
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-white">Food Truck Commissions</p>
                    <p className="text-lg font-bold text-violet-400">{partner.foodTruckCommissionShare}/{100 - partner.foodTruckCommissionShare}</p>
                  </div>
                  <p className="text-[10px] text-violet-300/70">20% per order from vendors — split 50/50</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-white">Milestone Upgrade</p>
                    <p className="text-lg font-bold text-cyan-400">{partner.milestoneDeliveryShare}/{100 - partner.milestoneDeliveryShare}</p>
                  </div>
                  <p className="text-[10px] text-cyan-300/70">At ${(partner.milestoneThreshold/1000).toFixed(0)}K/mo → delivery split upgrades to {partner.milestoneDeliveryShare}% Kathy</p>
                </div>
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                TL Driver Connect remains Jason's platform. Happy Eats delivery and food truck commissions are split as shown above.
              </p>
            </CardContent>
          </Card>

          {/* Action Plan Carousel */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Calendar className="size-4 text-sky-400" />
                </div>
                <h3 className="font-bold text-white">Action Plan</h3>
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs ml-auto">Swipe</Badge>
              </div>
              <ActionPlanCarousel />
            </CardContent>
          </Card>

          {/* Growth Path Carousel */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="size-4 text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Growth Path</h3>
              </div>
              <GrowthPathCarousel />
            </CardContent>
          </Card>

          {/* Financial Projections - Accordion */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2 lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="size-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white">Your Earnings ({partner.deliveryShare}% Delivery + 50% Commissions)</h3>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] ml-auto">Launch: Apr-May 2026</Badge>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="month3" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>Month 3 (June 2026)</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">~$2,475/mo</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Orders: 20/day = 600/mo</div>
                      <div>Avg order: $25</div>
                      <div>Delivery (60% of $3.75): $2.25/order</div>
                      <div>Commission (50% of $3.75): $1.88/order</div>
                      <div>Delivery share: $1,350</div>
                      <div>Commission share: $1,125</div>
                      <div className="text-emerald-400 col-span-2">Kathy's Total: ~$2,475/month</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="month6" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>Month 6 (Sept 2026)</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">~$6,200/mo</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Orders: 50/day = 1,500/mo</div>
                      <div>Avg order: $25</div>
                      <div>Delivery (60% of $5,625): $3,375</div>
                      <div>Commission (50% of $5,625): $2,813</div>
                      <div className="text-emerald-400 col-span-2">Kathy's Total: ~$6,188/month</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="year1" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>Year 1 (April 2027)</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">~$13,500/mo</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Orders: 100/day = 3,000/mo</div>
                      <div>Avg order: $25</div>
                      <div className="text-cyan-400 col-span-2">$30K milestone → 70/30 delivery split</div>
                      <div>Delivery (70% of $11,250): $7,875</div>
                      <div>Commission (50% of $11,250): $5,625</div>
                      <div className="text-emerald-400 col-span-2 font-bold">Kathy's Total: ~$13,500/month (~$162K/year)</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="year2" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>Year 2 (April 2028)</span>
                      <Badge className="bg-rose-500/20 text-rose-300 text-xs">~$20,250/mo</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Orders: 150/day = 4,500/mo</div>
                      <div>Avg order: $25</div>
                      <div>Delivery (70% of $16,875): $11,813</div>
                      <div>Commission (50% of $16,875): $8,438</div>
                      <div className="text-emerald-400 col-span-2 font-bold">Kathy's Total: ~$20,250/month (~$243K/year)</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <p className="text-[10px] text-muted-foreground mt-3">
                Conservative estimates. Delivery revenue (customer 20% service fee) split 60/40 → 70/30 at milestone. Food truck commission (20% per order) always split 50/50.
              </p>
            </CardContent>
          </Card>

          {/* First Tenant Benefits */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Sparkles className="size-4 text-rose-400" />
                </div>
                <h3 className="font-bold text-white">First Tenant Benefits</h3>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] ml-auto">Exclusive</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => setShowProfitModal(true)}
                  className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-left hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-white mb-1">60/40 → 70/30 Delivery Split</p>
                  <p className="text-[10px] text-muted-foreground">Tap to learn more</p>
                </button>
                <button 
                  onClick={() => setShowSubscriptionModal(true)}
                  className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-left hover:bg-violet-500/20 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-white mb-1">50/50 Food Truck Commissions</p>
                  <p className="text-[10px] text-muted-foreground">Tap to learn more</p>
                </button>
                <button 
                  onClick={() => setShowFoundingModal(true)}
                  className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-left hover:bg-cyan-500/20 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-white mb-1">Founding Partner Status</p>
                  <p className="text-[10px] text-muted-foreground">Tap to learn more</p>
                </button>
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                As our founding partner, Kathy gets a 60/40 delivery split that upgrades to 70/30 at $30K/mo — better terms than any future franchisee. Food truck commissions are always 50/50.
              </p>
            </CardContent>
          </Card>

          {/* Business Costs & Transparency */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Heart className="size-4 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white">Business Costs</h3>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-white mb-2">Where does the money go?</p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Jason's 40% (or 30% after milestone) goes to <span className="text-white">Dark Wave Studios LLC</span> (Jason's business), not to Jason personally. It covers the real costs of keeping this whole thing running:
                </p>
                <ul className="text-[10px] text-muted-foreground space-y-1 mb-2">
                  <li>• App hosting, servers, and keeping everything online</li>
                  <li>• Payment processing systems (Stripe fees, etc.)</li>
                  <li>• Customer support and driver coordination tools</li>
                  <li>• Marketing to bring in more food trucks and customers</li>
                  <li>• Growing the franchise so we all benefit</li>
                </ul>
                <p className="text-[10px] text-cyan-400">
                  Jason takes a salary from Dark Wave Studios only when the business is profitable - just like you. We're in this together.
                </p>
              </div>
              
              <div className="border-t border-white/10 pt-3 mb-3">
                <p className="text-xs font-medium text-white mb-2 flex items-center gap-1">
                  <FileText className="size-3 text-cyan-400" />
                  What Counts as "Costs" (Deducted Before 60/40 Split)
                </p>
                <ul className="space-y-1 text-[10px] text-muted-foreground">
                  <li>• <span className="text-white">Driver pay</span> (when you hire delivery drivers)</li>
                  <li>• <span className="text-white">Fuel & mileage</span> (for deliveries)</li>
                  <li>• <span className="text-white">Supplies & packaging</span></li>
                  <li>• <span className="text-white">Platform fees</span> (Stripe 2.9%, etc.)</li>
                </ul>
                <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> You are responsible for entering costs manually in the Business Suite
                </p>
              </div>
              
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs font-medium text-white mb-2 flex items-center gap-1">
                  <AlertTriangle className="size-3 text-rose-400" />
                  Potential Risks (Honest)
                </p>
                <ul className="space-y-1 text-[10px] text-muted-foreground">
                  <li>• Slow start: 1-3 months building vendor network</li>
                  <li>• Weather/seasonal impacts</li>
                  <li>• Vehicle costs are your responsibility</li>
                  <li>• No guaranteed income - this is a business</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preparing for Launch - Accordion */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Building className="size-4 text-rose-400" />
                </div>
                <h3 className="font-bold text-white">Preparing for Launch</h3>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="nest" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-emerald-400" />
                      Build Your Nest Egg
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    Target $2,000-$5,000 emergency fund. Cover gas, slow days, unexpected expenses.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bank" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center gap-2">
                      <Building className="size-4 text-blue-400" />
                      Business Checking Account (Required)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-2">
                    <p>You'll need a separate business checking account for Happy Eats transactions. This keeps your personal finances separate and makes tax time a breeze.</p>
                    <p className="font-medium text-white">Easy options:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><span className="text-cyan-400">Lili</span> - Free business checking, great for small business</li>
                      <li><span className="text-cyan-400">Novo</span> - Free, integrates with accounting software</li>
                      <li><span className="text-cyan-400">Your local bank</span> - If you prefer in-person banking</li>
                    </ul>
                    <p className="font-medium text-white mt-2">Add Jason as a read-only viewer:</p>
                    <p>Once your account is set up, add Jason as a "view-only" user or "accountant access" (each bank calls it something different). This just lets him see transactions for audit purposes - he can't move money or make changes. It's standard practice for franchise partnerships so both sides can verify the numbers are accurate.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="vehicle" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center gap-2">
                      <Car className="size-4 text-violet-400" />
                      Delivery Vehicle Ready
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    Reliable car, insulated food bags, phone mount, current insurance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="llc" className="border-white/10">
                  <AccordionTrigger className="text-sm text-white hover:no-underline no-underline [&>*]:no-underline py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-orange-400" />
                      LLC & EIN Setup
                      <Badge className="bg-slate-500/20 text-slate-300 text-[10px] ml-auto">Standard Info</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    <p className="mb-2">General guidance for anyone who needs it:</p>
                    <ul className="space-y-1">
                      <li>• File LLC in TN (~$300 at sos.tn.gov)</li>
                      <li>• Free EIN at IRS.gov (15 min)</li>
                    </ul>
                    <div className="mt-3 p-2 rounded bg-orange-500/10 border border-orange-500/20">
                      <p className="text-orange-300 text-xs">
                        <strong>For {partner.name}:</strong> Once ready, {partner.businessName} transfers to your LLC. Until then, we operate under my EIN.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Disclaimers - Accordion */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
                  <AlertTriangle className="size-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Disclaimers</h3>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="income" className="border-white/10">
                  <AccordionTrigger className="text-xs text-white hover:no-underline py-2">Income Projections</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    Estimates based on market research. Results vary based on effort and conditions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contractor" className="border-white/10">
                  <AccordionTrigger className="text-xs text-white hover:no-underline py-2">Independent Contractor</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    You operate as an independent business owner. Responsible for taxes, insurance, licenses.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="risks" className="border-white/10">
                  <AccordionTrigger className="text-xs text-white hover:no-underline py-2">Business Risks</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    All ventures carry risk. Success depends on dedication and market conditions.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Marketing Materials - Full Width */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2 lg:col-span-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <FileText className="size-4 text-rose-400" />
                </div>
                <h3 className="font-bold text-white">Marketing Materials</h3>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs ml-auto">Print Ready</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/marketing?tab=print">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all text-center cursor-pointer group" data-testid="card-partner-all-materials">
                    <Megaphone className="size-6 mx-auto text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">Print Studio</p>
                  </div>
                </Link>
                <Link href="/marketing?tab=print">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all text-center cursor-pointer group" data-testid="card-partner-business-cards">
                    <Award className="size-6 mx-auto text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">Business Cards</p>
                  </div>
                </Link>
                <Link href="/flyer">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-center cursor-pointer group">
                    <Users className="size-6 mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">Driver Flyer</p>
                  </div>
                </Link>
                <Link href="/food-truck-flyer">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all text-center cursor-pointer group">
                    <Truck className="size-6 mx-auto text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">Food Truck Flyer</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Standard Terms Card - Full Width */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2 lg:col-span-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
                  <Shield className="size-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-white">Standard Terms</h3>
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs ml-auto">For All Partners</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Territory Exclusivity */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-cyan-400" />
                    <h4 className="font-medium text-white text-sm">Territory Exclusivity</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your assigned territory ({partner.region}) is exclusively yours. No other Happy Eats partner will operate in your zone without your written consent.
                  </p>
                </div>

                {/* Cancellation Terms */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="size-4 text-orange-400" />
                    <h4 className="font-medium text-white text-sm">Cancellation Terms</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Either party may end this partnership with 30 days written notice. No penalties or fees for cancellation. We want partners who want to be here.
                  </p>
                </div>

                {/* Support Contact */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="size-4 text-rose-400" />
                    <h4 className="font-medium text-white text-sm">Support Contact</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Questions? Reach out anytime. Jason is available via text, call, or email. You're never on your own - we're building this together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agreement Card - Full Width */}
          <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.08)] md:col-span-2 lg:col-span-3">
            <CardContent className="p-4">
              {partner.acknowledged ? (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="size-16 rounded-xl overflow-hidden border border-emerald-500/30">
                    <img src="/trustlayer-emblem.jpg" alt="Trust Layer" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <CheckCircle className="size-5 text-emerald-400" />
                      <h3 className="font-bold text-white">Agreement Acknowledged</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {partner.name} • {partner.businessName} • {partner.membershipNumber}
                    </p>
                    <p className="text-xs font-mono text-emerald-400/70 break-all">
                      {partner.blockchainHash}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Acknowledged on {partner.agreementDate}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <Shield className="size-3 mr-1" /> Blockchain Verified
                    </Badge>
                    <Button
                      data-testid="button-download-receipt"
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      size="sm"
                      className="gap-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 min-h-[44px]"
                    >
                      <Download className="size-3" />
                      Download
                    </Button>
                    <Button
                      data-testid="button-share-receipt"
                      onClick={handleShareReceipt}
                      variant="outline"
                      size="sm"
                      className="gap-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[44px]"
                    >
                      <Share2 className="size-3" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-xl overflow-hidden border border-cyan-500/30 flex-shrink-0">
                      <img src="/trustlayer-emblem.jpg" alt="Trust Layer" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">Ready to Acknowledge?</h3>
                      <p className="text-xs text-muted-foreground">
                        Please confirm each item below, then click Acknowledge to lock in your partnership.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-slate-800/50 rounded-xl p-4 border border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        data-testid="checkbox-reviewed-terms"
                        checked={confirmations.reviewedTerms}
                        onChange={(e) => setConfirmations(prev => ({ ...prev, reviewedTerms: e.target.checked }))}
                        className="mt-0.5 size-5 rounded border-white/30 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm text-white group-hover:text-emerald-300 transition-colors">I've reviewed the welcome kit and understand the terms</p>
                        <p className="text-xs text-muted-foreground">Including the profit split and partnership structure</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        data-testid="checkbox-profit-split"
                        checked={confirmations.understandProfitSplit}
                        onChange={(e) => setConfirmations(prev => ({ ...prev, understandProfitSplit: e.target.checked }))}
                        className="mt-0.5 size-5 rounded border-white/30 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm text-white group-hover:text-emerald-300 transition-colors">I understand the 60/40 delivery split (upgrading to 70/30 at $30K/mo)</p>
                        <p className="text-xs text-muted-foreground">60% Kathy / 40% Jason — franchise fee + royalties to Dark Wave Studios LLC</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        data-testid="checkbox-cost-entry"
                        checked={confirmations.understandCostEntry}
                        onChange={(e) => setConfirmations(prev => ({ ...prev, understandCostEntry: e.target.checked }))}
                        className="mt-0.5 size-5 rounded border-white/30 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm text-white group-hover:text-emerald-300 transition-colors">I understand the 50/50 food truck commission split and cost entry</p>
                        <p className="text-xs text-muted-foreground">Food truck commissions (20% per order) split equally. Costs entered manually in Business Suite.</p>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        data-testid="checkbox-ready-partner"
                        checked={confirmations.readyToPartner}
                        onChange={(e) => setConfirmations(prev => ({ ...prev, readyToPartner: e.target.checked }))}
                        className="mt-0.5 size-5 rounded border-white/30 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm text-white group-hover:text-emerald-300 transition-colors">I'm ready to become a founding partner of Happy Eats</p>
                        <p className="text-xs text-muted-foreground">Let's build something amazing together!</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <Button 
                      data-testid="button-acknowledge-agreement"
                      onClick={handleAcknowledge}
                      disabled={acknowledging || !allConfirmed}
                      className={`gap-2 px-8 ${allConfirmed 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' 
                        : 'bg-slate-600 cursor-not-allowed'}`}
                    >
                      {acknowledging ? (
                        <>
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Recording to Blockchain...
                        </>
                      ) : (
                        <>
                          <Shield className="size-4" />
                          {allConfirmed ? 'Acknowledge Agreement' : 'Check all boxes above'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8 pb-8 print:hidden">
          <div className="size-10 mx-auto mb-2 rounded-lg overflow-hidden border border-cyan-500/20 opacity-60">
            <img src="/trustlayer-emblem.jpg" alt="Trust Layer" className="w-full h-full object-cover" />
          </div>
          <p className="text-white/70 mb-1">Happy Eats Franchise Network</p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-cyan-400/70 mb-2">
            <span>dwtl.io</span>
            <span className="text-white/20">•</span>
            <span>tlid.io</span>
          </div>
          <p className="text-[10px]">Powered by <span className="text-cyan-400">trustshield.tech</span></p>
          <p className="text-[10px] text-white/40 mt-1">© 2026 Trust Layer. All rights reserved.</p>
        </div>
      </div>

      {/* Explanation Modals */}
      <Dialog open={showProfitModal} onOpenChange={setShowProfitModal}>
        <DialogContent className="bg-[#0d1f35] border-emerald-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2">
              <DollarSign className="size-5" />
              60/40 → 70/30 Delivery Profit Split
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-white">
              You keep <span className="text-emerald-400 font-bold">60%</span> of Happy Eats delivery profits. At $30K/month, it upgrades to <span className="text-cyan-400 font-bold">70%</span>.
            </p>
            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground mb-2">Example: $1,000 gross delivery revenue</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Gross Revenue</span><span className="text-white">$1,000</span></div>
                <div className="flex justify-between"><span>Costs (driver, fuel, fees)</span><span className="text-red-400">-$450</span></div>
                <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                  <span className="font-medium">Net Profit</span><span className="text-white font-bold">$550</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span className="font-medium">Kathy's 60%</span><span className="font-bold">$330</span>
                </div>
                <div className="flex justify-between text-violet-400">
                  <span className="font-medium">Jason's 40%</span><span className="font-bold">$220</span>
                </div>
              </div>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
              <p className="text-xs font-medium text-cyan-400 mb-1">After $30K/month milestone:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-emerald-400">
                  <span className="font-medium">Kathy's 70%</span><span className="font-bold">$385</span>
                </div>
                <div className="flex justify-between text-violet-400">
                  <span className="font-medium">Jason's 30%</span><span className="font-bold">$165</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Jason's share goes to Dark Wave Studios LLC as franchise fee + royalties for platform development, support, and marketing.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="bg-[#0d1f35] border-violet-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-violet-400 flex items-center gap-2">
              <Users className="size-5" />
              50/50 Food Truck Commissions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-white">
              Food trucks pay <span className="text-violet-400 font-bold">20% per order</span> as a commission. That commission is split <span className="text-violet-400 font-bold">50/50</span> between Kathy and Jason.
            </p>
            <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-500/20">
              <p className="text-xs text-muted-foreground mb-2">Commission Example: 10 trucks, 50 orders/day, $25 avg</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Monthly orders: 1,500</span><span className="text-white">$37,500 food</span></div>
                <div className="flex justify-between"><span>20% truck commission</span><span className="text-white">$5,625/mo</span></div>
                <div className="flex justify-between text-violet-400 border-t border-white/10 pt-1 mt-1">
                  <span className="font-medium">Kathy's 50%</span><span className="font-bold">$2,813/mo</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span className="font-medium">Jason's 50%</span><span className="font-bold">$2,813/mo</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              No monthly subscription fees for food trucks — just 20% per order from day one. Free to join, pay only when we bring you business. Commission split stays 50/50 regardless of milestone.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFoundingModal} onOpenChange={setShowFoundingModal}>
        <DialogContent className="bg-[#0d1f35] border-cyan-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2">
              <Award className="size-5" />
              Founding Partner Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-white">
              As our <span className="text-cyan-400 font-bold">first franchise partner</span>, you get exclusive benefits:
            </p>
            <div className="space-y-2">
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs font-medium text-white mb-1">Better Terms Forever</p>
                <p className="text-xs text-muted-foreground">60/40 start with 70/30 milestone — future franchisees will get worse terms</p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs font-medium text-white mb-1">No Upfront Investment</p>
                <p className="text-xs text-muted-foreground">$0 to start - we grow together with shared risk</p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs font-medium text-white mb-1">Equity-Like Upside</p>
                <p className="text-xs text-muted-foreground">Shape the platform as we scale nationwide</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
    </PageLanguageProvider>
  );
}
