import { useTheme } from "next-themes";
import { Sun, Moon, Search, Menu } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <header className="h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <Menu size={24} />
            <span className="sr-only">Toggle menu</span>
          </button>
          <div className="hidden sm:flex font-medium text-xs md:text-sm px-3 py-1 bg-secondary rounded-full border border-border whitespace-nowrap">
            Tenant: <span className="font-semibold ml-1">Acme Corp</span>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end md:justify-center max-w-md px-2 md:px-8">
          <button className="flex items-center justify-center md:justify-start gap-2 w-10 md:w-full h-10 md:h-auto md:px-4 md:py-2 text-sm text-muted-foreground bg-transparent md:bg-muted hover:bg-muted/80 rounded-full md:rounded-md transition-colors border border-transparent md:border-border">
            <Search size={18} className="md:w-4 md:h-4" />
            <span className="hidden md:inline">Search... (Ctrl+K)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
      <div className="hidden sm:block">
        <Breadcrumb />
      </div>
    </div>
  );
}
