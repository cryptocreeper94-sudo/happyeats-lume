import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useLanguage, LanguageContext, type Language } from "./context";
import { en } from "./en";
import { es } from "./es";
import { Globe } from "lucide-react";

const translations: Record<Language, Record<string, any>> = { en, es };

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}

interface PageLangContextType {
  pageLang: Language;
  setPageLang: (lang: Language) => void;
  isOverridden: boolean;
  resetToGlobal: () => void;
  globalLang: Language;
}

const PageLangContext = createContext<PageLangContextType | null>(null);

export function PageLanguageProvider({ children }: { children: ReactNode }) {
  const { lang: globalLang, setLang: globalSetLang } = useLanguage();
  const [override, setOverride] = useState<Language | null>(null);

  const pageLang = override ?? globalLang;
  const isOverridden = override !== null;

  const setPageLang = useCallback((newLang: Language) => {
    setOverride(newLang);
  }, []);

  const resetToGlobal = useCallback(() => {
    setOverride(null);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[pageLang], key);
    if (value) return interpolate(value, params);
    const fallback = getNestedValue(translations.en, key);
    if (fallback) return interpolate(fallback, params);
    return key;
  }, [pageLang]);

  const contextSetLang = useCallback((newLang: Language) => {
    if (override !== null) {
      setOverride(newLang);
    } else {
      globalSetLang(newLang);
    }
  }, [override, globalSetLang]);

  return (
    <PageLangContext.Provider value={{ pageLang, setPageLang, isOverridden, resetToGlobal, globalLang }}>
      <LanguageContext.Provider value={{ lang: pageLang, setLang: contextSetLang, t }}>
        {children}
      </LanguageContext.Provider>
    </PageLangContext.Provider>
  );
}

export function usePageLanguage() {
  const ctx = useContext(PageLangContext);
  if (!ctx) throw new Error("usePageLanguage must be used within PageLanguageProvider");
  return ctx;
}

export function PageLanguageToggle() {
  const { pageLang, setPageLang, isOverridden, resetToGlobal } = usePageLanguage();

  return (
    <div className="flex items-center gap-2" data-testid="page-language-toggle">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <Globe className="size-4 text-orange-400" />
        <span className="text-xs text-muted-foreground mr-1">
          {pageLang === "en" ? "Page Language" : "Idioma de página"}
        </span>
        <button
          data-testid="page-lang-en"
          onClick={() => setPageLang("en")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            pageLang === "en"
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25"
              : "text-muted-foreground hover:text-white hover:bg-white/10"
          }`}
        >
          <span>🇺🇸</span> EN
        </button>
        <button
          data-testid="page-lang-es"
          onClick={() => setPageLang("es")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            pageLang === "es"
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25"
              : "text-muted-foreground hover:text-white hover:bg-white/10"
          }`}
        >
          <span>🇲🇽</span> ES
        </button>
      </div>
      {isOverridden && (
        <button
          data-testid="page-lang-reset"
          onClick={resetToGlobal}
          className="text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
        >
          {pageLang === "en" ? "Reset to global" : "Restablecer"}
        </button>
      )}
    </div>
  );
}
