import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "./features/auth/pages/LoginPage"
import { DashboardPage } from "./features/dashboard/pages/DashboardPage"
import { OrganizationsPage } from "./features/organizations/pages/OrganizationsPage"
import { SitesPage } from "./features/sites/pages/SitesPage"
import { DevicesPage } from "./features/devices/pages/DevicesPage"
import { DeviceDetailsPage } from "./features/devices/pages/DeviceDetailsPage"
import { DiscoveryPage } from "./features/discovery/pages/DiscoveryPage"
import { TopologyPage } from "./features/topology/pages/TopologyPage"
import { AlertsPage } from "./features/alerts/pages/AlertsPage"
import { DesignSystemPage } from "./features/design-system/pages/DesignSystemPage"
import { AppLayout } from "./shared/components/layout/AppLayout"
import { ProtectedRoute } from "./shared/components/layout/ProtectedRoute"

import { TooltipProvider } from "./shared/components/ui/tooltip"
import { Toaster } from "./shared/components/ui/sonner"
import { ThemeProvider } from "./shared/providers/theme-provider"
import { queryClient } from "./shared/api/queryClient"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/devices/:id" element={<DeviceDetailsPage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
              <Route path="/topology" element={<TopologyPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/design-system" element={<DesignSystemPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
