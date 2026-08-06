"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, FastForward, Terminal, Activity, ShieldAlert, Cpu, Network, MessageSquare, ListTree, Settings, Database, Server } from "lucide-react";
import { personas, PersonaData, PersonaType } from "@/lib/personas";
import { useRuntime, useEvents } from "@/runtime/hooks/useRuntime";

export function MissionControl() {
  const runtime = useRuntime();
  const [activeTab, setActiveTab] = useState("Root Cause");
  const [activeOverlay, setActiveOverlay] = useState("Reality");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const data = personas.find(p => p.id === runtime.persona) || personas[0];
  const isPlaying = runtime.timelinePosition % 2000 !== 0; // rough heuristic since we don't have isPlaying in state, or better we just check if it changes

  // Listen for simulated AI responses
  useEvents('AI_RESPONDED', (event) => {
    setAiResponse(event.payload.response);
  });

  // When persona changes, request a new AI response for demo purposes
  useEffect(() => {
    setAiResponse(null);
    runtime.executeAction('AI_REQUESTED', { query: data.aiPrompt });
  }, [runtime.persona, data.aiPrompt, runtime]);

  return (
    <div className="w-full h-[800px] bg-[#0A0A0B] border border-white/10 rounded-xl overflow-hidden flex flex-col font-sans relative">
      
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 bg-[#111112] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Activity className="w-4 h-4 text-[var(--color-brand-cyan-light)]" />
            Workspace
          </div>
          <div className="h-4 w-px bg-white/20 mx-2" />
          <div className="flex gap-2">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => runtime.dispatch('PERSONA_CHANGED', p.id, 'MissionControl')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${runtime.persona === p.id ? 'bg-[var(--color-brand-cyan-dark)]/30 text-[var(--color-brand-cyan-light)] border border-[var(--color-brand-cyan-light)]/50' : 'text-gray-500 hover:text-gray-300 bg-white/5 border border-transparent'}`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-mono text-gray-400 bg-black px-2 py-1 rounded border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Runtime Stream
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0D0D0E] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Environment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-2"><Network className="w-4 h-4" /> Nodes</span>
                <span className="text-white font-mono font-bold">{runtime.getSnapshot()?.nodes || data.nodesCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Critical</span>
                <span className="text-red-400 font-mono font-bold">{data.criticalAlerts}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Active Context</h3>
            <div className="bg-[var(--color-brand-cyan-dark)]/10 border border-[var(--color-brand-cyan-light)]/30 p-3 rounded-lg text-sm text-[var(--color-brand-cyan-light)] leading-relaxed">
              {runtime.activeMission || data.mission}
            </div>
          </div>
        </div>

        {/* Center: Digital Twin Canvas */}
        <div className="flex-1 bg-black relative overflow-hidden flex flex-col perspective-[1000px]">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {["Intent", "Reality", "Health"].map(overlay => (
              <button 
                key={overlay}
                onClick={() => setActiveOverlay(overlay)}
                className={`px-3 py-1.5 rounded text-xs font-semibold backdrop-blur-md transition-all ${
                  activeOverlay === overlay 
                    ? 'bg-[var(--color-brand-cyan-dark)]/50 border border-[var(--color-brand-cyan-light)] text-[var(--color-brand-cyan-light)] shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {overlay}
              </button>
            ))}
          </div>
          
          <div className="flex-1 relative w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={data.id + activeOverlay}
                initial={{ opacity: 0, scale: 0.8, rotateX: 60, rotateZ: -20, y: 50 }}
                animate={{ opacity: 1, scale: 1, rotateX: 60, rotateZ: -45, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotateX: 60, rotateZ: -70, y: -50 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="absolute inset-0 flex items-center justify-center mt-32"
              >
                {/* Simulated Data Grid */}
                <div className="relative w-[500px] h-[500px] border border-white/5 bg-white/[0.02] shadow-[inset_0_0_50px_rgba(255,255,255,0.02)]">
                  
                  {/* Overlay Conditional: Intent (Logical Groupings) */}
                  {activeOverlay === "Intent" && (
                    <>
                      <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] border-2 border-[var(--color-brand-cyan-dark)] bg-[var(--color-brand-cyan-dark)]/20 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center translate-z-[20px]">
                        <span className="text-[var(--color-brand-cyan-light)] font-mono text-xl font-bold opacity-50">VPC-A</span>
                      </div>
                      <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] border-2 border-[var(--color-brand-emerald-dark)] bg-[var(--color-brand-emerald-dark)]/20 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center translate-z-[20px]">
                        <span className="text-[var(--color-brand-emerald-light)] font-mono text-xl font-bold opacity-50">EKS-PROD</span>
                      </div>
                    </>
                  )}

                  {/* SVG Connections (Floating above grid) */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible translate-z-[40px]">
                    <line x1="250" y1="250" x2="100" y2="100" stroke={activeOverlay === 'Health' ? "#22c55e" : "#4b5563"} strokeWidth="2" />
                    <line x1="250" y1="250" x2="400" y2="400" stroke={activeOverlay === 'Health' ? "#ef4444" : "#4b5563"} strokeWidth="2" strokeDasharray={activeOverlay === 'Health' ? "5 5" : "none"} className={activeOverlay === 'Health' ? 'animate-[dash_1s_linear_infinite]' : ''} />
                    <line x1="250" y1="250" x2="400" y2="100" stroke={activeOverlay === 'Health' ? "#22c55e" : "#4b5563"} strokeWidth="2" />
                    <line x1="250" y1="250" x2="100" y2="400" stroke={activeOverlay === 'Health' ? "#22c55e" : "#4b5563"} strokeWidth="2" />
                  </svg>

                  {/* Central Node */}
                  <motion.div 
                    whileHover={{ scale: 1.2, translateZ: 80 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl border-2 border-[var(--color-brand-cyan-light)] bg-black flex items-center justify-center z-10 shadow-[0_20px_50px_rgba(6,182,212,0.5)] translate-z-[60px] cursor-pointer"
                  >
                    <Database className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Satellite Nodes */}
                  <motion.div whileHover={{ scale: 1.2, translateZ: 60 }} className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-lg border border-gray-500 bg-black flex items-center justify-center translate-z-[40px] cursor-pointer">
                    <Server className={`w-5 h-5 ${activeOverlay === 'Health' ? 'text-green-400' : 'text-gray-400'}`} />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.2, translateZ: 60 }} className="absolute top-[20%] right-[20%] translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-lg border border-gray-500 bg-black flex items-center justify-center translate-z-[40px] cursor-pointer">
                    <Cpu className={`w-5 h-5 ${activeOverlay === 'Health' ? 'text-green-400' : 'text-gray-400'}`} />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.2, translateZ: 60 }} className="absolute bottom-[20%] left-[20%] -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-lg border border-gray-500 bg-black flex items-center justify-center translate-z-[40px] cursor-pointer">
                    <Network className={`w-5 h-5 ${activeOverlay === 'Health' ? 'text-green-400' : 'text-gray-400'}`} />
                  </motion.div>

                  {/* Failing Node */}
                  <motion.div 
                    whileHover={{ scale: 1.2, translateZ: 80 }} 
                    className={`absolute bottom-[20%] right-[20%] translate-x-1/2 translate-y-1/2 w-14 h-14 rounded-lg flex items-center justify-center translate-z-[50px] cursor-pointer shadow-[0_20px_30px_rgba(239,68,68,0.4)] ${activeOverlay === 'Health' ? 'bg-red-900/50 border-2 border-red-500 animate-pulse' : 'bg-black border border-gray-500'}`}
                  >
                    <Server className={`w-6 h-6 ${activeOverlay === 'Health' ? 'text-red-400' : 'text-gray-400'}`} />
                  </motion.div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar: AI Workspace */}
        <div className="w-96 border-l border-white/10 bg-[#0D0D0E] flex flex-col shrink-0">
          <div className="flex border-b border-white/10 bg-[#111112]">
            {["Root Cause", "Blast Radius", "Playbook"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-[var(--color-brand-emerald-light)] border-b-2 border-[var(--color-brand-emerald-light)] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={data.id + activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {activeTab === "Root Cause" && (
                  <>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
                      <div className="text-xs text-gray-500 font-bold mb-2">User Query</div>
                      <div className="text-sm text-white font-mono leading-relaxed">{data.aiPrompt}</div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-brand-emerald-dark)]/30 border border-[var(--color-brand-emerald-light)] flex items-center justify-center shrink-0 mt-1">
                        <MessageSquare className="w-4 h-4 text-[var(--color-brand-emerald-light)]" />
                      </div>
                      <div className="bg-[var(--color-brand-emerald-dark)]/10 border border-[var(--color-brand-emerald-light)]/20 p-4 rounded-lg rounded-tl-none w-full">
                        <div className="text-xs text-[var(--color-brand-emerald-light)] font-bold mb-2 uppercase tracking-wider">Central Eye Analysis</div>
                        {aiResponse ? (
                          <p className="text-sm text-gray-300 leading-relaxed">{aiResponse}</p>
                        ) : (
                          <div className="flex gap-1 py-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)] animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Blast Radius" && (
                  <div className="flex flex-col gap-4">
                    <div className="text-xs text-gray-400">The following services are impacted by the active incident in the <span className="text-[var(--color-brand-cyan-light)] font-bold">{data.name}</span> environment.</div>
                    
                    <div className="pl-2 border-l border-red-500/50 space-y-4 py-2 mt-2">
                      <div className="relative">
                        <div className="absolute -left-2 top-2 w-4 h-px bg-red-500/50" />
                        <div className="ml-4 p-3 bg-red-900/10 border border-red-500/30 rounded flex items-center gap-3">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          <div>
                            <div className="text-sm text-white font-bold">Primary Failure Node</div>
                            <div className="text-xs text-red-400 font-mono">CRITICAL • 100% Packet Loss</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-2 top-2 w-4 h-px bg-yellow-500/50" />
                        <div className="ml-4 p-3 bg-yellow-900/10 border border-yellow-500/30 rounded flex items-center gap-3">
                          <Activity className="w-4 h-4 text-yellow-500" />
                          <div>
                            <div className="text-sm text-white font-bold">Dependent Services (3)</div>
                            <div className="text-xs text-yellow-400 font-mono">WARNING • High Latency</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-2 top-2 w-4 h-px bg-gray-500/50" />
                        <div className="ml-4 p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3 opacity-50">
                          <Server className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-white font-bold">Edge Endpoints (45)</div>
                            <div className="text-xs text-gray-400 font-mono">UNREACHABLE</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Playbook" && (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-white font-bold">Auto-Remediation Script</div>
                      <span className="px-2 py-0.5 text-[10px] bg-[var(--color-brand-cyan-dark)] text-white rounded">Ansible</span>
                    </div>
                    
                    <div className="flex-1 bg-black rounded-lg border border-white/10 p-4 font-mono text-[10px] text-gray-300 overflow-y-auto mb-4 relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 bg-white/10 rounded hover:bg-white/20"><Terminal className="w-3 h-3 text-white" /></button>
                      </div>
                      <div className="text-blue-400">---</div>
                      <div className="text-blue-400">- name: <span className="text-green-400">Auto-Remediate {data.name} Outage</span></div>
                      <div className="text-blue-400">  hosts: <span className="text-yellow-300">affected_nodes</span></div>
                      <div className="text-blue-400">  tasks:</div>
                      <div className="text-blue-400">    - name: <span className="text-green-400">Rollback to known good configuration</span></div>
                      <div className="text-blue-400">      cisco.ios.ios_config:</div>
                      <div className="text-blue-400">        src: <span className="text-yellow-300">backup_cfg.txt</span></div>
                      <div className="text-gray-500 mt-2"># Generated by Central Eye AI</div>
                    </div>

                    <button 
                      onClick={() => alert('Simulating Playbook Execution...')}
                      className="w-full py-3 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] hover:text-black text-white rounded font-bold text-sm transition-colors flex justify-center items-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Run Playbook
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Bottom Footer: Timeline */}
      <div className="h-20 border-t border-white/10 bg-[#0A0A0B] flex items-center px-6 shrink-0 relative overflow-hidden">
        
        {/* Timeline Controls */}
        <div className="flex items-center gap-4 bg-[#111112] px-4 py-2 rounded-full border border-white/10 relative z-10 mr-8">
          <button onClick={() => runtime.resume()} className="text-white hover:text-[var(--color-brand-cyan-light)] transition-colors"><Play className="w-4 h-4" /></button>
          <button onClick={() => runtime.pause()} className="text-white hover:text-yellow-500 transition-colors"><Pause className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-white/20" />
          <button onClick={() => runtime.setSpeed(5)} className="text-gray-400 hover:text-white transition-colors flex items-center text-[10px] font-mono gap-1"><FastForward className="w-3 h-3" /> 5x</button>
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative h-full flex items-center overflow-hidden">
          <div className="absolute inset-0 flex items-center z-0">
            <div className="w-full h-0.5 bg-gray-800" />
          </div>
          
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-brand-cyan-light)] z-20 shadow-[0_0_10px_rgba(6,182,212,1)]"
            animate={{ left: "50%" }}
          />

          <div suppressHydrationWarning className="absolute left-[50%] top-2 text-[10px] text-[var(--color-brand-cyan-light)] font-bold font-mono">
            {new Date(runtime.timelinePosition).toLocaleTimeString()}
          </div>
        </div>

      </div>

    </div>
  );
}
