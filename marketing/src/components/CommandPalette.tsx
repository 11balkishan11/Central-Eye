"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Terminal, Network, Shield, Settings, Server, Cpu, Navigation, Zap, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRuntime } from "@/runtime/hooks/useRuntime";

const commands = [
  { id: "c1", name: "Investigate Active Outage", icon: Zap, action: 'AI_REQUESTED', payload: { query: 'Investigate the active outage' }, category: "Operations", path: "/lab" },
  { id: "c2", name: "Run Network Discovery", icon: Search, action: 'START_DISCOVERY', payload: {}, category: "Operations", path: "/platform/discovery" },
  { id: "c3", name: "Switch to Hospital Persona", icon: Activity, action: 'PERSONA_CHANGED', payload: 'Hospital', category: "Environment" },
  { id: "c4", name: "Switch to Enterprise Campus", icon: Network, action: 'PERSONA_CHANGED', payload: 'Enterprise', category: "Environment" },
  { id: "c5", name: "Simulate BGP Failure", icon: Cpu, action: 'SIMULATE_FAILURE', payload: { type: 'BGP' }, category: "Simulation", path: "/platform/simulation" },
  { id: "c6", name: "Build Enterprise Quote", icon: Settings, action: null, payload: null, category: "Business", path: "/pricing" },
  { id: "c7", name: "View API Documentation", icon: Terminal, action: null, payload: null, category: "Developers", path: "/api-docs" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const runtime = useRuntime();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredCommands = query === "" 
    ? commands 
    : commands.filter((cmd) => cmd.name.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (cmd: typeof commands[0]) => {
    setIsOpen(false);
    setQuery("");
    
    if (cmd.path) {
      router.push(cmd.path);
    }
    
    if (cmd.action) {
      // Small delay to allow route transition before dispatching
      setTimeout(() => {
        runtime.dispatch(cmd.action as any, cmd.payload, 'CommandPalette');
        if (cmd.action === 'AI_REQUESTED') {
          runtime.executeAction(cmd.action, cmd.payload);
        }
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-[#0D0D0E] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Search commands, actions, or workspaces..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">ESC</div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--color-brand-cyan-dark)]/20 hover:text-[var(--color-brand-cyan-light)] text-left group transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-cyan-dark)]/40 group-hover:text-[var(--color-brand-cyan-light)] text-gray-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-200 group-hover:text-white">{cmd.name}</div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium tracking-wider uppercase group-hover:text-[var(--color-brand-cyan-light)]/70">
                          {cmd.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-white/10 bg-[#111112] text-xs text-gray-500 flex justify-between items-center">
              <span><span className="font-mono text-gray-400">↑↓</span> to navigate</span>
              <span><span className="font-mono text-gray-400">Enter</span> to execute</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
