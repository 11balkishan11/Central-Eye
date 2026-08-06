import { Activity, Cpu, Server, ShieldAlert, BarChart3, Clock } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { demoDataset } from "@/lib/demo-dataset";

export default function MonitoringPage() {
  const criticalCount = demoDataset.devices.filter(d => d.status === "critical").length;
  const warningCount = demoDataset.devices.filter(d => d.status === "warning").length;
  const totalCount = demoDataset.devices.length;

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Context-Aware Monitoring
          </h1>
          <p className="text-xl text-gray-400">
            Stop drowning in alerts. Central Eye enriches raw metrics with topology context to surface only what actually matters.
          </p>
        </div>

        {/* Live Dashboard Mock */}
        <div className="mb-24 w-full h-[500px] glass-panel border border-white/10 p-6 flex flex-col relative overflow-hidden bg-black/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--color-brand-emerald-light)]" />
              Global Enterprise Dashboard
            </h2>
            <div className="flex gap-4">
              <span className="text-sm text-gray-400">Total Nodes: <span className="text-white font-mono">{totalCount}</span></span>
              <span className="text-sm text-gray-400">Critical: <span className="text-red-500 font-bold font-mono">{criticalCount}</span></span>
              <span className="text-sm text-gray-400">Warning: <span className="text-yellow-500 font-bold font-mono">{warningCount}</span></span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {/* Metric Panel */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-sm font-semibold">Average CPU Load</span>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-3xl font-mono text-white">42.8%</div>
              <div className="w-full h-1 bg-gray-800 mt-2 rounded overflow-hidden">
                <div className="h-full bg-[var(--color-brand-cyan-light)] w-[42%]"></div>
              </div>
            </div>

            {/* SLA Panel */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-sm font-semibold">WAN Uptime SLA</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-3xl font-mono text-[var(--color-brand-emerald-light)]">99.98%</div>
              <div className="text-xs text-gray-500 mt-2">Target: 99.99%</div>
            </div>

            {/* Active Incidents */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between text-red-400 mb-2">
                <span className="text-sm font-semibold">Active Incidents</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mt-2">
                {demoDataset.devices.filter(d => d.status === "warning").slice(0, 3).map(device => (
                  <div key={device.id} className="text-xs bg-black/40 p-2 rounded border border-red-500/10">
                    <span className="text-red-400 font-bold">{device.hostname}</span>
                    <br />
                    <span className="text-gray-400 font-mono">High Memory Utilization</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Device Health & Telemetry</h3>
            <p className="text-gray-400 mb-6">
              Track CPU, Memory, and Interface statistics in real-time. But unlike traditional NMS platforms, Central Eye knows when a 90% CPU spike is normal behavior (e.g., during a scheduled backup window) versus a genuine anomaly.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Service Maps & Dependencies</h3>
            <p className="text-gray-400 mb-6">
              When a switch goes down, we don't just alert you that the switch is unreachable. We automatically traverse the Reality Graph to alert you that the <strong>Payment Processing Application</strong> is degraded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
