import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import themeDefaultImg from "@/assets/images/theme-default.jpg";
import themeMidnightImg from "@/assets/images/theme-midnight.jpg";
import themeSpaceImg from "@/assets/images/theme-space.jpg";
import themeForestImg from "@/assets/images/theme-forest.jpg";
import themeTruckingImg from "@/assets/images/theme-trucking.jpg";
import themeFootballImg from "@/assets/images/theme-football.jpg";
import themeNascarImg from "@/assets/images/theme-nascar.jpg";
import themeSunsetImg from "@/assets/images/theme-sunset.jpg";

export type ThemeId = 
  | "default" 
  | "dark" 
  | "space" 
  | "nature" 
  | "trucking" 
  | "nfl-titans" 
  | "nfl-cowboys"
  | "nascar"
  | "sunset";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  emoji: string;
  image: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    accentForeground: string;
    background: string;
    card: string;
    border: string;
  };
  backgroundStyle?: string;
}

export const themes: Theme[] = [
  {
    id: "default",
    name: "Happy Eats",
    description: "Orange & Rose gradient",
    emoji: "😋",
    image: themeDefaultImg,
    colors: {
      primary: "rgb(249, 115, 22)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(244, 63, 94)",
      accent: "rgb(251, 146, 60)",
      accentForeground: "rgb(255, 255, 255)",
      background: "rgb(15, 23, 42)",
      card: "rgba(30, 41, 59, 0.8)",
      border: "rgba(249, 115, 22, 0.3)",
    },
  },
  {
    id: "dark",
    name: "Midnight Sky",
    description: "Deep dark with cool accents",
    emoji: "🌙",
    image: themeMidnightImg,
    colors: {
      primary: "rgb(99, 102, 241)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(139, 92, 246)",
      accent: "rgb(168, 85, 247)",
      accentForeground: "rgb(255, 255, 255)",
      background: "rgb(3, 7, 18)",
      card: "rgba(17, 24, 39, 0.9)",
      border: "rgba(99, 102, 241, 0.3)",
    },
  },
  {
    id: "space",
    name: "Deep Space",
    description: "Galaxy & nebula vibes",
    emoji: "🚀",
    image: themeSpaceImg,
    colors: {
      primary: "rgb(56, 189, 248)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(192, 132, 252)",
      accent: "rgb(34, 211, 238)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(2, 6, 23)",
      card: "rgba(15, 23, 42, 0.7)",
      border: "rgba(56, 189, 248, 0.2)",
    },
    backgroundStyle: "radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(192, 132, 252, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 1px, transparent 1px)",
  },
  {
    id: "nature",
    name: "Summer Forest",
    description: "Green & earthy tones",
    emoji: "🌲",
    image: themeForestImg,
    colors: {
      primary: "rgb(34, 197, 94)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(16, 185, 129)",
      accent: "rgb(132, 204, 22)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(5, 20, 14)",
      card: "rgba(20, 40, 30, 0.8)",
      border: "rgba(34, 197, 94, 0.3)",
    },
  },
  {
    id: "trucking",
    name: "Big Rig",
    description: "Chrome & steel vibes",
    emoji: "🚛",
    image: themeTruckingImg,
    colors: {
      primary: "rgb(234, 179, 8)",
      primaryForeground: "rgb(0, 0, 0)",
      secondary: "rgb(251, 191, 36)",
      accent: "rgb(245, 158, 11)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(20, 20, 25)",
      card: "rgba(40, 40, 48, 0.8)",
      border: "rgba(234, 179, 8, 0.3)",
    },
  },
  {
    id: "nfl-titans",
    name: "Titans Football",
    description: "Navy, light blue & red",
    emoji: "🏈",
    image: themeFootballImg,
    colors: {
      primary: "rgb(75, 146, 219)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(200, 16, 46)",
      accent: "rgb(12, 35, 64)",
      accentForeground: "rgb(255, 255, 255)",
      background: "rgb(12, 35, 64)",
      card: "rgba(20, 50, 85, 0.8)",
      border: "rgba(75, 146, 219, 0.3)",
    },
  },
  {
    id: "nfl-cowboys",
    name: "Cowboys Football",
    description: "Navy & silver star",
    emoji: "⭐",
    image: themeFootballImg,
    colors: {
      primary: "rgb(176, 183, 188)",
      primaryForeground: "rgb(0, 0, 0)",
      secondary: "rgb(0, 53, 148)",
      accent: "rgb(134, 147, 151)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(0, 34, 68)",
      card: "rgba(0, 53, 100, 0.8)",
      border: "rgba(176, 183, 188, 0.3)",
    },
  },
  {
    id: "nascar",
    name: "NASCAR Racing",
    description: "Racing checkered flag",
    emoji: "🏁",
    image: themeNascarImg,
    colors: {
      primary: "rgb(255, 0, 0)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(255, 200, 0)",
      accent: "rgb(255, 100, 0)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(15, 15, 15)",
      card: "rgba(30, 30, 30, 0.9)",
      border: "rgba(255, 0, 0, 0.3)",
    },
  },
  {
    id: "sunset",
    name: "Desert Sunset",
    description: "Warm orange & purple",
    emoji: "🌅",
    image: themeSunsetImg,
    colors: {
      primary: "rgb(251, 146, 60)",
      primaryForeground: "rgb(0, 0, 0)",
      secondary: "rgb(168, 85, 247)",
      accent: "rgb(244, 114, 182)",
      accentForeground: "rgb(0, 0, 0)",
      background: "rgb(30, 15, 30)",
      card: "rgba(50, 25, 50, 0.8)",
      border: "rgba(251, 146, 60, 0.3)",
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("happy-eats-theme");
      if (saved && themes.find(t => t.id === saved)) {
        return saved as ThemeId;
      }
    }
    return "default";
  });

  const currentTheme = themes.find(t => t.id === themeId) || themes[0];

  useEffect(() => {
    localStorage.setItem("happy-eats-theme", themeId);
    
    const root = document.documentElement;
    
    // Set data-theme attribute for CSS targeting
    root.setAttribute("data-theme", themeId);
    const { colors, backgroundStyle } = currentTheme;
    
    const rgbToHsl = (rgb: string) => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return rgb;
      
      let r = parseInt(match[1]) / 255;
      let g = parseInt(match[2]) / 255;
      let b = parseInt(match[3]) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    root.style.setProperty("--theme-primary", colors.primary);
    root.style.setProperty("--theme-primary-foreground", colors.primaryForeground);
    root.style.setProperty("--theme-secondary", colors.secondary);
    root.style.setProperty("--theme-accent", colors.accent);
    root.style.setProperty("--theme-accent-foreground", colors.accentForeground);
    root.style.setProperty("--theme-background", colors.background);
    root.style.setProperty("--theme-card", colors.card);
    root.style.setProperty("--theme-border", colors.border);
    
    root.style.setProperty("--color-primary", rgbToHsl(colors.primary));
    root.style.setProperty("--color-primary-foreground", rgbToHsl(colors.primaryForeground));
    root.style.setProperty("--color-background", rgbToHsl(colors.background));
    root.style.setProperty("--color-card", rgbToHsl(colors.card.replace(/rgba?\(([^)]+)\).*/, 'rgb($1)')));
    root.style.setProperty("--color-accent", rgbToHsl(colors.accent));
    root.style.setProperty("--color-accent-foreground", rgbToHsl(colors.accentForeground));
    root.style.setProperty("--color-border", rgbToHsl(colors.border.replace(/rgba?\(([^)]+)\).*/, 'rgb($1)')));
    root.style.setProperty("--color-ring", rgbToHsl(colors.primary));
    
    if (backgroundStyle) {
      root.style.setProperty("--theme-bg-style", backgroundStyle);
    } else {
      root.style.removeProperty("--theme-bg-style");
    }
  }, [themeId, currentTheme]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
