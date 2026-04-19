import { Link, useLocation } from "wouter";
import { Shield, Menu, Search, Globe, ArrowLeft, Truck, MapPin, Radio, Briefcase, CloudSun, Award, Gamepad2, Home, Rocket, FileText, Users, LogIn, LogOut, Heart, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GlobalSearch } from "@/components/global-search";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/lib/auth-context";

export function TLNavbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();

  const userPaths = [
    { icon: Home, label: "Explore Hub", path: "/", description: "All features in one place" },
    { icon: Truck, label: "Commercial Driver", path: "/driver", description: "CDL driver tools & services" },
    { icon: MapPin, label: "Everyday Driver", path: "/everyday", description: "Local driver features" },
  ];

  const navItems = [
    { icon: Radio, label: "Trucker Talk", path: "/trucker-talk" },
    { icon: CloudSun, label: "Weather", path: "/weather" },
    { icon: MapPin, label: "GPS Finder", path: "/gps" },
    { icon: Award, label: "CDL Directory", path: "/cdl-directory" },
    { icon: Briefcase, label: "Business Suite", path: "/business" },
  ];

  const moreItems = [
    { icon: Rocket, label: "Roadmap", path: "/roadmap" },
    { icon: Shield, label: "Privacy Policy", path: "/privacy" },
    { icon: FileText, label: "Terms of Service", path: "/terms" },
    { icon: Gamepad2, label: "Games & Fun", path: "/home#games" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 safe-top bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-cyan-500/10 px-3 sm:px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="link-tl-home-logo">
          <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Shield className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            TL Driver<span className="text-cyan-400">Connect</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            data-testid="button-tl-language-toggle"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-bold transition-all"
            aria-label={t("nav.language")}
          >
            <span className={`px-1.5 py-0.5 rounded-full transition-all ${lang === "en" ? "bg-cyan-500 text-white" : "text-muted-foreground"}`}>EN</span>
            <span className="text-muted-foreground">/</span>
            <span className={`px-1.5 py-0.5 rounded-full transition-all ${lang === "es" ? "bg-cyan-500 text-white" : "text-muted-foreground"}`}>ES</span>
          </button>

          <Button
            data-testid="button-tl-global-search"
            variant="ghost"
            size="icon"
            className="text-foreground size-9"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button data-testid="button-tl-menu" variant="ghost" size="icon" className="text-foreground size-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0f1e] border-l-cyan-500/10 text-foreground w-[280px] p-4">
              <div className="flex flex-col gap-1 mt-4">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart className="size-3.5 text-cyan-300 fill-cyan-300" />
                    <span className="text-xs font-bold text-cyan-300">Our Mission</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Empowering drivers nationwide with the tools, services, and community they need to thrive on the road. From food delivery to business management — built by drivers, for drivers.
                  </p>
                  <p className="text-[10px] text-white/30 mt-2">Est. 2025 | Nashville, TN</p>
                </div>

                <div className="flex items-center justify-between px-2 py-2 rounded-md bg-white/5 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-cyan-400" />
                    <span className="text-sm text-foreground">{t("nav.language")}</span>
                  </div>
                  <button
                    data-testid="button-tl-lang-toggle-menu"
                    onClick={() => setLang(lang === "en" ? "es" : "en")}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition-colors bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    {lang === "en" ? "EN → ES" : "ES → EN"}
                  </button>
                </div>

                <div className="h-px bg-cyan-500/10 mb-2" />

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">Switch View</p>
                {userPaths.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    data-testid={`link-tl-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-white/5",
                      location === item.path ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    <div>
                      <span className="block">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.description}</span>
                    </div>
                  </Link>
                ))}

                <div className="h-px bg-cyan-500/10 my-2" />

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">Driver Tools</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    data-testid={`link-tl-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-white/5",
                      location === item.path ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}

                <div className="h-px bg-cyan-500/10 my-2" />

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-1">More</p>
                {moreItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    data-testid={`link-tl-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}

                <div className="h-px bg-cyan-500/10 my-2" />

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-cyan-500/5 border border-cyan-500/20 mb-1">
                      <div className="size-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Users className="size-3 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-cyan-300 truncate">{user?.ownerName || user?.name || "Team"}</p>
                        <p className="text-[10px] text-white/30">{user?.role === "developer" ? "Developer" : "Owner"}</p>
                      </div>
                    </div>
                    <Link href="/team" onClick={() => setOpen(false)} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors">
                      <Users className="size-4" />
                      Switch Account
                    </Link>
                    <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-md transition-colors w-full text-left" data-testid="button-tl-logout">
                      <LogOut className="size-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link href="/team" data-testid="link-tl-menu-team" onClick={() => setOpen(false)} className="flex items-center gap-3 text-sm font-medium py-2 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 rounded-md transition-colors">
                    <LogIn className="size-4" />
                    Team Login
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
        <div className="bg-[#0a0f1e]/90 backdrop-blur-xl border-t border-cyan-500/10 px-2 pt-1.5 pb-1 flex items-center justify-around">
          {[
            { icon: Radio, label: "Talk", path: "/trucker-talk" },
            { icon: CloudSun, label: "Weather", path: "/weather" },
            { icon: MapPin, label: "GPS", path: "/gps" },
            { icon: Briefcase, label: "Business", path: "/business" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`tl-bottom-nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors touch-target",
                location === item.path ? "text-cyan-400" : "text-white/40 active:text-white/70"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
