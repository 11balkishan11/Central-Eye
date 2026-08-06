"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";
import { useRef } from "react";

export function DemoGateway() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="min-h-[90vh] bg-black flex items-center justify-center overflow-hidden border-b border-white/5 py-20 px-4">
      
      <motion.div 
        style={{ scale, opacity }}
        className="w-full max-w-5xl aspect-video relative rounded-3xl border border-white/10 overflow-hidden group shadow-[0_0_100px_rgba(6,182,212,0.1)] flex items-center justify-center"
      >
        {/* Background gradient simulating the app */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] to-[#111] z-0" />
        
        {/* Glowing grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] z-0 opacity-50" />
        
        {/* Large Play CTA overlay */}
        <div className="relative z-10 flex flex-col items-center text-center p-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="w-20 h-20 bg-[var(--color-brand-cyan-light)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform duration-500">
            <Terminal className="w-10 h-10 text-black" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Ready To Experience It?</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-8">
            Launch the live product demo and see how Central Eye transforms infrastructure into understanding.
          </p>
          
          <Link href="/demo" className="flex items-center gap-2 px-10 py-5 text-lg font-bold text-black bg-white rounded-md hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Launch Live Demo <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

      </motion.div>

    </section>
  );
}
