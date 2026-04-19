import { Link, useLocation } from "wouter";
import { Utensils, ShoppingBag, MapPin, Menu, FileText, Shield, Users, Navigation, Search, Rocket, Home, Truck, Car, Store, BookOpen, Globe, Heart, LogIn, LogOut, Bug, ShoppingCart, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlobalSearch } from "@/components/global-search";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { ContactGate } from "@/components/beta-banner";

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [bugReportMode, setBugReportMode] = useState<"text" | "email" | null>(null);
  const { lang, setLang, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const hasSeenGreeting = sessionStorage.getItem("happy-eats-greeted");
    if (!hasSeenGreeting) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        sessionStorage.setItem("happy-eats-greeted", "true");
        setTimeout(() => setShowGreeting(false), 4000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleGps = () => {
    if (!gpsEnabled) {
      if (!navigator.geolocation) {
        alert("GPS is not supported on this device");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsEnabled(true);
          console.log("GPS enabled:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert(lang === "es" ? "Acceso a ubicación denegado. Por favor habilítalo en la configuración de tu navegador." : "Location access was denied. Please enable it in your browser settings to use GPS features.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert(lang === "es" ? "Información de ubicación no disponible. Por favor intenta de nuevo." : "Location information is unavailable. Please try again.");
          } else {
            alert(lang === "es" ? "No se pudo obtener tu ubicación. Por favor revisa la configuración de tu dispositivo." : "Unable to get your location. Please check your device settings.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsEnabled(false);
    }
  };

  const userPaths = [
    { icon: Home, label: t("nav.mainMenu"), path: "/", description: t("nav.returnToLanding") },
    { icon: Truck, label: t("nav.commercialDriver"), path: "/driver", description: t("nav.commercialDriverDesc") },
    { icon: Car, label: t("nav.everydayDriver"), path: "/everyday", description: t("nav.everydayDriverDesc") },
    { icon: Store, label: t("nav.foodTruckSignup"), path: "/vendor-portal", description: t("nav.foodTruckSignupDesc") },
  ];

  const navItems = [
    { icon: Utensils, label: t("nav.dashboard"), path: "/driver" },
    { icon: ShoppingBag, label: t("nav.vendors"), path: "/vendors" },
    { icon: Navigation, label: t("nav.findNearby"), path: "/concierge" },
    { icon: MapPin, label: t("nav.tracking"), path: "/tracking" },
  ];

  const legalItems = [
    { icon: BookOpen, label: t("footer.about"), path: "/blog" },
    { icon: Shield, label: t("nav.privacyPolicy"), path: "/privacy" },
    { icon: FileText, label: t("nav.termsOfService"), path: "/terms" },
    { icon: Rocket, label: t("nav.roadmap"), path: "/roadmap" },
  ];


  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 safe-top glass-panel border-b border-white/10 px-3 sm:px-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
        <div className="size-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg">
          <span className="text-lg">😋</span>
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-white">
          Happy<span className="text-orange-400">Eats</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          data-testid="button-ai-assistant"
          className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:bg-white/5 transition-all relative"
          onClick={() => setAiChatOpen(true)}
        >
          <span className="text-lg leading-none">😊</span>
          <span className="hidden sm:inline">AI</span>
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
        </button>

        <Link href={`/guide?role=${user?.role || 'customer'}`}>
          <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
            <Volume2 className="size-3.5" />
            <span>Audio Guide</span>
          </button>
        </Link>

        <Button 
          data-testid="button-global-search" 
          variant="ghost" 
          size="icon" 
          className="text-foreground size-9"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-5" />
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button data-testid="button-menu" variant="ghost" size="icon" className="text-foreground size-9">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-l-white/10 text-foreground w-[280px] p-4">
            <div className="flex flex-col gap-1 mt-4">
              <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Heart className="size-3.5 text-orange-300 fill-orange-300" />
                  <span className="text-xs font-bold text-orange-300">{lang === "es" ? "Nuestra Misión" : "Our Mission"}</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {lang === "es"
                    ? "Creemos que cada conductor merece una gran comida y un servicio de primera, sin importar a dónde los lleve el camino. Happy Eats te conecta directamente con increíbles food trucks y vendedores locales — llevando comida fresca y deliciosa y servicios confiables directamente a tu puerta, tu parada de camiones o tu almacén. Estamos aquí para hacer la vida en el camino un poco más brillante, una comida a la vez."
                    : "We believe every driver deserves a great meal and top-notch service, no matter where the road takes them. Happy Eats connects you directly with amazing local food trucks and vendors — bringing fresh, delicious food and trusted driver services right to your door, your truck stop, or your warehouse. We're here to make life on the road a little brighter, one meal at a time."}
                </p>
                <p className="text-[10px] text-white/30 mt-2">Est. 2025 | Nashville, TN</p>
              </div>

              <div className="flex items-center justify-between px-2 py-2 rounded-md bg-white/5 mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-orange-400" />
                  <span className="text-sm text-foreground">{t("nav.language")}</span>
                </div>
                <button 
                  data-testid="button-lang-toggle-menu"
                  onClick={() => setLang(lang === "en" ? "es" : "en")}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                >
                  {lang === "en" ? "🇺🇸 EN → 🇲🇽 ES" : "🇲🇽 ES → 🇺🇸 EN"}
                </button>
              </div>

              <div className="flex items-center justify-between px-2 py-2 rounded-md bg-white/5 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className={`size-4 ${gpsEnabled ? 'text-emerald-400 fill-emerald-400' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-foreground">{t("nav.gpsLocation")}</span>
                </div>
                <button 
                  onClick={toggleGps}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${gpsEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                >
                  {gpsEnabled ? t("common.on") : t("common.off")}
                </button>
              </div>

              <div className="h-px bg-white/10 mb-2" />
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">{t("nav.switchView")}</p>
              {userPaths.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  data-testid={`link-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-white/5",
                    location === item.path ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2" />
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">{t("nav.quickLinks")}</p>
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  data-testid={`link-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-white/5",
                    location === item.path ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
              
              <div className="h-px bg-white/10 my-2" />
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">{t("common.more")}</p>
              {legalItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  data-testid={`link-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2" />

              <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">{lang === "es" ? "Soporte" : "Support"}</p>
              <button
                onClick={() => { setOpen(false); setBugReportMode("text"); }}
                className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 rounded-md transition-colors w-full text-left"
                data-testid="button-bug-report-text"
              >
                <Bug className="size-4" />
                {lang === "es" ? "Reportar Problema (Texto)" : "Report a Bug (Text)"}
              </button>
              <button
                onClick={() => { setOpen(false); setBugReportMode("email"); }}
                className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 rounded-md transition-colors w-full text-left"
                data-testid="button-bug-report-email"
              >
                <Bug className="size-4" />
                {lang === "es" ? "Reportar Problema (Email)" : "Report a Bug (Email)"}
              </button>

              <div className="h-px bg-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 mb-1">
                    <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Users className="size-3 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-emerald-300 truncate">{user?.ownerName || user?.name || (lang === "es" ? "Equipo" : "Team")}</p>
                      <p className="text-[10px] text-white/30">{user?.role === "developer" ? "Developer" : "Owner"}</p>
                    </div>
                  </div>
                  <Link href="/team" onClick={() => setOpen(false)} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors">
                    <Users className="size-4" />
                    {lang === "es" ? "Cambiar Cuenta" : "Switch Account"}
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-md transition-colors w-full text-left" data-testid="button-logout">
                    <LogOut className="size-4" />
                    {lang === "es" ? "Cerrar Sesión" : "Log Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/team" data-testid="link-menu-team" onClick={() => setOpen(false)} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-accent hover:text-accent/80 hover:bg-accent/5 rounded-md transition-colors">
                    <Users className="size-4" />
                    {t("nav.teamLogin")}
                  </Link>
                  <Link href="/vendor/login" data-testid="link-menu-vendor-login" onClick={() => setOpen(false)} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 rounded-md transition-colors">
                    <LogIn className="size-4" />
                    {lang === "es" ? "Acceso de Vendedor" : "Vendor Login"}
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>

    {showGreeting && (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
        <div className="flex flex-col items-center">
          <span className="text-7xl drop-shadow-xl">😊</span>
          <div className="mt-3 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-lg text-sm max-w-[220px] text-center">
            <p>{t("greeting.hello")}</p>
          </div>
        </div>
      </div>
    )}

    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="glass-panel border-t border-white/10 px-2 pt-1.5 pb-1 flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            data-testid={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors touch-target",
              location === item.path ? "text-orange-400" : "text-white/40 active:text-white/70"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>

    {bugReportMode && <ContactGate mode={bugReportMode} onClose={() => setBugReportMode(null)} />}

    {aiChatOpen && (
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
        <div className="flex flex-col items-center">
          <span className="text-7xl drop-shadow-xl mb-4">😊</span>
          <div className="w-72 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-rose-400 px-3 py-2 flex items-center justify-between">
              <span className="font-semibold text-white text-sm">{t("ai.assistant")}</span>
              <button 
                onClick={() => setAiChatOpen(false)}
                className="text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-3 max-h-40 overflow-y-auto bg-slate-50">
              <div className="bg-orange-100 rounded-xl px-3 py-2 text-sm text-slate-700">
                {t("ai.askAnything")}
              </div>
            </div>
            <div className="p-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <button className="bg-slate-200 text-slate-600 rounded-full w-9 h-9 flex items-center justify-center hover:bg-slate-300 flex-shrink-0">
                  🎤
                </button>
                <input 
                  type="text" 
                  placeholder={t("ai.typeOrSpeak")} 
                  className="flex-1 bg-slate-100 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-0"
                />
                <button className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-orange-600 flex-shrink-0">
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Global Order FAB */}
    {location !== "/order/i24-corridor" && location !== "/zones" && !location.startsWith("/command") && !location.startsWith("/admin") && !location.startsWith("/driver") && !location.startsWith("/vendor") && (
      <Link href="/order/i24-corridor">
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 px-6 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.5)] border border-emerald-400/50 group"
        >
          <ShoppingCart className="size-5 group-hover:animate-bounce drop-shadow-md" />
          <span className="shadow-black/20 drop-shadow-md tracking-wide text-sm">{lang === "es" ? "Ordenar Ya" : "ORDER NOW"}</span>
        </motion.button>
      </Link>
    )}
    </>
  );
}
