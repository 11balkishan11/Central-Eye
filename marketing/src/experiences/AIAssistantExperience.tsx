"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Terminal, Activity, AlertTriangle, ShieldCheck, User } from "lucide-react";

const queries = [
  "Why is the Finance department losing connectivity?",
  "Show me the blast radius if I upgrade fw-core-01",
  "Summarize yesterday's configuration drift"
];

export function AIAssistantExperience() {
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleQuery = (q: string) => {
    setActiveQuery(q);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500); // Simulate AI thinking
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col glass-panel overflow-hidden border border-white/10">
      {/* Header */}
      <div className="bg-black/50 p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] flex items-center justify-center">
          <Terminal className="w-4 h-4 text-[var(--color-brand-cyan-light)]" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Central Eye Enterprise AI</h3>
          <p className="text-xs text-[var(--color-brand-emerald-light)] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-emerald-light)] animate-pulse" />
            Connected to Digital Twin (Real-time Context)
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-black/40">
        <AnimatePresence>
          {!activeQuery ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="m-auto text-center"
            >
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">Ask me anything about your topology, incidents, or policies.</p>
              <div className="flex flex-col gap-3">
                {queries.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleQuery(q)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left text-gray-300 transition-colors flex items-center gap-3 group"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-white" />
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {/* User Message */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="self-end max-w-[80%] flex gap-3"
              >
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl rounded-tr-sm text-sm text-white">
                  {activeQuery}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              </motion.div>

              {/* AI Response */}
              {isTyping ? (
                <div className="flex gap-2 items-center text-gray-500 text-sm ml-12">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="self-start max-w-[90%] flex gap-3"
                >
                  <div className="w-8 h-8 rounded bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4 text-[var(--color-brand-cyan-light)]" />
                  </div>
                  <div className="bg-black/60 border border-white/10 p-5 rounded-2xl rounded-tl-sm text-sm text-white shadow-lg space-y-4">
                    {activeQuery === queries[0] && (
                      <>
                        <div className="flex items-center gap-2 text-red-400 font-bold border-b border-white/10 pb-2">
                          <AlertTriangle className="w-4 h-4" /> BGP Neighbor Down: dist-fin-01
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          Connectivity to the Finance VLAN has dropped by 100% in the last 15 minutes. 
                          The root cause is a BGP neighbor flap on <code>dist-fin-01</code>.
                        </p>
                        
                        <div className="bg-black/40 border border-white/5 rounded p-3 text-xs space-y-2 font-mono">
                          <div className="text-gray-400">Timeline:</div>
                          <div className="text-yellow-400">14:02:11 - Configuration drift detected on dist-fin-01.</div>
                          <div className="text-red-400">14:02:15 - BGP Peer 10.1.4.2 State: Idle</div>
                          <div className="text-red-500">14:03:00 - Synthetic transactions to SAP ERP failed.</div>
                        </div>

                        <div>
                          <span className="text-[var(--color-brand-emerald-light)] font-bold">Evidence:</span>
                          <p className="text-gray-400 mt-1">A junior engineer modified the route-map <code>FIN_OUT</code> via SSH, accidentally dropping the default route.</p>
                        </div>

                        <div className="bg-[var(--color-brand-cyan-dark)]/10 border border-[var(--color-brand-cyan-light)]/30 rounded p-3">
                          <span className="text-[var(--color-brand-cyan-light)] font-bold flex items-center gap-1 mb-2">
                            <ShieldCheck className="w-4 h-4" /> Remediation Playbook Ready
                          </span>
                          <p className="text-gray-300 text-xs mb-3">Revert route-map FIN_OUT to the startup configuration from 14:00.</p>
                          <button className="px-4 py-2 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] text-white text-xs font-bold rounded">
                            Execute Rollback
                          </button>
                        </div>
                      </>
                    )}
                    {activeQuery !== queries[0] && (
                      <p className="text-gray-400 italic">Predefined response triggered. (Select the first query for the full demo).</p>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer / Input mock */}
      <div className="bg-black/50 p-4 border-t border-white/10 flex gap-2">
        <button 
          onClick={() => setActiveQuery(null)}
          className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded bg-white/5 border border-white/10"
        >
          Reset Chat
        </button>
        <div className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2 text-sm text-gray-500 flex items-center">
          Type your query here...
        </div>
      </div>
    </div>
  );
}
