"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Server, Zap, Wifi } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const nodes = [
  { id: "core-1", type: "switch", label: "Core Switch", x: 50, y: 30, delay: 0.5 },
  { id: "dist-1", type: "switch", label: "Dist-1", x: 20, y: 60, delay: 1.5 },
  { id: "dist-2", type: "switch", label: "Dist-2", x: 80, y: 60, delay: 2.0 },
  { id: "acc-1", type: "server", label: "App Server", x: 10, y: 90, delay: 3.5 },
  { id: "acc-2", type: "server", label: "DB Server", x: 30, y: 90, delay: 4.0 },
];

export function DiscoveryExperience() {
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setActiveNodes([]);
    nodes.forEach(node => {
      setTimeout(() => {
        setActiveNodes(prev => [...prev, node.id]);
      }, node.delay * 1000);
    });
    setTimeout(() => setIsScanning(false), 5000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] bg-black/50 border border-white/10 rounded-xl overflow-hidden p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4 z-10 relative">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--color-brand-emerald-light)]" />
          Live Discovery Mock
        </h3>
        <button 
          onClick={startScan}
          disabled={isScanning}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors disabled:opacity-50"
        >
          {isScanning ? "Scanning Network..." : "Start Discovery"}
        </button>
      </div>

      <div className="flex-1 relative w-full h-full">
        {/* Radar effect during scan */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[var(--color-brand-cyan-light)] bg-[var(--color-brand-cyan-dark)]/20"
            />
          )}
        </AnimatePresence>

        {/* Nodes */}
        {nodes.map(node => {
          const isVisible = activeNodes.includes(node.id);
          return (
            <AnimatePresence key={node.id}>
              {isVisible && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    {node.type === 'switch' ? <Wifi className="h-5 w-5 text-white" /> : <Server className="h-5 w-5 text-white" />}
                  </div>
                  <div className="mt-2 text-xs text-gray-300 bg-black/50 px-2 py-1 rounded border border-white/10">
                    {node.label}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
