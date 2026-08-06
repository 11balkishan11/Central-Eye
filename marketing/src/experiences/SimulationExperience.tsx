"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PowerOff, Server, Wifi, AlertTriangle } from "lucide-react";

export function SimulationExperience() {
  const [simulationActive, setSimulationActive] = useState(false);

  return (
    <div className="w-full h-[600px] flex flex-col md:flex-row gap-6">
      {/* Network Map / Topology Area */}
      <div className="flex-[2] glass-panel relative overflow-hidden bg-black/40">
        <div className="absolute top-4 left-4 z-20 flex gap-4 items-center">
          <button 
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition-all ${simulationActive ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_red]' : 'bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'}`}
          >
            <PowerOff className="w-4 h-4" />
            {simulationActive ? "Reset Network" : "Disable Core Switch (ny-core-01)"}
          </button>
        </div>

        {/* Mock Nodes */}
        <div className="absolute inset-0 flex items-center justify-center pt-16">
          <div className="relative w-[80%] h-[80%]">
            
            {/* Core Switch */}
            <motion.div 
              animate={{ opacity: simulationActive ? 0.2 : 1, filter: simulationActive ? 'grayscale(100%)' : 'grayscale(0%)' }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl border border-[var(--color-brand-cyan-light)] bg-[var(--color-brand-cyan-dark)]/20 flex items-center justify-center z-10"
            >
              <Wifi className="w-8 h-8 text-white" />
              {simulationActive && (
                <div className="absolute -top-3 -right-3 text-red-500 font-bold text-xs bg-black px-1 rounded border border-red-500">DOWN</div>
              )}
            </motion.div>

            {/* Connecting Links (Simplified using absolute divs) */}
            <motion.div 
              animate={{ opacity: simulationActive ? 0.1 : 0.5, backgroundColor: simulationActive ? '#ef4444' : '#22d3ee' }}
              className="absolute top-[35%] left-1/4 w-[25%] h-1 bg-[var(--color-brand-cyan-light)] origin-top-left rotate-[35deg] -z-10"
            />
            <motion.div 
              animate={{ opacity: simulationActive ? 0.1 : 0.5, backgroundColor: simulationActive ? '#ef4444' : '#22d3ee' }}
              className="absolute top-[35%] right-1/4 w-[25%] h-1 bg-[var(--color-brand-cyan-light)] origin-top-right -rotate-[35deg] -z-10"
            />

            {/* Distribution Switches */}
            <motion.div 
              animate={{ borderColor: simulationActive ? '#ef4444' : 'rgba(255,255,255,0.2)' }}
              className="absolute top-1/2 left-1/4 -translate-x-1/2 w-12 h-12 rounded-xl border bg-white/5 flex flex-col items-center justify-center z-10"
            >
              <Wifi className="w-5 h-5 text-gray-300" />
            </motion.div>
            
            <motion.div 
              animate={{ borderColor: simulationActive ? '#ef4444' : 'rgba(255,255,255,0.2)' }}
              className="absolute top-1/2 right-1/4 translate-x-1/2 w-12 h-12 rounded-xl border bg-white/5 flex flex-col items-center justify-center z-10"
            >
              <Wifi className="w-5 h-5 text-gray-300" />
            </motion.div>

            {/* Blast Radius Visual (Expanding circles) */}
            <AnimatePresence>
              {simulationActive && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-red-500 bg-red-500/10 pointer-events-none"
                />
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* AI Panel Area */}
      <div className="flex-1 glass-panel flex flex-col relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-4 p-6 pb-0">Simulation Findings</h3>
        <div className="flex-1 p-6 overflow-y-auto">
          {!simulationActive ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center">
              Run a simulation to calculate the blast radius and impact of an infrastructure change.
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Impact Detected
                </div>
                <p className="text-sm text-gray-300">Disabling `ny-core-01` will isolate 4 distribution switches and sever connectivity to the secondary datacenter.</p>
              </div>

              <div>
                <h4 className="text-[var(--color-brand-cyan-light)] font-bold text-sm uppercase mb-2">Blast Radius</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex justify-between"><span>Disconnected Devices</span> <span className="text-white font-mono">142</span></li>
                  <li className="flex justify-between"><span>Orphaned BGP Sessions</span> <span className="text-white font-mono">14</span></li>
                  <li className="flex justify-between"><span>Impacted Applications</span> <span className="text-white font-mono text-red-400 font-bold">2 (SAP, HR Portal)</span></li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-lg mt-auto">
                <h4 className="text-sm font-bold text-white mb-2">AI Recommendation</h4>
                <p className="text-xs text-gray-400 mb-4">Traffic cannot fail over because OSPF cost on the backup link (`ny-core-02`) is misconfigured. Update the OSPF cost on `GigabitEthernet0/1` before proceeding with maintenance.</p>
                <button className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">Generate Remediation Playbook</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
