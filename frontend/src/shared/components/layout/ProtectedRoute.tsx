import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../providers/useAuthStore";
import { authApi } from "../../api/authApi";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const me = await authApi.getMe();
        setAuth(token, me.session?.tenant_id || null, me.user);
      } catch (error) {
        clearAuth();
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [token, setAuth, clearAuth]);

  if (isVerifying) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Verifying session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
