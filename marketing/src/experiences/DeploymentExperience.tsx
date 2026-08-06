"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Server, Database, Cloud, Building, Globe, Zap, Cpu, Activity } from "lucide-react";

type ArchMode = "Enterprise" | "MSP" | "Cloud" | "Edge" | "Government";

const modes: ArchMode[] = ["Enterprise", "MSP", "Cloud", "Edge", "Government"];

export function DeploymentExperience() {
  const [activeMode, setActiveMode] = useState<ArchMode>("Enterprise");

  const getLayout = (mode: ArchMode) => {
    switch (mode) {
      case "Enterprise": return { core: "left-1/2 top-1/2", col1: "left-[20%] top-1/2", col2: "left-[80%] top-1/2" };
      case "MSP": return { core: "left-1/2 top-1/3", col1: "left-[20%] top-[80%]", col2: "left-[50%] top-[80%]", col3: "left-[80%] top-[80%]" };
      case "Cloud": return { core: "left-1/2 top-1/2", col1: "left-[30%] top-1/2", col2: "left-[70%] top-1/2" };
      case "Edge": return { core: "left-1/2 top-[80%]", col1: "left-[20%] top-[20%]", col2: "left-[80%] top-[20%]" };
      case "Government": return { core: "left-1/2 top-1/2", col1: "left-[20%] top-[30%]", col2: "left-[20%] top-[70%]" };
      default: return { core: "left-1/2 top-1/2", col1: "left-[20%] top-1/2", col2: "left-[80%] top-1/2" };
    }
  };

  const layout = getLayout(activeMode);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Control Panel */}
      <div className="flex gap-4 justify-center">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => setActiveMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeMode === m ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black/50 text-gray-400 border-white/20 hover:border-white/50'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="text-center text-gray-400 text-sm">
        Drag components to test network latency and failover behaviors.
      </div>

      {/* Interactive Canvas */}
      <div className="relative w-full h-[500px] glass-panel bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden">
        
        {/* Central Core */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 800, top: 0, bottom: 400 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-20"
          animate={{ [layout.core.split(' ')[0]]: '50%', [layout.core.split(' ')[1]]: '50%' }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ left: "50%", top: "50%" }}
        >
          <div className="w-24 h-24 rounded-2xl bg-[var(--color-brand-cyan-dark)]/40 border-2 border-[var(--color-brand-cyan-light)] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <Database className="w-8 h-8 text-white mb-2" />
            <span className="text-xs font-bold text-white">Central Eye Core</span>
          </div>
          <div className="mt-2 bg-black/80 px-2 py-1 rounded text-[10px] text-[var(--color-brand-emerald-light)] font-mono border border-white/10 flex items-center gap-1">
            <Activity className="w-3 h-3" /> HA Active
          </div>
        </motion.div>

        {/* Collector 1 */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 800, top: 0, bottom: 400 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-20"
          animate={{ left: layout.col1.split(' ')[0].replace('left-[','').replace(']',''), top: layout.col1.split(' ')[1].replace('top-[','').replace(']','') }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ left: "20%", top: "50%" }}
        >
          <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-md hover:border-white/60 transition-colors">
            <Server className="w-6 h-6 text-gray-300" />
          </div>
          <div className="mt-2 bg-black/80 px-2 py-1 rounded text-[10px] text-gray-300 font-mono border border-white/10">
            Collector-East
          </div>
        </motion.div>

        {/* Collector 2 */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 800, top: 0, bottom: 400 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-20"
          animate={{ left: layout.col2.split(' ')[0].replace('left-[','').replace(']',''), top: layout.col2.split(' ')[1].replace('top-[','').replace(']','') }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ left: "80%", top: "50%" }}
        >
          <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-md hover:border-white/60 transition-colors">
            <Server className="w-6 h-6 text-gray-300" />
          </div>
          <div className="mt-2 bg-black/80 px-2 py-1 rounded text-[10px] text-gray-300 font-mono border border-white/10">
            Collector-West
          </div>
        </motion.div>

        {/* Animated Packets/Connections (Visual abstraction) */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen z-0">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-brand-cyan-light)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--color-brand-cyan-light)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-brand-cyan-light)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* The real implementation would calculate path D dynamically between the dragged elements using useTransform. For this mockup, we show glowing connection areas */}
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="url(#grad)" strokeWidth="2" strokeDasharray="10 10" className="animate-[spin_20s_linear_infinite]" />
          </svg>
        </div>
      </div>
    </div>
  );
}
