import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook, Instagram, CheckCircle, XCircle, Loader2, Eye, EyeOff,
  Clock, Zap, Settings, ExternalLink, Shield, Wifi, WifiOff,
  X as XIcon, DollarSign, AlertCircle, Plus, Trash2, Video,
  Globe, ChevronDown, ChevronUp, MapPin, Play, Users, Camera,
  Briefcase, Hash, Home
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// PLATFORM REGISTRY — Add any new platform here
// ═══════════════════════════════════════════════════════════════

export interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;       // gradient CSS for card accent
  bgColor: string;     // badge/icon background
  category: "social" | "video" | "local" | "professional" | "other";
  fields: PlatformField[];
  charLimit?: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  requiresImage: boolean;
  apiVersion?: string;
  helpUrl?: string;
  helpText?: string;
}

interface PlatformField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "secret" | "select";
  required: boolean;
  options?: string[];   // for select type
}

export const PLATFORM_REGISTRY: PlatformConfig[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook className="h-5 w-5 text-white" />,
    color: "from-blue-600 to-indigo-600",
    bgColor: "bg-blue-600",
    category: "social",
    charLimit: 63206,
    supportsImages: true,
    supportsVideo: true,
    requiresImage: false,
    apiVersion: "v21.0",
    helpUrl: "https://developers.facebook.com/docs/pages-api/",
    helpText: "Get your Page Access Token from Meta Business Settings → Pages → Your Page → Page Access Token",
    fields: [
      { key: "pageId", label: "Page ID", placeholder: "e.g. 123456789012345", type: "text", required: true },
      { key: "pageName", label: "Page Name", placeholder: "Your Business Page", type: "text", required: false },
      { key: "accessToken", label: "Page Access Token", placeholder: "EAA...", type: "secret", required: true },
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-5 w-5 text-white" />,
    color: "from-purple-600 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-600 to-pink-500",
    category: "social",
    charLimit: 2200,
    supportsImages: true,
    supportsVideo: true,
    requiresImage: true,
    apiVersion: "v21.0",
    helpUrl: "https://developers.facebook.com/docs/instagram-api/",
    helpText: "Uses the same Meta token as Facebook. Get your Instagram Business Account ID from Meta Business Settings.",
    fields: [
      { key: "accountId", label: "Instagram Business Account ID", placeholder: "e.g. 17841405793187218", type: "text", required: true },
      { key: "username", label: "Username", placeholder: "@yourbusiness", type: "text", required: false },
      { key: "accessToken", label: "Access Token", placeholder: "Same as Facebook token (EAA...)", type: "secret", required: true },
    ]
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: <XIcon className="h-5 w-5 text-white" />,
    color: "from-gray-900 to-black",
    bgColor: "bg-black",
    category: "social",
    charLimit: 280,
    supportsImages: true,
    supportsVideo: true,
    requiresImage: false,
    apiVersion: "v2",
    helpUrl: "https://developer.x.com/en/docs",
    helpText: "Create a developer app at developer.x.com. Generate API keys and access tokens with Read and Write permissions.",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Consumer API Key", type: "secret", required: true },
      { key: "apiSecret", label: "API Secret", placeholder: "Consumer API Secret", type: "secret", required: true },
      { key: "accessToken", label: "Access Token", placeholder: "OAuth 1.0a Access Token", type: "secret", required: true },
      { key: "accessTokenSecret", label: "Access Token Secret", placeholder: "OAuth 1.0a Token Secret", type: "secret", required: true },
      { key: "username", label: "Username", placeholder: "@yourbusiness", type: "text", required: false },
    ]
  },
  {
    id: "nextdoor",
    name: "Nextdoor",
    icon: <Home className="h-5 w-5 text-white" />,
    color: "from-green-600 to-emerald-600",
    bgColor: "bg-green-600",
    category: "local",
    charLimit: 10000,
    supportsImages: true,
    supportsVideo: false,
    requiresImage: false,
    helpUrl: "https://developer.nextdoor.com/",
    helpText: "Apply for Nextdoor Business API access. Get your Business Page ID and API token from the developer portal.",
    fields: [
      { key: "businessId", label: "Business Page ID", placeholder: "Your Nextdoor Business ID", type: "text", required: true },
      { key: "accessToken", label: "API Token", placeholder: "Nextdoor API token", type: "secret", required: true },
    ]
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <Play className="h-5 w-5 text-white" />,
    color: "from-red-600 to-rose-600",
    bgColor: "bg-red-600",
    category: "video",
    supportsImages: false,
    supportsVideo: true,
    requiresImage: false,
    helpUrl: "https://developers.google.com/youtube/v3",
    helpText: "Enable YouTube Data API v3 in Google Cloud Console. Create OAuth 2.0 credentials for your channel.",
    fields: [
      { key: "channelId", label: "Channel ID", placeholder: "UC...", type: "text", required: true },
      { key: "accessToken", label: "OAuth Access Token", placeholder: "Google OAuth token", type: "secret", required: true },
      { key: "refreshToken", label: "Refresh Token", placeholder: "For token renewal", type: "secret", required: false },
    ]
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Video className="h-5 w-5 text-white" />,
    color: "from-black to-gray-800",
    bgColor: "bg-black",
    category: "video",
    supportsImages: false,
    supportsVideo: true,
    requiresImage: false,
    helpUrl: "https://developers.tiktok.com/",
    helpText: "Register as a TikTok developer and create an app. Get Content Posting API access for your business account.",
    fields: [
      { key: "openId", label: "Open ID", placeholder: "TikTok Open ID", type: "text", required: true },
      { key: "accessToken", label: "Access Token", placeholder: "TikTok API token", type: "secret", required: true },
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Briefcase className="h-5 w-5 text-white" />,
    color: "from-blue-700 to-blue-800",
    bgColor: "bg-blue-700",
    category: "professional",
    charLimit: 3000,
    supportsImages: true,
    supportsVideo: true,
    requiresImage: false,
    helpUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    helpText: "Create a LinkedIn Developer App. Request Marketing API access for Company Page posting.",
    fields: [
      { key: "organizationId", label: "Organization ID (urn)", placeholder: "urn:li:organization:12345", type: "text", required: true },
      { key: "accessToken", label: "Access Token", placeholder: "LinkedIn OAuth token", type: "secret", required: true },
    ]
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: <MapPin className="h-5 w-5 text-white" />,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500",
    category: "social",
    supportsImages: true,
    supportsVideo: true,
    requiresImage: true,
    helpUrl: "https://developers.pinterest.com/",
    helpText: "Create a Pinterest Developer App. Get an access token with pins:read and pins:write scope.",
    fields: [
      { key: "boardId", label: "Board ID", placeholder: "Target board for pins", type: "text", required: true },
      { key: "accessToken", label: "Access Token", placeholder: "Pinterest API token", type: "secret", required: true },
    ]
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    icon: <Globe className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-green-500",
    bgColor: "bg-blue-500",
    category: "local",
    charLimit: 1500,
    supportsImages: true,
    supportsVideo: false,
    requiresImage: false,
    helpUrl: "https://developers.google.com/my-business/",
    helpText: "Enable Google My Business API. Great for local updates and offers that show up in Google Search and Maps.",
    fields: [
      { key: "locationId", label: "Location ID", placeholder: "accounts/xxx/locations/yyy", type: "text", required: true },
      { key: "accessToken", label: "OAuth Token", placeholder: "Google OAuth token", type: "secret", required: true },
    ]
  },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  social: { label: "Social Media", icon: <Users className="h-3.5 w-3.5" /> },
  video: { label: "Video Platforms", icon: <Video className="h-3.5 w-3.5" /> },
  local: { label: "Local & Neighborhood", icon: <MapPin className="h-3.5 w-3.5" /> },
  professional: { label: "Professional", icon: <Briefcase className="h-3.5 w-3.5" /> },
  other: { label: "Other", icon: <Globe className="h-3.5 w-3.5" /> },
};

// ═══════════════════════════════════════════════════════════════
// STORAGE: Each connected platform is stored as a row in meta_integrations
// or as a JSON blob. For now we use a single JSON approach.
// ═══════════════════════════════════════════════════════════════

export interface ConnectedPlatform {
  platformId: string;
  enabled: boolean;
  credentials: Record<string, string>;
  connectedAt?: string;
  lastPostedAt?: string;
}

interface IntegrationBlob {
  platforms: ConnectedPlatform[];
  adAccountId?: string;
  // Legacy fields for backward compat with existing scheduler
  facebookPageId?: string;
  facebookPageAccessToken?: string;
  facebookPageName?: string;
  facebookConnected?: boolean;
  instagramAccountId?: string;
  instagramConnected?: boolean;
  twitterApiKey?: string;
  twitterApiSecret?: string;
  twitterAccessToken?: string;
  twitterAccessTokenSecret?: string;
  twitterConnected?: boolean;
}

const SCHEDULE_HOURS = [2, 6, 10, 14, 18, 22];

// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1e293b]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function MaskedInput({ value, onChange, placeholder, label }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function PlatformCard({
  config,
  connection,
  onUpdate,
  onRemove,
  onTest,
}: {
  config: PlatformConfig;
  connection: ConnectedPlatform;
  onUpdate: (updated: ConnectedPlatform) => void;
  onRemove: () => void;
  onTest: () => void;
}) {
  const [expanded, setExpanded] = useState(!connection.connectedAt);
  const allRequiredFilled = config.fields
    .filter(f => f.required)
    .every(f => !!connection.credentials[f.key]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${config.color}`} />
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center shadow-lg`}>
                {config.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  {config.name}
                  {config.apiVersion && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-white/15 text-white/40">{config.apiVersion}</Badge>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={`text-[10px] px-1.5 py-0 ${
                    connection.enabled && allRequiredFilled
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-white/40 border-white/10"
                  }`}>
                    {connection.enabled && allRequiredFilled ? "Active" : "Inactive"}
                  </Badge>
                  {config.supportsVideo && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-white/10 text-white/30">
                      <Video className="h-2.5 w-2.5 mr-0.5" /> Video
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch
                checked={connection.enabled}
                onCheckedChange={(checked) => onUpdate({ ...connection, enabled: checked })}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
              </Button>
            </div>
          </div>

          {/* Expanded credentials form */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3 border-t border-white/10 space-y-3">
                  {config.helpText && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-xs text-blue-300/80">
                      💡 {config.helpText}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.fields.map(field => (
                      <div key={field.key} className={field.type === "secret" && config.fields.indexOf(field) === 0 ? "md:col-span-2" : ""}>
                        {field.type === "secret" ? (
                          <MaskedInput
                            value={connection.credentials[field.key] || ""}
                            onChange={(v) => onUpdate({ ...connection, credentials: { ...connection.credentials, [field.key]: v } })}
                            placeholder={field.placeholder}
                            label={`${field.label}${field.required ? " *" : ""}`}
                          />
                        ) : (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-white/60">{field.label}{field.required ? " *" : ""}</Label>
                            <Input
                              value={connection.credentials[field.key] || ""}
                              onChange={(e) => onUpdate({ ...connection, credentials: { ...connection.credentials, [field.key]: e.target.value } })}
                              placeholder={field.placeholder}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {config.id === "facebook" && (
                      <Button size="sm" variant="outline" onClick={onTest} className="text-xs min-h-[36px]">
                        <Wifi className="h-3 w-3 mr-1.5" /> Test Connection
                      </Button>
                    )}
                    {config.helpUrl && (
                      <a href={config.helpUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="text-xs min-h-[36px] text-white/40">
                          <ExternalLink className="h-3 w-3 mr-1.5" /> API Docs
                        </Button>
                      </a>
                    )}
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" onClick={onRemove} className="text-xs min-h-[36px] text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="h-3 w-3 mr-1.5" /> Remove
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN CONNECTIONS TAB
// ═══════════════════════════════════════════════════════════════

export default function ConnectionsTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast();
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [adAccountId, setAdAccountId] = useState("");

  const { data: rawIntegration, isLoading } = useQuery<any>({
    queryKey: ["/api/marketing/integration", tenantId],
    queryFn: () => fetch(`/api/marketing/integration?tenantId=${tenantId}`).then(r => r.json()),
  });

  // Connected platforms state
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([]);

  // Hydrate from server data
  useEffect(() => {
    if (!rawIntegration) return;

    // If we already have the new platforms array, use it
    if (rawIntegration.platforms && Array.isArray(rawIntegration.platforms)) {
      setPlatforms(rawIntegration.platforms);
      setAdAccountId(rawIntegration.adAccountId || "");
      return;
    }

    // Otherwise, migrate from legacy fields
    const migrated: ConnectedPlatform[] = [];
    if (rawIntegration.facebookPageId || rawIntegration.facebookPageAccessToken) {
      migrated.push({
        platformId: "facebook",
        enabled: rawIntegration.facebookConnected || false,
        credentials: {
          pageId: rawIntegration.facebookPageId || "",
          pageName: rawIntegration.facebookPageName || "",
          accessToken: rawIntegration.facebookPageAccessToken || "",
        },
      });
    }
    if (rawIntegration.instagramAccountId) {
      migrated.push({
        platformId: "instagram",
        enabled: rawIntegration.instagramConnected || false,
        credentials: {
          accountId: rawIntegration.instagramAccountId || "",
          username: rawIntegration.instagramUsername || "",
          accessToken: rawIntegration.facebookPageAccessToken || "",
        },
      });
    }
    if (rawIntegration.twitterApiKey) {
      migrated.push({
        platformId: "x",
        enabled: rawIntegration.twitterConnected || false,
        credentials: {
          apiKey: rawIntegration.twitterApiKey || "",
          apiSecret: rawIntegration.twitterApiSecret || "",
          accessToken: rawIntegration.twitterAccessToken || "",
          accessTokenSecret: rawIntegration.twitterAccessTokenSecret || "",
          username: rawIntegration.twitterUsername || "",
        },
      });
    }
    setPlatforms(migrated);
    setAdAccountId(rawIntegration.adAccountId || "");
  }, [rawIntegration]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/integration", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/integration"] });
      toast({ title: "✅ Settings saved", description: "All platform connections updated." });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  });

  const handleSave = () => {
    // Build both new format and legacy fields for backward compatibility with scheduler
    const fbPlatform = platforms.find(p => p.platformId === "facebook");
    const igPlatform = platforms.find(p => p.platformId === "instagram");
    const xPlatform = platforms.find(p => p.platformId === "x");

    saveMutation.mutate({
      tenantId,
      // New universal format
      platforms: JSON.stringify(platforms),
      adAccountId: adAccountId || null,
      // Legacy fields for existing scheduler compatibility
      facebookPageId: fbPlatform?.credentials.pageId || null,
      facebookPageName: fbPlatform?.credentials.pageName || null,
      facebookPageAccessToken: fbPlatform?.credentials.accessToken || null,
      facebookConnected: fbPlatform?.enabled && !!fbPlatform?.credentials.pageId && !!fbPlatform?.credentials.accessToken,
      instagramAccountId: igPlatform?.credentials.accountId || null,
      instagramUsername: igPlatform?.credentials.username || null,
      instagramConnected: igPlatform?.enabled && !!igPlatform?.credentials.accountId,
      twitterApiKey: xPlatform?.credentials.apiKey || null,
      twitterApiSecret: xPlatform?.credentials.apiSecret || null,
      twitterAccessToken: xPlatform?.credentials.accessToken || null,
      twitterAccessTokenSecret: xPlatform?.credentials.accessTokenSecret || null,
      twitterUsername: xPlatform?.credentials.username || null,
      twitterConnected: xPlatform?.enabled && !!xPlatform?.credentials.apiKey,
    });
  };

  const addPlatform = (platformId: string) => {
    if (platforms.find(p => p.platformId === platformId)) {
      toast({ title: "Already added", description: "This platform is already connected.", variant: "destructive" });
      return;
    }
    setPlatforms([...platforms, {
      platformId,
      enabled: false,
      credentials: {},
      connectedAt: new Date().toISOString(),
    }]);
    setShowAddPlatform(false);
  };

  const updatePlatform = (index: number, updated: ConnectedPlatform) => {
    const next = [...platforms];
    next[index] = updated;
    setPlatforms(next);
  };

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const testFacebook = async () => {
    const fb = platforms.find(p => p.platformId === "facebook");
    if (!fb?.credentials.accessToken) {
      toast({ title: "Enter a token first", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=name,id&access_token=${fb.credentials.accessToken}`);
      const data = await res.json();
      if (data.error) {
        toast({ title: "Connection failed", description: data.error.message, variant: "destructive" });
      } else {
        const idx = platforms.findIndex(p => p.platformId === "facebook");
        if (idx >= 0) {
          const updated = { ...platforms[idx], credentials: { ...platforms[idx].credentials, pageName: data.name || "", pageId: data.id || platforms[idx].credentials.pageId } };
          updatePlatform(idx, updated);
        }
        toast({ title: "✅ Connected!", description: `Page: ${data.name} (ID: ${data.id})` });
      }
    } catch {
      toast({ title: "Connection failed", description: "Could not reach Meta API", variant: "destructive" });
    }
  };

  const connectedCount = platforms.filter(p => p.enabled).length;
  const availablePlatforms = PLATFORM_REGISTRY.filter(p => !platforms.find(c => c.platformId === p.id));

  // Schedule info
  const now = new Date();
  const currentHour = now.getHours();
  const nextPostHour = SCHEDULE_HOURS.find(h => h > currentHour) || SCHEDULE_HOURS[0];
  const nextPostTime = new Date(now);
  nextPostTime.setHours(nextPostHour, 0, 0, 0);
  if (nextPostHour <= currentHour) nextPostTime.setDate(nextPostTime.getDate() + 1);
  const minutesUntilNext = Math.round((nextPostTime.getTime() - now.getTime()) / 60000);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" /> Connections & Settings
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {connectedCount} platform{connectedCount !== 1 ? "s" : ""} active · Powered by{" "}
            <a href="https://signalcast.tlid.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              SignalCast <ExternalLink className="inline h-2.5 w-2.5" />
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddPlatform(true)}
            variant="outline"
            className="min-h-[44px] text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Platform
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 min-h-[44px]"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Save All
          </Button>
        </div>
      </div>

      {/* Auto-Post Schedule */}
      <GlassCard className="p-4 md:p-5 border-orange-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Auto-Post Schedule</h3>
              <p className="text-xs text-white/50">6 posts per day on all active platforms</p>
            </div>
          </div>
          <Badge className={connectedCount > 0
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            : "bg-white/10 text-white/40 border-white/10"
          }>
            {connectedCount > 0 ? <><Wifi className="h-3 w-3 mr-1" /> Active</> : <><WifiOff className="h-3 w-3 mr-1" /> Inactive</>}
          </Badge>
        </div>

        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {SCHEDULE_HOURS.map(hour => {
            const isPast = hour <= currentHour;
            const isNext = hour === nextPostHour;
            const label = `${hour > 12 ? hour - 12 : hour || 12}${hour >= 12 ? 'pm' : 'am'}`;
            return (
              <div key={hour} className={`text-center py-2 rounded-lg text-xs font-medium transition-all ${
                isNext ? 'bg-orange-500 text-white ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/30' :
                isPast ? 'bg-white/5 text-white/30 line-through' :
                'bg-white/10 text-white/70'
              }`}>
                {label}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <Zap className="h-3 w-3 text-orange-500" />
          Next post in <span className="text-orange-400 font-medium">{minutesUntilNext} min</span>
          {connectedCount === 0 && <span className="text-red-400 ml-2">· Add a platform to activate</span>}
        </div>
      </GlassCard>

      {/* Connected Platforms */}
      {platforms.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/50 mb-3">No platforms connected yet</p>
          <Button onClick={() => setShowAddPlatform(true)} className="bg-gradient-to-r from-orange-500 to-rose-600">
            <Plus className="h-4 w-4 mr-2" /> Add Your First Platform
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {/* Group by category */}
          {Object.entries(
            platforms.reduce((groups, p) => {
              const config = PLATFORM_REGISTRY.find(r => r.id === p.platformId);
              const cat = config?.category || "other";
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(p);
              return groups;
            }, {} as Record<string, ConnectedPlatform[]>)
          ).map(([category, catPlatforms]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2 mt-1">
                {CATEGORY_LABELS[category]?.icon}
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{CATEGORY_LABELS[category]?.label || category}</span>
              </div>
              <div className="space-y-2">
                {catPlatforms.map(connection => {
                  const config = PLATFORM_REGISTRY.find(r => r.id === connection.platformId);
                  if (!config) return null;
                  const globalIdx = platforms.indexOf(connection);
                  return (
                    <PlatformCard
                      key={connection.platformId}
                      config={config}
                      connection={connection}
                      onUpdate={(updated) => updatePlatform(globalIdx, updated)}
                      onRemove={() => removePlatform(globalIdx)}
                      onTest={connection.platformId === "facebook" ? testFacebook : () => {}}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boost / Ad Account */}
      <GlassCard className="p-4 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-600 to-teal-600 -mt-4 -mx-4 mb-4" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Meta Ads — Boost Posts</h3>
            <p className="text-xs text-white/40">Turn organic posts into paid ads</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/60">Ad Account ID</Label>
            <Input
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              placeholder="act_123456789 (from Meta Business Manager)"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono text-xs"
            />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/50">
              Requires Meta Business Account with <code className="text-amber-400">ads_management</code> permission and active payment method.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* TrustGen Video Studio */}
      <GlassCard className="p-4 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-600 to-purple-600 -mt-4 -mx-4 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">TrustGen Video Studio</h3>
              <p className="text-xs text-white/40">Create and edit ad videos with AI</p>
            </div>
          </div>
          <a href="https://trustgen3d.dwtl.io" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs min-h-[36px]">
              <ExternalLink className="h-3 w-3 mr-1.5" /> Open Studio
            </Button>
          </a>
        </div>
        <p className="text-xs text-white/40 mt-3 ml-12">
          Use TrustGen to create professional video ads, then upload them here for posting to YouTube, TikTok, and Instagram Reels.
          Videos are stored in TrustVault for secure cross-platform distribution.
        </p>
      </GlassCard>

      {/* Add Platform Dialog */}
      <Dialog open={showAddPlatform} onOpenChange={setShowAddPlatform}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-500" /> Add Platform
            </DialogTitle>
            <DialogDescription>Choose a platform to connect to your marketing hub</DialogDescription>
          </DialogHeader>

          {availablePlatforms.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">All available platforms are connected! 🎉</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                availablePlatforms.reduce((groups, p) => {
                  if (!groups[p.category]) groups[p.category] = [];
                  groups[p.category].push(p);
                  return groups;
                }, {} as Record<string, PlatformConfig[]>)
              ).map(([category, plats]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    {CATEGORY_LABELS[category]?.icon} {CATEGORY_LABELS[category]?.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {plats.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addPlatform(p.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg ${p.bgColor} flex items-center justify-center flex-shrink-0`}>
                          {p.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {p.supportsImages && <Badge variant="outline" className="text-[9px] px-1 py-0 border-white/10">IMG</Badge>}
                            {p.supportsVideo && <Badge variant="outline" className="text-[9px] px-1 py-0 border-white/10">VID</Badge>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="text-center py-3 text-xs text-white/30">
        Social media automation powered by{" "}
        <a href="https://signalcast.tlid.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
          SignalCast
        </a>{" "}
        · Video production by{" "}
        <a href="https://trustgen3d.dwtl.io" target="_blank" rel="noopener noreferrer" className="text-purple-400/70 hover:text-purple-400 transition-colors">
          TrustGen
        </a>{" "}
        · Part of the Trust Layer ecosystem
      </div>
    </div>
  );
}
