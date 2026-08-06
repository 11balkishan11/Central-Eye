import { ArchitectureExperience } from "@/experiences/ArchitectureExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function ArchitecturePage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Enterprise Architecture
          </h1>
          <p className="text-xl text-gray-400">
            A massively scalable, event-driven pipeline converting raw network telemetry into actionable reality graphs.
          </p>
        </div>

        {/* Interactive Architecture Playground */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Pipeline Overview</h2>
          <ArchitectureExperience />
        </div>

        {/* Deep Dive Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">Observation-First Design</h3>
            <p className="text-gray-400">
              Unlike legacy systems, Collectors do not have permission to create or modify Devices. They exclusively stream immutable <code>Observations</code> to the backend. This decouples collection logic from domain modeling, eliminating race conditions and duplicate assets.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">The Inference Engine</h3>
            <p className="text-gray-400">
              The Inference Engine analyzes the stream of Observations. It uses deterministic heuristics (MAC addresses, Serial Numbers, Interface IPs) to stitch fragmented data into a cohesive <code>Reality Graph</code>, gracefully handling network churn.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">CQRS & Event Sourcing</h3>
            <p className="text-gray-400">
              Every change in the Digital Twin is recorded as an immutable event (e.g., <code>LinkStateChanged</code>). This powers our History Graph, allowing users to scrub backward in time and replay how the network topology evolved prior to an outage.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">Simulation & Validation</h3>
            <p className="text-gray-400">
              The Presentation layer requests <code>GraphSnapshotDTOs</code>. These DTOs are passed into the Simulation Engine, which calculates blast radii and identifies Intent violations without touching the production database.
            </p>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
}
