"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Eye, Database, BrainCircuit, ShieldCheck, 
  Activity, TrendingUp, FlaskConical, Wrench, GraduationCap 
} from "lucide-react";

const steps = [
  { id: "discover", icon: Search, label: "Discover", color: "text-blue-400", bg: "bg-blue-400/20" },
  { id: "observe", icon: Eye, label: "Observe", color: "text-cyan-400", bg: "bg-cyan-400/20" },
  { id: "normalize", icon: Database, label: "Normalize", color: "text-[var(--color-brand-cyan-light)]", bg: "bg-[var(--color-brand-cyan-dark)]/20" },
  { id: "infer", icon: BrainCircuit, label: "Infer", color: "text-[var(--color-brand-emerald-light)]", bg: "bg-[var(--color-brand-emerald-dark)]/20" },
  { id: "validate", icon: ShieldCheck, label: "Validate", color: "text-green-400", bg: "bg-green-400/20" },
  { id: "monitor", icon: Activity, label: "Monitor", color: "text-yellow-400", bg: "bg-yellow-400/20" },
  { id: "predict", icon: TrendingUp, label: "Predict", color: "text-orange-400", bg: "bg-orange-400/20" },
  { id: "simulate", icon: FlaskConical, label: "Simulate", color: "text-red-400", bg: "bg-red-400/20" },
  { id: "resolve", icon: Wrench, label: "Resolve", color: "text-[var(--color-brand-violet-light)]", bg: "bg-[var(--color-brand-violet-dark)]/20" },
  { id: "learn", icon: GraduationCap, label: "Learn", color: "text-purple-400", bg: "bg-purple-400/20" },
];

export function JourneyExperience() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto h-[400px] glass-panel p-12 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-white/10 -translate-y-1/2 z-0" />
      
      {/* Animated active progress line */}
      <motion.div 
        className="absolute top-1/2 left-[10%] h-1 bg-gradient-to-r from-[var(--color-brand-cyan-light)] to-[var(--color-brand-emerald-light)] -translate-y-1/2 z-0"
        initial={{ width: "0%" }}
        animate={{ width: `${(activeStep / (steps.length - 1)) * 80}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      <div className="flex justify-between w-full relative z-10 px-[10%]">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isPast = index < activeStep;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setActiveStep(index)}>
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.5 : 1,
                  backgroundColor: isActive || isPast ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.8)",
                  borderColor: isActive ? "var(--color-brand-cyan-light)" : "rgba(255,255,255,0.2)"
                }}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 transition-colors ${isActive ? step.bg : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-500'}`} />
              </motion.div>
              
              <div className="absolute bottom-16 text-center w-32 -ml-16 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white text-xs font-bold">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-8 left-0 w-full text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-bold text-white tracking-wide"
          >
            {steps[activeStep].label}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
