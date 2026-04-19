import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Search, Truck, ShoppingBag, MapPin, Navigation, 
  Utensils, Wrench, Package, FileText, Users, Rocket, Code
} from "lucide-react";

interface SearchResult {
  icon: any;
  title: string;
  description: string;
  path: string;
  category: string;
}

const searchableItems: SearchResult[] = [
  { icon: Truck, title: "Driver Home", description: "Main dashboard with all driver tools", path: "/", category: "Pages" },
  { icon: ShoppingBag, title: "Vendors", description: "Browse food, parts, and service vendors", path: "/vendors", category: "Pages" },
  { icon: Navigation, title: "GPS Finder", description: "Find nearby stores and services", path: "/gps", category: "Pages" },
  { icon: MapPin, title: "Concierge", description: "Personal delivery service", path: "/concierge", category: "Pages" },
  { icon: MapPin, title: "Order Tracking", description: "Track your deliveries", path: "/tracking", category: "Pages" },
  { icon: Utensils, title: "Food & Restaurants", description: "Order meals to your truck", path: "/vendors", category: "Services" },
  { icon: Wrench, title: "Parts & Repairs", description: "Truck parts and service", path: "/vendors", category: "Services" },
  { icon: Package, title: "Supplies", description: "Essentials and sundries", path: "/vendors", category: "Services" },
  { icon: Users, title: "Team Login", description: "Admin and team access", path: "/team", category: "Account" },
  { icon: Rocket, title: "Roadmap & Future", description: "Upcoming features and plans", path: "/roadmap", category: "Info" },
  { icon: Code, title: "Developer Dashboard", description: "System health and monitoring", path: "/developer", category: "Account" },
  { icon: FileText, title: "Privacy Policy", description: "How we protect your data", path: "/privacy", category: "Legal" },
  { icon: FileText, title: "Terms of Service", description: "Usage terms and conditions", path: "/terms", category: "Legal" },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const filteredResults = query.trim() 
    ? searchableItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchableItems.slice(0, 6);

  const handleSelect = (path: string) => {
    setLocation(path);
    onOpenChange(false);
    setQuery("");
  };

  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border-slate-700/50 text-foreground max-w-md p-0 gap-0">
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
          <Search className="size-5 text-muted-foreground" />
          <Input
            data-testid="input-global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, features, vendors..."
            className="border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">{category}</p>
              {items.map((item) => (
                <button
                  key={item.path + item.title}
                  data-testid={`search-result-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="size-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
