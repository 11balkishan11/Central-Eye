import { DigitalTwinExperience } from "@/experiences/DigitalTwinExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function DigitalTwinPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            The Living Digital Twin
          </h1>
          <p className="text-xl text-gray-400">
            A massively scalable graph that bridges the gap between infrastructure intent and operational reality.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Experience</h2>
          <DigitalTwinExperience />
        </div>

        {/* Technical Deep Dive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <GlassPanel>
            <h3 className="text-[var(--color-brand-cyan-light)] font-bold mb-2">1. Intent Graph</h3>
            <p className="text-sm text-gray-400">Ingests configs, Terraform, and YAML to build the baseline of how the network is supposed to look.</p>
          </GlassPanel>
          <GlassPanel>
            <h3 className="text-[var(--color-brand-emerald-light)] font-bold mb-2">2. Reality Graph</h3>
            <p className="text-sm text-gray-400">Uses continuous discovery observations to build the actual topology running in production.</p>
          </GlassPanel>
          <GlassPanel>
            <h3 className="text-[var(--color-brand-violet-light)] font-bold mb-2">3. Difference Engine</h3>
            <p className="text-sm text-gray-400">Continuously compares Intent vs Reality to instantly identify configuration drift and policy violations.</p>
          </GlassPanel>
          <GlassPanel>
            <h3 className="text-blue-400 font-bold mb-2">4. History Graph</h3>
            <p className="text-sm text-gray-400">Event-sourced architecture enables full time-travel, showing exact topology state at the moment an incident occurred.</p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
