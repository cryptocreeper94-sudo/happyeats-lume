import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { en } from "./en";
import { es } from "./es";

export type Language = "en" | "es";

type TranslationDict = Record<string, any>;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, TranslationDict> = { en, es };

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

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("happy-eats-lang");
    if (stored === "es" || stored === "en") return stored;
    const browserLang = navigator.language?.toLowerCase();
    return browserLang?.startsWith("es") ? "es" : "en";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("happy-eats-lang", newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[lang], key);
    if (value) return interpolate(value, params);
    const fallback = getNestedValue(translations.en, key);
    if (fallback) return interpolate(fallback, params);
    return key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
