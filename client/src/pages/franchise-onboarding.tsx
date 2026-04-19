import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, ArrowRight, ArrowLeft, CheckCircle, Rocket,
  MapPin, Palette, Upload, ChefHat, Users, Globe,
  Smartphone, Sparkles, Building2, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";

const STEPS = [
  { id: "territory", label: "Your Territory", icon: MapPin },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "vendors", label: "Vendor Setup", icon: ChefHat },
  { id: "launch", label: "Launch", icon: Rocket },
];

const COLOR_PRESETS = [
  { name: "Sunrise Orange", primary: "#FF7849", secondary: "#F43F5E", gradient: "from-orange-500 to-rose-500" },
  { name: "Ocean Blue", primary: "#06B6D4", secondary: "#3B82F6", gradient: "from-cyan-500 to-blue-500" },
  { name: "Emerald Green", primary: "#10B981", secondary: "#14B8A6", gradient: "from-emerald-500 to-teal-500" },
  { name: "Royal Purple", primary: "#8B5CF6", secondary: "#A855F7", gradient: "from-violet-500 to-purple-500" },
  { name: "Hot Pink", primary: "#EC4899", secondary: "#F43F5E", gradient: "from-pink-500 to-rose-500" },
  { name: "Golden", primary: "#F59E0B", secondary: "#EF4444", gradient: "from-amber-500 to-red-500" },
];

export default function FranchiseOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();
  const [config, setConfig] = useState({
    businessName: "",
    city: "",
    state: "",
    zipCode: "",
    territory: "",
    selectedColor: 0,
    customDomain: "",
    logo: null as File | null,
    logoPreview: "",
    vendorCount: "5-10",
    vendorTypes: [] as string[],
    launchDate: "",
  });

  const stepLabels = [t("franchise.onboarding.yourTerritory"), t("franchise.onboarding.branding"), t("franchise.onboarding.vendorSetup"), t("franchise.onboarding.launch")];

  const vendorTypeOptions = [
    "Food Trucks", "BBQ Vendors", "Mexican/Latin", "Asian Fusion",
    "Seafood", "Burgers & Fries", "Healthy/Vegan", "Desserts & Coffee",
    "Pizza", "Soul Food", "Mediterranean", "Sandwiches & Wraps",
  ];

  const toggleVendorType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      vendorTypes: prev.vendorTypes.includes(type)
        ? prev.vendorTypes.filter(t => t !== type)
        : [...prev.vendorTypes, type],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return config.businessName && config.city && config.state;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const selectedPreset = COLOR_PRESETS[config.selectedColor];

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-[#060a14]">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060a14]/90 backdrop-blur-2xl border-b border-white/[0.06] px-4 md:px-8 flex items-center justify-between">
        <Link href="/franchise" className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Shield className="size-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-tight">
              Franchise<span className="text-cyan-400">Setup</span>
            </span>
            <span className="text-[10px] text-slate-500 leading-none">{t("franchise.onboarding.onboardingWizard")}</span>
          </div>
        </Link>
        <Link href="/franchise">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs" data-testid="button-back-franchise">
            <ArrowLeft className="size-3 mr-1" /> {t("franchise.onboarding.backToFranchise")}
          </Button>
        </Link>
      </nav>

      <div className="sticky top-14 z-40 px-4 py-2 bg-[#0d1f35]/90 backdrop-blur-xl border-b border-white/5">
        <PageLanguageToggle />
      </div>

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`size-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    i <= currentStep
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/[0.05] border border-white/[0.08]'
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle className="size-6 text-white" />
                  ) : (
                    <step.icon className={`size-5 ${i <= currentStep ? 'text-white' : 'text-slate-600'}`} />
                  )}
                </div>
                <span className={`text-[10px] mt-2 ${i <= currentStep ? 'text-cyan-300' : 'text-slate-600'}`}>
                  {stepLabels[i]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mt-[-16px] ${i < currentStep ? 'bg-cyan-500/40' : 'bg-white/[0.06]'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <MapPin className="size-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t("franchise.onboarding.defineTerritory")}</h2>
                      <p className="text-sm text-slate-500">{t("franchise.onboarding.defineTerritoryDesc")}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">{t("franchise.onboarding.businessName")} *</Label>
                      <Input
                        value={config.businessName}
                        onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                        placeholder="e.g. Memphis Eats, ATL Driver Connect"
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                        data-testid="input-business-name"
                      />
                      <p className="text-[11px] text-slate-600">{t("franchise.onboarding.appNameBranding")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">{t("franchise.onboarding.city")}</Label>
                        <Input
                          value={config.city}
                          onChange={(e) => setConfig({ ...config, city: e.target.value })}
                          placeholder="Nashville"
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                          data-testid="input-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">{t("franchise.onboarding.state")}</Label>
                        <Input
                          value={config.state}
                          onChange={(e) => setConfig({ ...config, state: e.target.value })}
                          placeholder="TN"
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                          data-testid="input-state"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">{t("franchise.onboarding.zipCode")}</Label>
                        <Input
                          value={config.zipCode}
                          onChange={(e) => setConfig({ ...config, zipCode: e.target.value })}
                          placeholder="37201"
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                          data-testid="input-zip"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">{t("franchise.onboarding.territoryDescription")}</Label>
                      <Input
                        value={config.territory}
                        onChange={(e) => setConfig({ ...config, territory: e.target.value })}
                        placeholder="e.g. Greater Nashville area, including Brentwood and Franklin"
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                        data-testid="input-territory"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/10">
                      <p className="text-xs text-cyan-300 flex items-center gap-2">
                        <Sparkles className="size-3" />
                        {t("franchise.onboarding.exclusiveNote")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Palette className="size-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t("franchise.onboarding.brandYourApp")}</h2>
                      <p className="text-sm text-slate-500">{t("franchise.onboarding.brandDesc")}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-white text-sm font-medium mb-3 block">{t("franchise.onboarding.chooseColorTheme")}</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {COLOR_PRESETS.map((preset, i) => (
                          <button
                            key={preset.name}
                            onClick={() => setConfig({ ...config, selectedColor: i })}
                            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                              config.selectedColor === i
                                ? 'border-cyan-500/50 bg-white/[0.06] ring-1 ring-cyan-500/30'
                                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                            }`}
                            data-testid={`button-color-${i}`}
                          >
                            <div className={`h-3 rounded-full bg-gradient-to-r ${preset.gradient} mb-2`} />
                            <p className="text-sm font-medium text-white">{preset.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">{t("franchise.onboarding.customDomain")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={config.customDomain}
                          onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                          placeholder="yourbrand"
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-slate-600"
                          data-testid="input-domain"
                        />
                        <span className="text-slate-400 text-sm whitespace-nowrap">.app</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{t("franchise.onboarding.domainNote")}</p>
                    </div>

                    <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">{t("franchise.onboarding.preview")}</p>
                      <div className="rounded-xl overflow-hidden bg-[#0a0f1e] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`size-8 rounded-lg bg-gradient-to-br ${selectedPreset.gradient} flex items-center justify-center`}>
                            <Smartphone className="size-4 text-white" />
                          </div>
                          <span className="font-bold text-white text-sm">
                            {config.businessName || t("franchise.onboarding.yourBrand")}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full bg-gradient-to-r ${selectedPreset.gradient} w-3/4 mb-2`} />
                        <div className="h-2 rounded-full bg-white/10 w-1/2 mb-3" />
                        <div className={`py-2 px-4 rounded-lg bg-gradient-to-r ${selectedPreset.gradient} inline-flex items-center gap-1`}>
                          <span className="text-xs text-white font-medium">{t("common.orderNow")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <ChefHat className="size-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{t("franchise.onboarding.vendorNetwork")}</h2>
                      <p className="text-sm text-slate-500">{t("franchise.onboarding.vendorNetworkDesc")}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-white text-sm font-medium mb-3 block">{t("franchise.onboarding.howManyVendors")}</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {["1-4", "5-10", "11-20", "20+"].map((range) => (
                          <button
                            key={range}
                            onClick={() => setConfig({ ...config, vendorCount: range })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              config.vendorCount === range
                                ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/10'
                            }`}
                            data-testid={`button-vendor-count-${range}`}
                          >
                            <span className="text-lg font-bold block">{range}</span>
                            <span className="text-[10px]">{t("franchise.onboarding.vendorsLabel")}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-sm font-medium mb-3 block">{t("franchise.onboarding.vendorTypesQuestion")}</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {vendorTypeOptions.map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleVendorType(type)}
                            className={`p-3 rounded-xl border text-left text-sm transition-all ${
                              config.vendorTypes.includes(type)
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/10'
                            }`}
                            data-testid={`button-vendor-type-${type}`}
                          >
                            <div className="flex items-center gap-2">
                              {config.vendorTypes.includes(type) && <CheckCircle className="size-3 shrink-0" />}
                              <span>{type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/10">
                      <p className="text-xs text-orange-300 flex items-center gap-2">
                        <Users className="size-3" />
                        {t("franchise.onboarding.recruitNote")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-6 md:p-10">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <div className="size-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                        <Rocket className="size-10 text-white" />
                      </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-3">{t("franchise.onboarding.readyToLaunch")}</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                      {t("franchise.onboarding.launchDesc")}
                    </p>

                    <div className="max-w-md mx-auto space-y-3 text-left mb-8">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-slate-400">{t("franchise.onboarding.businessName")}</span>
                        <span className="text-sm text-white font-medium">{config.businessName || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-slate-400">{t("franchise.onboarding.territory")}</span>
                        <span className="text-sm text-white font-medium">{config.city}, {config.state}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-slate-400">{t("franchise.onboarding.colorTheme")}</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-12 rounded-full bg-gradient-to-r ${selectedPreset.gradient}`} />
                          <span className="text-sm text-white">{selectedPreset.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-slate-400">{t("franchise.onboarding.domain")}</span>
                        <span className="text-sm text-cyan-400">{config.customDomain || config.businessName?.toLowerCase().replace(/\s+/g, '')}.app</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-slate-400">{t("franchise.onboarding.plannedVendors")}</span>
                        <span className="text-sm text-white font-medium">{config.vendorCount}</span>
                      </div>
                      {config.vendorTypes.length > 0 && (
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <span className="text-sm text-slate-400 block mb-2">{t("franchise.onboarding.vendorTypes")}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {config.vendorTypes.map(vt => (
                              <Badge key={vt} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">{vt}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a href="/franchise#contact">
                        <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 shadow-lg shadow-cyan-500/20 w-full sm:w-auto" data-testid="button-submit-onboarding">
                          <Rocket className="size-5 mr-2" /> {t("franchise.onboarding.submitLaunch")}
                        </Button>
                      </a>
                      <Link href="/demo">
                        <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto" data-testid="button-preview-demo">
                          <Smartphone className="size-5 mr-2" /> {t("franchise.onboarding.previewDemo")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="text-slate-400 hover:text-white"
            data-testid="button-prev-step"
          >
            <ArrowLeft className="size-4 mr-2" /> {t("common.back")}
          </Button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`size-2 rounded-full transition-all ${i === currentStep ? 'bg-cyan-400 w-6' : i < currentStep ? 'bg-cyan-500/40' : 'bg-white/10'}`} />
            ))}
          </div>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20"
              data-testid="button-next-step"
            >
              {t("common.next")} <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
    </PageLanguageProvider>
  );
}