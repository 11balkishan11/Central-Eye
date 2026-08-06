"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, Clock, Server, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { useRuntime, useEvents } from '../hooks/useRuntime';
import { RuntimeEvent } from '../events/event-types';

export function RuntimeInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const runtime = useRuntime();
  
  const [events, setEvents] = useState<RuntimeEvent[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'I' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Subscribe to ALL events to populate the inspector
  useEvents('*', (event) => {
    if (isOpen) {
      setEvents(prev => [event, ...prev].slice(0, 50));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 w-96 bg-[#0D0D0E]/95 backdrop-blur-xl border border-[var(--color-brand-cyan-dark)] rounded-xl shadow-2xl z-[9999] overflow-hidden font-mono text-xs flex flex-col h-[500px]"
      >
        <div className="bg-[#111112] border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-brand-cyan-light)] font-bold">
            <Activity className="w-4 h-4" /> Runtime Inspector v1.1
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/10 bg-black/20">
          <div>
            <div className="text-gray-500 mb-1">State</div>
            <div className="text-white truncate">Persona: {runtime.persona}</div>
            <div className="text-white truncate">Mission: {runtime.activeMission || 'None'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Provider</div>
            <div className="text-[var(--color-brand-emerald-light)] flex items-center gap-1">
              <Server className="w-3 h-3" /> Mock
            </div>
            <div className="text-white mt-1">Nodes: {runtime.getSnapshot()?.nodes || 0}</div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 bg-black/20">
          <div className="text-gray-500 mb-2 flex justify-between">
            <span>Scheduler Time controls</span>
            <span className="text-white">{new Date(runtime.timelinePosition).toLocaleTimeString()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => runtime.resume()} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 flex items-center justify-center"><Play className="w-3 h-3" /></button>
            <button onClick={() => runtime.pause()} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 flex items-center justify-center"><Pause className="w-3 h-3" /></button>
            <button onClick={() => runtime.setSpeed(2)} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 flex items-center justify-center gap-1"><FastForward className="w-3 h-3" /> 2x</button>
            <button onClick={() => runtime.setSpeed(5)} className="flex-1 bg-white/5 hover:bg-white/10 rounded py-1 flex items-center justify-center gap-1"><FastForward className="w-3 h-3" /> 5x</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {events.length === 0 ? (
            <div className="text-gray-600 text-center py-4">Waiting for events...</div>
          ) : (
            events.map((e, i) => (
              <div key={i} className="flex flex-col py-1 border-b border-white/5 last:border-0">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[var(--color-brand-cyan-light)]">{e.type}</span>
                  <span className="text-gray-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                {e.source && <div className="text-gray-600">src: {e.source}</div>}
                <div className="text-gray-400 truncate overflow-hidden whitespace-nowrap text-[9px] mt-0.5">
                  {JSON.stringify(e.payload)}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
