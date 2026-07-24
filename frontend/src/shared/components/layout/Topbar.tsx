import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";

export function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <header className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="font-medium text-sm px-3 py-1 bg-secondary rounded-full border border-border">
            Tenant: <span className="font-semibold">Acme Corp</span>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-center max-w-md px-8">
          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border">
            <Search size={16} />
            <span>Search... (Ctrl+K)</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <Sun size={20} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={20} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            AD
          </div>
        </div>
      </header>
      <Breadcrumb />
    </div>
  );
}
