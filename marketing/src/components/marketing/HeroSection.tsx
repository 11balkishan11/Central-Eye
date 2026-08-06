"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Network, Server, Cloud, Cpu, Database } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Opacities for different stages
  const stage1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]); // Single laptop/node
  const stage2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.4], [0, 1, 0]); // Office (10 nodes)
  const stage3Opacity = useTransform(scrollYProgress, [0.35, 0.45, 0.6], [0, 1, 0]); // Campus (100 nodes)
  const stage4Opacity = useTransform(scrollYProgress, [0.55, 0.65, 0.8], [0, 1, 0]); // Global (1000s nodes)
  const stage5Opacity = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]); // Digital Twin / AI Layer

  // Scales for a zoom effect
  const globalScale = useTransform(scrollYProgress, [0, 1], [1, 2]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-black">
      
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Background glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-cyan-dark)] rounded-full blur-[150px] opacity-20" />
        </div>

        {/* Text Content (Fades out as scroll begins) */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
          className="relative z-20 max-w-5xl mx-auto px-4 text-center mt-[8vh] md:mt-[12vh] mb-auto"
        >
          {/* Animated Main Header (Tagline) */}
          <motion.div 
            className="mb-4 cursor-pointer w-full"
            style={{ perspective: 1000 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white inline-block drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              initial={{ opacity: 0, y: 40, rotateX: -90, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.1, type: "spring", bounce: 0.4 }}
              whileHover={{ 
                rotateX: 15, 
                rotateY: -10, 
                textShadow: "0px 15px 50px rgba(6,182,212,0.9)",
              }}
            >
              Central Eye <span className="text-[var(--color-brand-cyan-light)] mx-1 md:mx-3 opacity-80">|</span> 
              <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--color-brand-cyan-light)] to-[var(--color-brand-emerald-light)] animate-pulse">
                Where everyone can rely.
              </span>
            </motion.h1>
          </motion.div>

          {/* Sub Header */}
          <motion.h2 
            className="text-lg md:text-2xl lg:text-3xl font-light text-gray-400 mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            The AI-Powered Network <span className="font-semibold text-white">Digital Twin Platform.</span>
          </motion.h2>

          {/* Runtime Badge */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-emerald-light)] animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-gray-300">Central Eye v1.1 Runtime</span>
          </motion.div>

          <div className="flex justify-center gap-4">
            <Link href="/lab" className="px-8 py-4 text-sm font-semibold text-black bg-white rounded-md hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Enter Mission Control
            </Link>
          </div>
        </motion.div>

        {/* Visualization Layers */}
        <motion.div style={{ scale: globalScale }} className="absolute inset-x-0 bottom-0 top-[50vh] md:top-[45vh] z-10 pointer-events-none flex items-center justify-center pb-[10vh]">
          
          {/* Stage 1: Single Node */}
          <motion.div style={{ opacity: stage1Opacity }} className="absolute flex flex-col items-center">
            <div className="w-16 h-16 border border-white/20 rounded-xl bg-white/5 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Cpu className="w-8 h-8 text-white" />
              <div className="absolute inset-0 border border-[var(--color-brand-cyan-light)] rounded-xl animate-ping opacity-50" />
            </div>
            <div className="mt-4 text-sm font-bold text-gray-400 font-mono tracking-widest">1 NODE</div>
          </motion.div>

          {/* Stage 2: Office Cluster */}
          <motion.div style={{ opacity: stage2Opacity }} className="absolute flex flex-col items-center">
            <div className="relative w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
              <Server className="w-10 h-10 text-[var(--color-brand-cyan-light)] absolute top-4" />
              <Server className="w-10 h-10 text-[var(--color-brand-cyan-light)] absolute bottom-4" />
              <Server className="w-10 h-10 text-[var(--color-brand-cyan-light)] absolute left-4" />
              <Server className="w-10 h-10 text-[var(--color-brand-cyan-light)] absolute right-4" />
              <Network className="w-12 h-12 text-white" />
              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full -z-10" overflow="visible">
                <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="50%" y2="90%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="10%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            </div>
            <div className="mt-8 text-xl font-bold text-gray-400 font-mono tracking-widest">50 NODES (CAMPUS)</div>
          </motion.div>

          {/* Stage 3: WAN */}
          <motion.div style={{ opacity: stage3Opacity }} className="absolute flex flex-col items-center">
            <div className="relative w-[600px] h-[400px]">
              <div className="absolute top-0 left-0 p-4 border border-white/10 rounded-full bg-white/5"><Database className="text-white"/></div>
              <div className="absolute top-0 right-0 p-4 border border-white/10 rounded-full bg-white/5"><Database className="text-white"/></div>
              <div className="absolute bottom-0 left-0 p-4 border border-white/10 rounded-full bg-white/5"><Database className="text-white"/></div>
              <div className="absolute bottom-0 right-0 p-4 border border-white/10 rounded-full bg-white/5"><Database className="text-white"/></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 border border-[var(--color-brand-cyan-light)] rounded-full bg-[var(--color-brand-cyan-dark)]/20 shadow-[0_0_50px_rgba(6,182,212,0.3)]"><Cloud className="w-16 h-16 text-[var(--color-brand-cyan-light)]"/></div>
              {/* Complex web of lines */}
              <svg className="absolute inset-0 w-full h-full -z-10" overflow="visible">
                <path d="M50,50 Q300,200 550,50" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" strokeDasharray="5 5" />
                <path d="M50,350 Q300,200 550,350" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" strokeDasharray="5 5" />
                <line x1="50" y1="50" x2="300" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="550" y1="50" x2="300" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="50" y1="350" x2="300" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <line x1="550" y1="350" x2="300" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            </div>
            <div className="mt-12 text-3xl font-bold text-gray-400 font-mono tracking-widest">1,000 NODES (GLOBAL WAN)</div>
          </motion.div>

          {/* Stage 4: Massive Cloud Architecture Abstract */}
          <motion.div style={{ opacity: stage4Opacity }} className="absolute flex flex-col items-center justify-center w-full h-full">
            <div className="relative w-full max-w-4xl h-[600px] border border-white/5 rounded-3xl bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-radial from-[var(--color-brand-emerald-dark)]/20 to-transparent blur-xl" />
              <div className="grid grid-cols-12 grid-rows-12 gap-2 w-full h-full p-8 opacity-40">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${i % 11 === 0 ? 'bg-[var(--color-brand-cyan-light)] animate-pulse' : i % 23 === 0 ? 'bg-red-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div className="mt-8 text-4xl font-extrabold text-white font-mono tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">15,000+ NODES (CLOUD SCALE)</div>
          </motion.div>

          {/* Stage 5: Digital Twin / The Reality Graph */}
          <motion.div style={{ opacity: stage5Opacity }} className="absolute flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 mb-8 rounded-full bg-[var(--color-brand-cyan-dark)]/30 border-2 border-[var(--color-brand-cyan-light)] shadow-[0_0_100px_rgba(6,182,212,0.8)] flex items-center justify-center">
              <Network className="w-16 h-16 text-[var(--color-brand-cyan-light)] animate-pulse" />
            </div>
            <h2 className="text-6xl font-extrabold text-white mb-6">The Reality Graph</h2>
            <p className="text-2xl text-[var(--color-brand-cyan-light)] max-w-3xl">One unified data model mapping everything from a BGP session to a Kubernetes cluster.</p>
          </motion.div>

        </motion.div>
      </div>
      
    </section>
  );
}
