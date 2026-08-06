"use client";

import { motion } from "framer-motion";
import { Network, Database, Brain, Activity, CheckCircle2, ShieldAlert, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

const TIMELINE = [
  { time: "09:12", icon: ShieldAlert, color: "text-red-500", text: "Finance loses connection to SAP.", active: false },
  { time: "09:13", icon: Activity, color: "text-yellow-500", text: "Collector observes interface errors on Core-RTR-02.", active: false },
  { time: "09:14", icon: Network, color: "text-[var(--color-brand-cyan-light)]", text: "Graph identifies implicit dependency to SAP cluster.", active: false },
  { time: "09:15", icon: Brain, color: "text-[var(--color-brand-emerald-light)]", text: "AI explains root cause: BGP route flap.", active: false },
  { time: "09:16", icon: Activity, color: "text-[var(--color-brand-violet-light)]", text: "Simulation verifies automated rollback fix.", active: false },
  { time: "09:17", icon: CheckCircle2, color: "text-green-500", text: "System recovered.", active: false },
];

export function IncidentReplay() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev < TIMELINE.length - 1 ? prev + 1 : prev));
    }, 2000); // Progress every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen bg-black border-b border-white/5 py-32 flex flex-col items-center justify-center overflow-hidden">
      
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Watch It Solve A Real Incident</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          No dashboards. No war rooms. Just an engine that understands reality.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 relative">
        {/* Connection Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 md:block hidden" />

        <div className="flex flex-col gap-8">
          {TIMELINE.map((step, index) => {
            const isActive = index <= activeIndex;
            const isCurrent = index === activeIndex;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isActive ? 1 : 0.2, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative flex items-center md:justify-between w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
              >
                
                {/* Mobile Line */}
                <div className="absolute left-6 top-0 bottom-[-2rem] w-px bg-white/10 md:hidden" />

                {/* Content */}
                <div className={`w-full md:w-5/12 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} relative z-10`}>
                  <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isCurrent ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-105' : isActive ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent'}`}>
                    <div className="flex items-center gap-3 mb-2 justify-start md:justify-inherit">
                      <span className="font-mono text-sm text-gray-400">{step.time}</span>
                    </div>
                    <p className={`text-lg md:text-xl font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                      {step.text}
                    </p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-black bg-[#111] flex items-center justify-center z-20 transition-all duration-500 shadow-xl" style={{ borderColor: isActive ? 'black' : '#111' }}>
                  <step.icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-700'}`} />
                  {isCurrent && (
                    <motion.div 
                      className={`absolute inset-0 rounded-full border-2 border-current opacity-50 ${step.color}`}
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Empty Space for balancing */}
                <div className="hidden md:block w-5/12" />

              </motion.div>
            );
          })}
        </div>

      </div>

      {activeIndex === TIMELINE.length - 1 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16"
        >
           <button 
             onClick={() => setActiveIndex(0)}
             className="px-6 py-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold flex items-center gap-2"
           >
             <RotateCcw className="w-4 h-4" /> Replay Incident
           </button>
        </motion.div>
      )}

    </section>
  );
}
