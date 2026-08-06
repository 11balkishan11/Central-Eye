import { JourneyExperience } from "@/experiences/JourneyExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";

export default function JourneyPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            The Enterprise Journey
          </h1>
          <p className="text-xl text-gray-400">
            From raw protocol data to automated reality graphs. See how Central Eye transforms your operational workflow end-to-end.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Lifecycle of a Network Event</h2>
          <JourneyExperience />
        </div>

        {/* Detailed Stages */}
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row gap-8 items-center glass-panel p-8 border border-[var(--color-brand-cyan-dark)]/50 bg-gradient-to-r from-[var(--color-brand-cyan-dark)]/10 to-transparent">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Phase 1: Acquisition</h3>
              <p className="text-gray-400 mb-4">
                The platform does not rely on manual inventory. Instead, it continuously <strong>Discovers</strong> endpoints and <strong>Observes</strong> their behavior using massively concurrent protocol plugins.
              </p>
              <Link href="/platform/discovery" className="text-[var(--color-brand-cyan-light)] text-sm font-bold hover:underline">Read about the Discovery Engine &rarr;</Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 items-center glass-panel p-8 border border-[var(--color-brand-emerald-dark)]/50 bg-gradient-to-l from-[var(--color-brand-emerald-dark)]/10 to-transparent">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Phase 2: The Digital Twin</h3>
              <p className="text-gray-400 mb-4">
                Raw observations are meaningless on their own. Central Eye <strong>Normalizes</strong> the multi-vendor data into unified schemas, and <strong>Infers</strong> the true Layer 2/3 topology, assembling the Reality Graph.
              </p>
              <Link href="/platform/digital-twin" className="text-[var(--color-brand-emerald-light)] text-sm font-bold hover:underline">Explore the Digital Twin &rarr;</Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center glass-panel p-8 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Phase 3: Operations</h3>
              <p className="text-gray-400 mb-4">
                With the graph assembled, Central Eye continuously <strong>Validates</strong> Reality against Intent, and contextually <strong>Monitors</strong> health alerts mapped to actual service impacts.
              </p>
              <div className="flex gap-4">
                <Link href="/platform/validation" className="text-yellow-400 text-sm font-bold hover:underline">Validation &rarr;</Link>
                <Link href="/platform/monitoring" className="text-yellow-400 text-sm font-bold hover:underline">Monitoring &rarr;</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 items-center glass-panel p-8 border border-red-500/30 bg-gradient-to-l from-red-500/10 to-transparent">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Phase 4: Automation</h3>
              <p className="text-gray-400 mb-4">
                Instead of hoping changes work, engineers <strong>Predict</strong> blast radiuses by <strong>Simulating</strong> outages safely, before using AI to automatically <strong>Resolve</strong> policy violations.
              </p>
              <Link href="/platform/simulation" className="text-red-400 text-sm font-bold hover:underline">Experience Simulation &rarr;</Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
