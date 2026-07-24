import { useAuthStore } from "../providers/useAuthStore";
import { checkPermission as checkPermissionLogic } from "../config/permissions";
import { useCallback } from "react";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  
  // In a real application, you would fetch actual permissions assigned to the user"s role.
  // For now, we mock it. If they are admin, give all.
  const permissions = user?.role === "admin" ? ["admin:*"] : [];

  const checkPermission = useCallback((requiredPermission: string) => {
    return checkPermissionLogic(permissions, requiredPermission);
  }, [permissions]);

  return {
    permissions,
    checkPermission,
    isAdmin: user?.role === "admin",
  };
}
