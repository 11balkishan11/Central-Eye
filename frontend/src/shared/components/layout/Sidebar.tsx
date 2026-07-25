import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { navigationConfig, checkPermission } from "../../config/permissions";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // In a real app, this would come from an auth context
  const userPermissions: string[] = []; 

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="py-6 flex justify-between items-center px-6 border-b border-border h-16 md:h-auto">
          <div className="flex items-center w-full justify-center">
            <img src="/logo.png" alt="Central Eye" className="h-10 md:h-28 w-auto object-contain" />
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 -mr-2 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navigationConfig
            .filter(item => checkPermission(userPermissions, item.permission))
            .map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => {
              navigate("/login");
              if (onClose) onClose();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
