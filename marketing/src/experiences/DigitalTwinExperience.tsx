"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Wifi, Shield, AlertTriangle, Cloud } from "lucide-react";
import { demoDataset } from "@/lib/demo-dataset";

type Overlay = "Intent" | "Reality" | "Health" | "Difference" | "History";

const OVERLAYS: Overlay[] = ["Intent", "Reality", "Health", "Difference", "History"];

export function DigitalTwinExperience() {
  const [activeOverlay, setActiveOverlay] = useState<Overlay>("Reality");

  // Pick a subset of devices for the visualization (e.g. 15 nodes)
  const displayNodes = demoDataset.devices.slice(0, 15);

  const getNodeColor = (node: any, overlay: Overlay) => {
    switch (overlay) {
      case "Intent": return "border-gray-500 bg-gray-500/20"; // Grey blueprint
      case "Reality": return "border-[var(--color-brand-cyan-light)] bg-[var(--color-brand-cyan-dark)]/20"; // Cyan active
      case "Health": 
        if (node.status === "critical") return "border-red-500 bg-red-500/20";
        if (node.status === "warning") return "border-yellow-500 bg-yellow-500/20";
        return "border-[var(--color-brand-emerald-light)] bg-[var(--color-brand-emerald-dark)]/20";
      case "Difference":
        return node.drift ? "border-[var(--color-brand-violet-light)] bg-[var(--color-brand-violet-dark)]/20" : "border-gray-500 bg-gray-500/20";
      case "History":
        // Mock timeline shift
        return "border-blue-400 bg-blue-500/20";
      default: return "border-white/20 bg-white/5";
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'router': return <Wifi className="w-5 h-5 text-white" />;
      case 'firewall': return <Shield className="w-5 h-5 text-white" />;
      case 'kubernetes': return <Cloud className="w-5 h-5 text-white" />;
      default: return <Server className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="w-full h-[600px] flex flex-col glass-panel overflow-hidden relative">
      {/* Overlay Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 p-1.5 rounded-lg border border-white/10 z-20 backdrop-blur-md">
        {OVERLAYS.map(overlay => (
          <button
            key={overlay}
            onClick={() => setActiveOverlay(overlay)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeOverlay === overlay ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {overlay}
          </button>
        ))}
      </div>

      {/* Description Panel */}
      <div className="absolute bottom-6 left-6 z-20 max-w-sm glass-panel p-4 bg-black/80">
        <h4 className="text-white font-bold mb-1">{activeOverlay} Graph</h4>
        <p className="text-xs text-gray-400">
          {activeOverlay === "Intent" && "The desired state of the network defined by infrastructure-as-code and configuration intent."}
          {activeOverlay === "Reality" && "The actual living state of the network constructed from millions of real-time observations."}
          {activeOverlay === "Health" && "Live telemetry overlays including latency, packet loss, CPU, and sensor thresholds."}
          {activeOverlay === "Difference" && "Automated configuration drift detection highlighting nodes where Intent and Reality diverge."}
          {activeOverlay === "History" && "Time-travel mode. Scrub backward to see exactly how the topology looked before an incident."}
        </p>
      </div>

      {/* Interactive Topology Area */}
      <div className="relative flex-1 bg-black/40 pt-20">
        <AnimatePresence mode="popLayout">
          {displayNodes.map((node, i) => {
            // Distribute nodes roughly in a grid/circle
            const x = 15 + (i % 5) * 18;
            const y = 20 + Math.floor(i / 5) * 25;
            const colorClass = getNodeColor(node, activeOverlay);
            
            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors duration-500 backdrop-blur-md ${colorClass} group-hover:scale-110 shadow-lg`}>
                  {getIcon(node.type)}
                </div>
                {/* Node Label */}
                <div className="mt-2 text-[10px] text-gray-300 bg-black/80 px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                  {node.hostname} <br/> <span className="text-gray-500">{node.ip}</span>
                </div>

                {/* Specific Alerts */}
                {activeOverlay === "Difference" && node.drift && (
                  <div className="absolute -top-2 -right-2 bg-[var(--color-brand-violet)] text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce shadow-[0_0_10px_var(--color-brand-violet)]">
                    Drift
                  </div>
                )}
                {activeOverlay === "Health" && node.status !== "healthy" && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 animate-pulse shadow-[0_0_10px_red]">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
