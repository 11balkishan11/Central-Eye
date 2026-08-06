import { Activity, CheckCircle2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const regions = [
  { name: "US East (N. Virginia)", status: "operational", uptime: "99.999%" },
  { name: "US West (Oregon)", status: "operational", uptime: "99.999%" },
  { name: "EU (Frankfurt)", status: "operational", uptime: "99.998%" },
  { name: "EU (London)", status: "operational", uptime: "100%" },
  { name: "Asia Pacific (Tokyo)", status: "operational", uptime: "99.995%" },
  { name: "Asia Pacific (Sydney)", status: "operational", uptime: "100%" }
];

const services = [
  { name: "API Gateway", status: "operational" },
  { name: "Web Application", status: "operational" },
  { name: "Topology Inference Engine", status: "operational" },
  { name: "Intent Validation Engine", status: "operational" },
  { name: "Telemetry Ingestion Pipeline", status: "operational" },
  { name: "Notification Services", status: "operational" }
];

export default function StatusPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Central Eye Status
          </h1>
          <p className="text-xl text-gray-400">
            Real-time and historical data on system performance.
          </p>
        </div>

        {/* Global Status Banner */}
        <div className="bg-[var(--color-brand-emerald-dark)]/20 border border-[var(--color-brand-emerald-light)]/50 rounded-xl p-6 flex items-center justify-between mb-16 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-brand-emerald-dark)]/50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-brand-emerald-light)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">All Systems Operational</h2>
              <p className="text-gray-400">Last updated: Just now</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm font-bold text-white border border-white/10 transition-colors">
            Subscribe to Updates
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Core Services
            </h3>
            <GlassPanel className="p-0 overflow-hidden">
              {services.map((service, idx) => (
                <div key={service.name} className={`px-6 py-4 flex items-center justify-between ${idx !== services.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <span className="text-gray-300 font-medium">{service.name}</span>
                  <span className="text-[var(--color-brand-emerald-light)] text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)]" />
                    Operational
                  </span>
                </div>
              ))}
            </GlassPanel>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Regional Deployments
            </h3>
            <GlassPanel className="p-0 overflow-hidden">
              {regions.map((region, idx) => (
                <div key={region.name} className={`px-6 py-4 flex items-center justify-between ${idx !== regions.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div>
                    <div className="text-gray-300 font-medium mb-1">{region.name}</div>
                    <div className="text-xs text-gray-500 font-mono">Uptime: {region.uptime}</div>
                  </div>
                  <span className="text-[var(--color-brand-emerald-light)] text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)]" />
                    Operational
                  </span>
                </div>
              ))}
            </GlassPanel>
          </div>

        </div>

      </div>
    </div>
  );
}
