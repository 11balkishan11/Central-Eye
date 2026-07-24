import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navigationConfig, checkPermission } from "../../config/permissions";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // In a real app, this would come from an auth context
  const userPermissions: string[] = []; 

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Central Eye" className="h-8 w-8 object-cover rounded-md" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">Central <span className="text-blue-500">Eye</span></span>
          </div>
        </div>
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
              onClick={() => navigate(item.path)}
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
          onClick={() => navigate("/login")}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
