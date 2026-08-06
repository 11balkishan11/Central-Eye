"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { useState } from "react";

export function HomepageHero() {
  const [selectedPersona, setSelectedPersona] = useState<"CTO" | "Architect" | "Engineer">("CTO");

  return (
    <section className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden pt-20">
      
      {/* Background glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-[var(--color-brand-cyan-dark)] rounded-full blur-[200px] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* The Persona Selector - "Start in 60 Seconds" */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 flex flex-col items-center"
        >
          <span className="text-sm font-bold tracking-widest uppercase text-gray-500 mb-4">Start in 60 Seconds. Who are you?</span>
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
            {(["CTO", "Architect", "Engineer"] as const).map(persona => (
              <button
                key={persona}
                onClick={() => setSelectedPersona(persona)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedPersona === persona
                    ? "bg-[var(--color-brand-cyan-dark)] text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {persona}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Hook based on Persona */}
        <motion.div
          key={selectedPersona}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {selectedPersona === "CTO" && (
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              The end of <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">operational blindness.</span>
            </h1>
          )}
          {selectedPersona === "Architect" && (
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Architect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-cyan-light)] to-[var(--color-brand-emerald-light)]">absolute confidence.</span>
            </h1>
          )}
          {selectedPersona === "Engineer" && (
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Infrastructure should <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-violet-light)] to-[var(--color-brand-cyan-light)]">explain itself.</span>
            </h1>
          )}
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mb-12 leading-relaxed"
        >
          Central Eye transforms infrastructure into understanding. Stop guessing. Start observing reality.
        </motion.p>

        {/* Dynamic CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {selectedPersona === "CTO" && (
             <Link href="/enterprise" className="flex items-center gap-2 px-8 py-4 text-base font-bold text-black bg-white rounded hover:bg-gray-200 transition-colors">
               Read The Manifesto <ArrowRight className="w-5 h-5" />
             </Link>
          )}
          {selectedPersona === "Architect" && (
             <Link href="/platform" className="flex items-center gap-2 px-8 py-4 text-base font-bold text-black bg-[var(--color-brand-cyan-light)] rounded hover:bg-[var(--color-brand-cyan-dark)] hover:text-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]">
               Explore The Platform <ArrowRight className="w-5 h-5" />
             </Link>
          )}
          {selectedPersona === "Engineer" && (
             <Link href="/demo" className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-[var(--color-brand-emerald-dark)] rounded hover:bg-[var(--color-brand-emerald-light)] hover:text-black transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">
               <Terminal className="w-5 h-5" /> Launch Live Demo
             </Link>
          )}
        </motion.div>
        
      </div>
      
    </section>
  );
}
