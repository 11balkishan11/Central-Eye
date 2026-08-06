"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Search, Server, Cpu, Navigation, CheckCircle2, ChevronRight, Play } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const missions = [
  {
    id: "m1",
    title: "Discover the Network",
    icon: Search,
    steps: [
      "Initialize Discovery Collector",
      "Run ICMP Sweep across 10.0.0.0/8",
      "Interrogate nodes via SNMP v3",
      "Crawl LLDP/CDP neighbors",
      "Assemble initial Reality Graph"
    ]
  },
  {
    id: "m2",
    title: "Investigate Latency",
    icon: Activity,
    steps: [
      "Select application 'SAP ERP'",
      "Trace L2/L3 path from Client to Server",
      "Correlate interface drops along path",
      "Identify microbursts on fw-core-01",
      "Generate QoS remediation playbook"
    ]
  },
  {
    id: "m3",
    title: "Simulate Outage",
    icon: Cpu,
    steps: [
      "Target branch-router-tx",
      "Execute 'NODE_DOWN' action",
      "Calculate convergence time",
      "Identify orphaned BGP sessions",
      "Review blast radius report"
    ]
  }
];

// Re-defining Activity icon locally to avoid import conflicts if missing
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function TourExperience() {
  const [activeMission, setActiveMission] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const m = missions[activeMission];

  const startMission = () => {
    setIsPlaying(true);
    setActiveStep(0);
    
    // Auto advance steps
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= m.steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsPlaying(false), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Left Pane: Mission Selector */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {missions.map((mission, idx) => {
          const Icon = mission.icon;
          const isActive = activeMission === idx;
          
          return (
            <GlassPanel 
              key={mission.id}
              onClick={() => {
                if (!isPlaying) {
                  setActiveMission(idx);
                  setActiveStep(0);
                }
              }}
              className={`cursor-pointer transition-all ${isActive ? 'border-[var(--color-brand-cyan-light)] shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-[var(--color-brand-cyan-dark)]/20' : 'hover:bg-white/5 opacity-70'} ${isPlaying && !isActive ? 'pointer-events-none opacity-30' : ''}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${isActive ? 'bg-[var(--color-brand-cyan-light)]/20 text-[var(--color-brand-cyan-light)]' : 'bg-white/10 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>Mission {idx + 1}</h3>
                  <div className="text-sm text-gray-500">{mission.title}</div>
                </div>
              </div>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="border-t border-white/10 pt-4 mt-2">
                      <div className="space-y-3 mb-6">
                        {mission.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${stepIdx < activeStep ? 'bg-[var(--color-brand-emerald-dark)]/50 border-[var(--color-brand-emerald-light)] text-[var(--color-brand-emerald-light)]' : stepIdx === activeStep && isPlaying ? 'bg-[var(--color-brand-cyan-dark)] border-[var(--color-brand-cyan-light)] text-white animate-pulse' : 'bg-transparent border-gray-600 text-gray-500'}`}>
                              {stepIdx < activeStep ? <CheckCircle2 className="w-3 h-3" /> : stepIdx + 1}
                            </div>
                            <span className={`text-xs ${stepIdx < activeStep ? 'text-gray-400 line-through' : stepIdx === activeStep && isPlaying ? 'text-white font-bold' : 'text-gray-500'}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); startMission(); }}
                        disabled={isPlaying}
                        className="w-full py-2 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] disabled:opacity-50 text-white text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        {isPlaying ? 'Mission in Progress...' : <><Play className="w-4 h-4 fill-current" /> Execute Mission</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          );
        })}
      </div>

      {/* Right Pane: Visualizer */}
      <div className="flex-1 glass-panel h-[500px] lg:h-auto border border-white/10 relative overflow-hidden bg-black/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {!isPlaying && activeStep === 0 ? (
            <div className="text-center text-gray-500 flex flex-col items-center">
              <Map className="w-16 h-16 mb-4 opacity-20" />
              <p>Select "Execute Mission" to begin the automated tour.</p>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeMission}-${activeStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#111112] border border-white/10 rounded-xl p-6 shadow-2xl relative"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded bg-[var(--color-brand-cyan-dark)] border border-[var(--color-brand-cyan-light)] flex items-center justify-center text-white font-mono text-xs shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    {activeStep + 1}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 text-center">{m.steps[activeStep]}</h4>
                  <div className="w-full h-1 bg-gray-800 rounded mt-4 overflow-hidden">
                    <motion.div 
                      className="h-full bg-[var(--color-brand-cyan-light)]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
