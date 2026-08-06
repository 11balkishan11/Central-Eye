import { MissionControl } from "@/experiences/MissionControl";
import { Terminal, ShieldAlert, GitMerge } from "lucide-react";

export default function LabPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] mb-6">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-cyan-light)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-brand-cyan-light)]"></span>
            </span>
            <span className="text-sm font-bold text-[var(--color-brand-cyan-light)]">Live Demo Environment</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Mission Control Lab
          </h1>
          <p className="text-xl text-gray-400">
            Select a persona below to load a simulated enterprise topology. Investigate active alerts, traverse the Digital Twin, and execute AI-assisted root cause analysis.
          </p>
        </div>

        {/* The Interactive Lab */}
        <div className="mb-24">
          <MissionControl />
        </div>

      </div>
    </div>
  );
}
