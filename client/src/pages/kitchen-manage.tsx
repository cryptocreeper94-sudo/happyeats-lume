import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Plus, Pencil, Trash2, Flame, Snowflake,
  Check, X, Save, Eye, EyeOff, GripVertical,
  Utensils, Lock, ChefHat, DollarSign, Tag, Image,
  LayoutGrid, List, BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

interface KitchenItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  section: string;
  imageUrl: string | null;
  isAvailable: boolean | null;
  sortOrder: number | null;
  tags: string[] | null;
}

const CATEGORIES_HOT = ["Sandwiches", "Bowls", "Plates", "Soups", "Sides"];
const CATEGORIES_COLD = ["Wraps", "Salads", "Sandwiches", "Snacks", "Drinks"];
const ALL_CATEGORIES = Array.from(new Set([...CATEGORIES_HOT, ...CATEGORIES_COLD]));

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Sandwiches",
  section: "hot" as "hot" | "cold",
  imageUrl: "",
  isAvailable: true,
  sortOrder: 0,
  tags: [] as string[],
};

export default function KitchenManage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [pinInput, setPinInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authPin, setAuthPin] = useState("");
  const [editingItem, setEditingItem] = useState<KitchenItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterSection, setFilterSection] = useState<"all" | "hot" | "cold">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: items, isLoading } = useQuery<KitchenItem[]>({
    queryKey: ["kitchen-items"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen-items");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: authenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const res = await fetch("/api/kitchen-items", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-kitchen-pin": authPin },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-items"] });
      toast({ title: t('kitchen.itemCreated'), description: t('kitchen.newMenuItemAdded') });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof emptyForm> }) => {
      const res = await fetch(`/api/kitchen-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-kitchen-pin": authPin },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-items"] });
      toast({ title: t('kitchen.itemUpdated') });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/kitchen-items/${id}`, { method: "DELETE", headers: { "x-kitchen-pin": authPin } });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-items"] });
      toast({ title: t('kitchen.itemDeleted') });
      setDeleteConfirm(null);
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: number; isAvailable: boolean }) => {
      const res = await fetch(`/api/kitchen-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-kitchen-pin": authPin },
        body: JSON.stringify({ isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-items"] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setShowForm(false);
    setTagInput("");
  };

  const openEdit = (item: KitchenItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      section: item.section as "hot" | "cold",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable !== false,
      sortOrder: item.sortOrder || 0,
      tags: item.tags || [],
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) {
      toast({ title: t('kitchen.missingFields'), description: t('kitchen.nameAndPriceRequired'), variant: "destructive" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tg => tg !== tag) }));
  };

  const handlePinSubmit = async () => {
    try {
      const res = await fetch("/api/tenants/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      if (res.ok) {
        setAuthPin(pinInput);
        setAuthenticated(true);
      } else {
        toast({ title: t('kitchen.invalidPin'), variant: "destructive" });
      }
    } catch {
      toast({ title: t('kitchen.invalidPin'), variant: "destructive" });
    }
  };

  const filtered = items?.filter(i =>
    filterSection === "all" || i.section === filterSection
  ) || [];

  const hotCount = items?.filter(i => i.section === "hot").length || 0;
  const coldCount = items?.filter(i => i.section === "cold").length || 0;
  const availableCount = items?.filter(i => i.isAvailable).length || 0;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1d32] to-[#0a1628] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`${GLASS_CARD} w-full max-w-sm`}>
            <CardContent className="p-8 text-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 w-fit mx-auto mb-4">
                <Lock className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{t('kitchen.manager')}</h2>
              <p className="text-white/40 text-sm mb-6">{t('kitchen.enterOwnerPin')}</p>
              <Input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                placeholder={t('kitchen.enterFourDigitPin')}
                className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-[0.5em] h-14 mb-4"
                data-testid="input-kitchen-pin"
              />
              <Button
                onClick={handlePinSubmit}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
                data-testid="button-kitchen-login"
              >
                {t('kitchen.accessManager')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1d32] to-[#0a1628]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/kitchen">
              <Button variant="ghost" className="text-white/70 hover:text-white -ml-2" data-testid="button-back-kitchen">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('kitchen.kitchenMenu')}
              </Button>
            </Link>
          </div>
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            data-testid="button-add-item"
          >
            <Plus className="w-4 h-4 mr-2" /> {t('kitchen.addItem')}
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30">
              <ChefHat className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('kitchen.manager')}</h1>
              <p className="text-white/40 text-sm">{t('kitchen.managerSubtitle')}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className={`${GLASS_CARD}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{hotCount}</p>
                <p className="text-white/40 text-xs">{t('kitchen.hotItems')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`${GLASS_CARD}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10">
                <Snowflake className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{coldCount}</p>
                <p className="text-white/40 text-xs">{t('kitchen.coldItems')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`${GLASS_CARD}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{availableCount}</p>
                <p className="text-white/40 text-xs">{t('kitchen.available')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: t('common.all'), icon: Utensils },
              { key: "hot", label: t('kitchen.hotSide'), icon: Flame },
              { key: "cold", label: t('kitchen.coldSide'), icon: Snowflake },
            ].map(({ key, label, icon: FIcon }) => (
              <Button
                key={key}
                size="sm"
                variant={filterSection === key ? "default" : "ghost"}
                onClick={() => setFilterSection(key as "all" | "hot" | "cold")}
                className={filterSection === key
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-white/40 hover:text-white"
                }
                data-testid={`button-manage-filter-${key}`}
              >
                <FIcon className="w-3.5 h-3.5 mr-1.5" /> {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm" variant="ghost"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "text-orange-400" : "text-white/30"}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "text-orange-400" : "text-white/30"}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`${GLASS_CARD} overflow-hidden group ${!item.isAvailable ? "opacity-50" : ""}`}>
                  {item.imageUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover brightness-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-transparent to-transparent" />
                      <Badge className={`absolute top-2 left-2 ${item.section === "hot" ? "bg-orange-500/90" : "bg-cyan-500/90"} text-white border-0 text-xs`}>
                        {item.section === "hot" ? <Flame className="w-3 h-3 mr-1" /> : <Snowflake className="w-3 h-3 mr-1" />}
                        {item.section === "hot" ? t('kitchen.hotSide') : t('kitchen.coldSide')}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-white text-sm leading-tight">{item.name}</h4>
                      <span className="text-orange-400 font-bold text-sm">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-2">{item.category}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={item.isAvailable !== false}
                          onCheckedChange={(checked) => toggleAvailability.mutate({ id: item.id, isAvailable: checked })}
                          className="scale-75"
                          data-testid={`switch-available-${item.id}`}
                        />
                        <span className="text-white/40 text-xs">{item.isAvailable ? t('kitchen.available') : t('kitchen.hidden')}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="h-7 w-7 p-0 text-white/30 hover:text-white" data-testid={`button-edit-${item.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(item.id)} className="h-7 w-7 p-0 text-white/30 hover:text-red-400" data-testid={`button-delete-${item.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className={`${GLASS_CARD} ${!item.isAvailable ? "opacity-50" : ""}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover brightness-110" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                        <Badge className={`${item.section === "hot" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"} border text-[10px] shrink-0`}>
                          {item.section}
                        </Badge>
                      </div>
                      <p className="text-white/40 text-xs">{item.category}</p>
                    </div>
                    <span className="text-orange-400 font-bold text-sm">${parseFloat(item.price).toFixed(2)}</span>
                    <Switch
                      checked={item.isAvailable !== false}
                      onCheckedChange={(checked) => toggleAvailability.mutate({ id: item.id, isAvailable: checked })}
                      className="scale-75"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="h-7 w-7 p-0 text-white/30 hover:text-white">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(item.id)} className="h-7 w-7 p-0 text-white/30 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <Card className={`${GLASS_CARD} mt-8`}>
            <CardContent className="p-12 text-center">
              <Utensils className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40">{t('kitchen.noItemsYet')}</p>
              <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Plus className="w-4 h-4 mr-2" /> {t('kitchen.addFirstItem')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="bg-[#0d1f35] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem ? <Pencil className="w-5 h-5 text-orange-400" /> : <Plus className="w-5 h-5 text-orange-400" />}
              {editingItem ? t('kitchen.editItem') : t('kitchen.newMenuItem')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-1 block">{t('kitchen.nameLabel')}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder="Smoked Pulled Pork Sandwich"
                data-testid="input-item-name"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">{t('kitchen.descriptionLabel')}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="bg-white/5 border-white/10 min-h-[80px]"
                placeholder="Slow-smoked 12-hour pulled pork with tangy Carolina slaw..."
                data-testid="input-item-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('kitchen.priceLabel')}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                  className="bg-white/5 border-white/10"
                  placeholder="9.99"
                  data-testid="input-item-price"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('kitchen.sortOrderLabel')}</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="bg-white/5 border-white/10"
                  data-testid="input-item-sort"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('kitchen.sectionLabel')}</label>
                <Select value={form.section} onValueChange={(v) => setForm(p => ({ ...p, section: v as "hot" | "cold" }))}>
                  <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-section">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#162840] border-white/10">
                    <SelectItem value="hot"><span className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-orange-400" /> {t('kitchen.hotSide')}</span></SelectItem>
                    <SelectItem value="cold"><span className="flex items-center gap-2"><Snowflake className="w-3.5 h-3.5 text-cyan-400" /> {t('kitchen.coldSide')}</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('kitchen.categoryLabel')}</label>
                <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#162840] border-white/10">
                    {ALL_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">{t('kitchen.imageUrlLabel')}</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder="https://images.unsplash.com/..."
                data-testid="input-item-image"
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg mt-2 brightness-110" />
              )}
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">{t('kitchen.tagsLabel')}</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="bg-white/5 border-white/10 flex-1"
                  placeholder="popular, spicy, healthy..."
                  data-testid="input-item-tag"
                />
                <Button onClick={addTag} size="sm" variant="ghost" className="text-orange-400">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map(tag => (
                    <Badge key={tag} className="bg-white/5 text-white/60 border-white/10 border text-xs cursor-pointer hover:bg-red-500/20 hover:text-red-400" onClick={() => removeTag(tag)}>
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(checked) => setForm(p => ({ ...p, isAvailable: checked }))}
                data-testid="switch-form-available"
              />
              <span className="text-white/60 text-sm">{form.isAvailable ? t('kitchen.visibleOnMenu') : t('kitchen.hiddenFromMenu')}</span>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={resetForm} className="text-white/40">{t('common.cancel')}</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
              data-testid="button-save-item"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingItem ? t('kitchen.updateItem') : t('kitchen.addItem')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0d1f35] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" /> {t('kitchen.deleteItem')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/60 text-sm">{t('kitchen.deleteConfirm')}</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-white/40">{t('common.cancel')}</Button>
            <Button
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
              className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              data-testid="button-confirm-delete"
            >
              {t('kitchen.deleteItem')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
