"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Database, Brain, Network, Monitor, Code } from "lucide-react";

const pipelineSteps = [
  { id: "collector", icon: Server, label: "Collector", desc: "Runs parallel protocol plugins (ICMP, SNMP) across edge networks." },
  { id: "observation", icon: Network, label: "Observation Engine", desc: "Emits structured JSONB observations incrementally without creating devices." },
  { id: "inference", icon: Brain, label: "Inference Engine", desc: "Merges fragmented observations into normalized entities." },
  { id: "reality", icon: Database, label: "Reality Graph", desc: "Persists the verified digital twin topology." },
  { id: "presentation", icon: Monitor, label: "Presentation Layer", desc: "Streams DTOs and SSE events to the React frontend." },
];

export function ArchitectureExperience() {
  const [activeStep, setActiveStep] = useState(pipelineSteps[0].id);

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto h-auto min-h-[500px]">
      {/* Visual Pipeline */}
      <div className="flex-1 glass-panel flex flex-col justify-center gap-4 relative p-8">
        {/* Connecting Line */}
        <div className="absolute left-[3.5rem] top-12 bottom-12 w-0.5 bg-white/10 z-0" />
        
        {pipelineSteps.map((step) => {
          const isActive = activeStep === step.id;
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className="relative z-10 flex items-center gap-6 group text-left"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[var(--color-brand-cyan-dark)] border-2 border-[var(--color-brand-cyan-light)] shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-black/50 border border-white/20 group-hover:border-white/50'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`text-lg font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {step.label}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Pane */}
      <div className="flex-1 glass-panel p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {pipelineSteps.map((step) => {
            if (step.id !== activeStep) return null;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-[var(--color-brand-cyan-light)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.label}</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {step.desc}
                </p>
                <div className="bg-black/50 rounded-lg border border-white/10 p-4 font-mono text-sm text-gray-300">
                  {/* Mock Technical Code/Payload */}
                  {step.id === 'observation' && (
                    <pre>
{`{
  "provider": "SNMP",
  "type": "IdentityObservation",
  "confidence": 0.95,
  "payload": {
    "ip": "10.0.0.12",
    "vendor": "Cisco"
  }
}`}
                    </pre>
                  )}
                  {step.id !== 'observation' && (
                    <pre className="text-gray-500 italic">
                      // Implementation details...
                    </pre>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
