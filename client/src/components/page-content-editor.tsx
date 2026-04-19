import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Sparkles, Camera, Megaphone, Save, Loader2, Trash2,
  DollarSign, X, ImagePlus, ChevronDown, ChevronUp, Eye, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { VendorPageContent } from "@shared/schema";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

interface PageContentEditorProps {
  vendorId: number;
  vendorSlug: string | null;
  vendorPin: string;
  initialContent?: VendorPageContent | null;
  onUpdated?: (content: VendorPageContent) => void;
}

export default function PageContentEditor({ vendorId, vendorSlug, vendorPin, initialContent, onUpdated }: PageContentEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [missionStatement, setMissionStatement] = useState(initialContent?.missionStatement || "");
  const [announcement, setAnnouncement] = useState(initialContent?.announcement || "");
  const [specialTitle, setSpecialTitle] = useState(initialContent?.dailySpecial?.title || "");
  const [specialDesc, setSpecialDesc] = useState(initialContent?.dailySpecial?.description || "");
  const [specialPrice, setSpecialPrice] = useState(initialContent?.dailySpecial?.price?.toString() || "");
  const [photos, setPhotos] = useState<string[]>(initialContent?.photoAlbum || []);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (content: Partial<VendorPageContent>) => {
      const res = await fetch(`/api/food-trucks/${vendorId}/page-content`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-kitchen-pin": vendorPin,
        },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "✅ Page updated!" });
      onUpdated?.(data.pageContent);
    },
    onError: (err: Error) => {
      toast({ title: err.message || "Failed to save", variant: "destructive" });
    },
  });

  const saveMission = () => saveMutation.mutate({ missionStatement: missionStatement || undefined });
  const saveAnnouncement = () => saveMutation.mutate({ announcement: announcement || undefined });
  const saveSpecial = () => {
    if (!specialTitle) {
      saveMutation.mutate({ dailySpecial: null });
    } else {
      saveMutation.mutate({
        dailySpecial: {
          title: specialTitle,
          description: specialDesc,
          price: specialPrice ? parseFloat(specialPrice) : undefined,
        },
      });
    }
  };
  const savePhotos = () => saveMutation.mutate({ photoAlbum: photos });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || photos.length >= 6) return;

    Array.from(files).slice(0, 6 - photos.length).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Photo must be under 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const pageUrl = vendorSlug ? `${window.location.origin}/v/${vendorSlug}` : null;

  return (
    <Card className={`${GLASS_CARD} border-violet-500/20`}>
      <CardContent className="p-4">
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between touch-manipulation"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/20">
              <Sparkles className="size-5 text-violet-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">Customize Your Page</h3>
              <p className="text-[10px] text-white/40">Mission · Daily Special · Photos · Announcements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pageUrl && (
              <Link href={`/v/${vendorSlug}`}>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] gap-1">
                  <Eye className="size-2.5" /> View Page
                </Badge>
              </Link>
            )}
            {expanded ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Separator className="bg-white/10 my-4" />

              <div className="space-y-3">
                {/* ──── Mission Statement ──── */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setActiveSection(activeSection === "mission" ? null : "mission")}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-sky-400" />
                      <span className="text-xs font-semibold text-white">Mission Statement</span>
                      {missionStatement && <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/20 text-[8px]">Set</Badge>}
                    </div>
                    {activeSection === "mission" ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </button>
                  <AnimatePresence>
                    {activeSection === "mission" && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-2">
                          <Textarea
                            value={missionStatement}
                            onChange={e => setMissionStatement(e.target.value)}
                            placeholder="Tell customers about your story, what you stand for, and what makes your food special..."
                            className="min-h-[80px] text-xs bg-white/5 border-white/10 resize-none"
                            maxLength={1000}
                            data-testid="textarea-mission"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-white/20">{missionStatement.length}/1000</span>
                            <Button
                              size="sm"
                              onClick={saveMission}
                              disabled={saveMutation.isPending}
                              className="h-7 px-3 text-[10px] bg-sky-600 hover:bg-sky-700"
                              data-testid="button-save-mission"
                            >
                              {saveMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <><Save className="size-3 mr-1" /> Save</>}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ──── Daily Special ──── */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setActiveSection(activeSection === "special" ? null : "special")}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-orange-400" />
                      <span className="text-xs font-semibold text-white">Daily Special</span>
                      {specialTitle && <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/20 text-[8px]">Active</Badge>}
                    </div>
                    {activeSection === "special" ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </button>
                  <AnimatePresence>
                    {activeSection === "special" && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-2">
                          <Input
                            value={specialTitle}
                            onChange={e => setSpecialTitle(e.target.value)}
                            placeholder="Today's special name (e.g. 'BBQ Pulled Pork Sandwich')"
                            className="h-8 text-xs bg-white/5 border-white/10"
                            maxLength={100}
                            data-testid="input-special-title"
                          />
                          <Textarea
                            value={specialDesc}
                            onChange={e => setSpecialDesc(e.target.value)}
                            placeholder="Describe your special (optional)..."
                            className="min-h-[50px] text-xs bg-white/5 border-white/10 resize-none"
                            maxLength={500}
                            data-testid="textarea-special-desc"
                          />
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <DollarSign className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
                              <Input
                                type="number"
                                step="0.01"
                                value={specialPrice}
                                onChange={e => setSpecialPrice(e.target.value)}
                                placeholder="Price (optional)"
                                className="h-8 text-xs bg-white/5 border-white/10 pl-6"
                                data-testid="input-special-price"
                              />
                            </div>
                            {specialTitle && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setSpecialTitle(""); setSpecialDesc(""); setSpecialPrice(""); saveSpecial(); }}
                                className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[10px]"
                              >
                                <Trash2 className="size-3 mr-1" /> Clear
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={saveSpecial}
                              disabled={saveMutation.isPending}
                              className="h-7 px-3 text-[10px] bg-orange-600 hover:bg-orange-700"
                              data-testid="button-save-special"
                            >
                              {saveMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <><Save className="size-3 mr-1" /> Save</>}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ──── Photo Album ──── */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setActiveSection(activeSection === "photos" ? null : "photos")}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="size-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">Photo Gallery</span>
                      {photos.length > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/20 text-[8px]">{photos.length}/6</Badge>
                      )}
                    </div>
                    {activeSection === "photos" ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </button>
                  <AnimatePresence>
                    {activeSection === "photos" && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            {photos.map((photo, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removePhoto(idx)}
                                  className="absolute top-1 right-1 size-6 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="size-3 text-white" />
                                </button>
                              </div>
                            ))}
                            {photos.length < 6 && (
                              <label className="aspect-square rounded-lg border-2 border-dashed border-white/15 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                                <ImagePlus className="size-5 text-white/20 mb-1" />
                                <span className="text-[9px] text-white/30">Add Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={handlePhotoUpload}
                                  data-testid="input-photo-upload"
                                />
                              </label>
                            )}
                          </div>
                          <p className="text-[9px] text-white/20">Up to 6 photos · Max 2MB each · JPG, PNG, or WebP</p>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={savePhotos}
                              disabled={saveMutation.isPending}
                              className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                              data-testid="button-save-photos"
                            >
                              {saveMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <><Save className="size-3 mr-1" /> Save Photos</>}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ──── Announcement Banner ──── */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setActiveSection(activeSection === "announce" ? null : "announce")}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <Megaphone className="size-4 text-rose-400" />
                      <span className="text-xs font-semibold text-white">Announcement</span>
                      {announcement && <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/20 text-[8px]">Live</Badge>}
                    </div>
                    {activeSection === "announce" ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </button>
                  <AnimatePresence>
                    {activeSection === "announce" && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-2">
                          <Input
                            value={announcement}
                            onChange={e => setAnnouncement(e.target.value)}
                            placeholder="Short announcement (e.g. 'Closed for holiday' or 'New menu item!')"
                            className="h-8 text-xs bg-white/5 border-white/10"
                            maxLength={280}
                            data-testid="input-announcement"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-white/20">{announcement.length}/280</span>
                            <div className="flex gap-1.5">
                              {announcement && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setAnnouncement(""); saveMutation.mutate({ announcement: "" }); }}
                                  className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[10px]"
                                >
                                  <Trash2 className="size-3 mr-1" /> Clear
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={saveAnnouncement}
                                disabled={saveMutation.isPending}
                                className="h-7 px-3 text-[10px] bg-rose-600 hover:bg-rose-700"
                                data-testid="button-save-announcement"
                              >
                                {saveMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <><Save className="size-3 mr-1" /> Save</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content policy note */}
                <div className="flex items-start gap-2 px-2 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <AlertCircle className="size-3 text-amber-400/60 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-amber-300/40 leading-relaxed">
                    All content is reviewed. Inappropriate language, spam, or harmful content will be automatically rejected.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
