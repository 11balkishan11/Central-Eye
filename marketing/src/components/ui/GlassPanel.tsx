import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export function GlassPanel({ children, className, hoverEffect = false, onClick }: GlassPanelProps) {
  return (
    <div 
      className={cn(
        "glass-panel p-6", 
        hoverEffect && "glass-panel-hover",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
