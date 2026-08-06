import { SimulationExperience } from "@/experiences/SimulationExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SimulationPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            "What If" Simulation Engine
          </h1>
          <p className="text-xl text-gray-400">
            Predict the exact blast radius of outages, maintenance windows, and configuration changes before they hit production.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Experience</h2>
          <SimulationExperience />
        </div>

        {/* Deep Dive */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Stop guessing. Start knowing.</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Traditional networks rely on institutional knowledge to understand what will happen if a core router goes offline. Central Eye's Simulation Engine changes this by spinning up a lightweight clone of the Reality Graph.
            </p>
            <p className="text-gray-400 leading-relaxed">
              When you simulate disabling a node or a link, the engine calculates the OSPF/BGP convergence, maps the orphaned dependencies, and instantly surfaces the applications that will experience downtime.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <GlassPanel hoverEffect className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-cyan-dark)]/20 flex items-center justify-center text-[var(--color-brand-cyan-light)] font-bold text-xl">1</div>
              <div>
                <h4 className="text-white font-bold">Propose a change</h4>
                <p className="text-sm text-gray-400">Select a device, link, or BGP neighbor to modify.</p>
              </div>
            </GlassPanel>
            <GlassPanel hoverEffect className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-emerald-dark)]/20 flex items-center justify-center text-[var(--color-brand-emerald-light)] font-bold text-xl">2</div>
              <div>
                <h4 className="text-white font-bold">Calculate Blast Radius</h4>
                <p className="text-sm text-gray-400">The engine simulates routing and spanning-tree convergence.</p>
              </div>
            </GlassPanel>
            <GlassPanel hoverEffect className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-violet-dark)]/20 flex items-center justify-center text-[var(--color-brand-violet-light)] font-bold text-xl">3</div>
              <div>
                <h4 className="text-white font-bold">Review AI Findings</h4>
                <p className="text-sm text-gray-400">Get plain-English explanations of impacted applications.</p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
