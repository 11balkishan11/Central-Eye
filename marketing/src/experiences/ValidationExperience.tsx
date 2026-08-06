"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export function ValidationExperience() {
  const [hoveredState, setHoveredState] = useState<"healthy" | "drift" | "violation">("healthy");

  return (
    <div className="w-full max-w-4xl mx-auto h-[500px] flex flex-col md:flex-row gap-6">
      {/* Node Visualization */}
      <div className="flex-1 glass-panel flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 left-4 text-sm font-bold text-gray-400">Hover the Firewall</div>
        
        <motion.div 
          className={`w-32 h-32 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 border-2 shadow-2xl relative
            ${hoveredState === 'healthy' ? 'bg-[var(--color-brand-emerald-dark)]/20 border-[var(--color-brand-emerald-light)]' : ''}
            ${hoveredState === 'drift' ? 'bg-yellow-500/20 border-yellow-500' : ''}
            ${hoveredState === 'violation' ? 'bg-red-500/20 border-red-500' : ''}
          `}
          onHoverStart={() => setHoveredState("drift")}
          onHoverEnd={() => setHoveredState("healthy")}
          onClick={() => setHoveredState("violation")}
        >
          {hoveredState === "healthy" && <Shield className="w-12 h-12 text-[var(--color-brand-emerald-light)]" />}
          {hoveredState === "drift" && <AlertTriangle className="w-12 h-12 text-yellow-500" />}
          {hoveredState === "violation" && <ShieldAlert className="w-12 h-12 text-red-500" />}
          
          <div className="mt-4 font-mono text-xs text-white">fw-core-01</div>
          
          {/* Radar ripple for violations */}
          {hoveredState === "violation" && (
            <motion.div 
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-2xl border-2 border-red-500"
            />
          )}
        </motion.div>
        
        <div className="absolute bottom-4 text-xs text-gray-500">Click node to simulate active violation</div>
      </div>

      {/* Context Panel */}
      <div className="flex-1 glass-panel p-6 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Validation Context</h3>
        
        <AnimatePresence mode="wait">
          {hoveredState === "healthy" && (
            <motion.div key="healthy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-[var(--color-brand-emerald-light)]" />
                <span className="text-lg font-semibold text-white">Intent Matches Reality</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">No configuration drift detected. Firewall rules match the desired state defined in the repository.</p>
            </motion.div>
          )}

          {hoveredState === "drift" && (
            <motion.div key="drift" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-semibold text-white">Configuration Drift Detected</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">A local administrator has modified the running configuration via SSH, bypassing the CI/CD pipeline.</p>
              
              <div className="bg-black/50 p-3 rounded font-mono text-xs mb-4">
                <div className="text-red-400">- permit tcp any any eq 22</div>
                <div className="text-green-400">+ permit ip any any</div>
              </div>
              
              <div className="flex items-center text-[var(--color-brand-cyan-light)] text-sm cursor-pointer hover:underline">
                View Drift Diff <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          )}

          {hoveredState === "violation" && (
            <motion.div key="violation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold text-white">Critical Policy Violation</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">The configuration drift has resulted in a critical security violation against corporate intent policies.</p>
              
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-red-200 mb-6">
                <strong>Policy: SEC-004</strong><br/>
                "Global Any-to-Any IP allow rules are strictly prohibited on edge firewalls."
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="text-xs text-[var(--color-brand-cyan-light)] font-bold mb-2 uppercase tracking-wider">AI Recommendation</div>
                <p className="text-sm text-gray-300 mb-3">Revert running config to startup config, or deploy the automated remediation playbook to restore `permit tcp any any eq 22`.</p>
                <button className="px-4 py-2 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] text-white text-sm font-semibold rounded transition-colors w-full">
                  Execute Remediation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
