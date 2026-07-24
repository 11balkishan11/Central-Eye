import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Server, 
  Activity, 
  Bell, 
  Users, 
  Settings,
  Search,
  Network
} from "lucide-react"

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  permission?: string;
}

export const navigationConfig: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Organizations", path: "/organizations", icon: Building2, permission: "organizations:read" },
  { label: "Sites", path: "/sites", icon: MapPin, permission: "sites:read" },
  { label: "Devices", path: "/devices", icon: Server, permission: "devices:read" },
  { label: "Discovery", path: "/discovery", icon: Search, permission: "devices:read" },
  { label: "Topology", path: "/topology", icon: Network, permission: "devices:read" },
  { label: "Collectors", path: "/collectors", icon: Activity, permission: "collectors:read" },
  { label: "Alerts", path: "/alerts", icon: Bell, permission: "alerts:read" },
  { label: "Users", path: "/users", icon: Users, permission: "users:read" },
  { label: "Settings", path: "/settings", icon: Settings, permission: "settings:read" },
  { label: "Design System", path: "/design-system", icon: LayoutDashboard },
];

export const checkPermission = (_userPermissions: string[], requiredPermission?: string) => {
  if (!requiredPermission) return true;
  // For now return true for everything until real auth is implemented
  return true;
  // return userPermissions.includes(requiredPermission) || userPermissions.includes("admin:*");
};
