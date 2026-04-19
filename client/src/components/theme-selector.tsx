import { useTheme, Theme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Check } from "lucide-react";

export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme();

  const groupedThemes = {
    general: themes.filter(t => ["default", "dark", "space", "sunset"].includes(t.id)),
    driving: themes.filter(t => ["nature", "trucking"].includes(t.id)),
    sports: themes.filter(t => ["nfl-titans", "nfl-cowboys", "nascar"].includes(t.id)),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          data-testid="button-theme-selector"
        >
          <span className="text-base">{currentTheme.emoji}</span>
          <Palette className="size-4" />
          <span className="hidden sm:inline">{currentTheme.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Your Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">General</DropdownMenuLabel>
        {groupedThemes.general.map((theme) => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme.id === theme.id}
            onClick={() => setTheme(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Driving</DropdownMenuLabel>
        {groupedThemes.driving.map((theme) => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme.id === theme.id}
            onClick={() => setTheme(theme.id)}
          />
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Sports</DropdownMenuLabel>
        {groupedThemes.sports.map((theme) => (
          <ThemeMenuItem 
            key={theme.id} 
            theme={theme} 
            isActive={currentTheme.id === theme.id}
            onClick={() => setTheme(theme.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeMenuItem({ 
  theme, 
  isActive, 
  onClick 
}: { 
  theme: Theme; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <DropdownMenuItem 
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer"
      data-testid={`theme-option-${theme.id}`}
    >
      <div 
        className="size-6 rounded-full flex items-center justify-center text-sm"
        style={{ backgroundColor: theme.colors.primary }}
      >
        {theme.emoji}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{theme.name}</div>
        <div className="text-[10px] text-muted-foreground">{theme.description}</div>
      </div>
      {isActive && <Check className="size-4 text-primary" />}
    </DropdownMenuItem>
  );
}

export function ThemePreview() {
  const { currentTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-1.5">
      {[
        currentTheme.colors.primary,
        currentTheme.colors.secondary,
        currentTheme.colors.accent,
      ].map((color, i) => (
        <div 
          key={i}
          className="size-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
