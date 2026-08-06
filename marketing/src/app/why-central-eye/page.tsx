import { Check, X } from "lucide-react";

const comparisonData = [
  { feature: "Collection Method", traditional: "Static Polling", centralEye: "Observation-Driven Stream" },
  { feature: "Asset Modeling", traditional: "Flat Device List", centralEye: "Relational Digital Twin" },
  { feature: "Network Topology", traditional: "Static Maps (Manual)", centralEye: "Living Reality Graph" },
  { feature: "Event Handling", traditional: "Siloed Alerts (Noise)", centralEye: "Context-Aware Findings" },
  { feature: "Troubleshooting", traditional: "Manual CLI / Log parsing", centralEye: "AI-Assisted Investigation" },
  { feature: "Visibility Window", traditional: "Point-in-Time (Now)", centralEye: "Time-Travel History" },
  { feature: "Scope of Truth", traditional: "Operational Health Only", centralEye: "Intent + Reality + Difference" }
];

export default function WhyCentralEyePage() {
  return (
    <div className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Why Central Eye?
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Traditional NMS platforms were built for the 90s. They treat your network as a list of independent IP addresses. We treat it as a living organism.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="glass-panel overflow-hidden border border-white/10 mb-24 shadow-2xl">
          <div className="grid grid-cols-3 bg-black/60 border-b border-white/10 p-6">
            <div className="font-bold text-gray-400">Capability</div>
            <div className="font-bold text-gray-400 text-center">Traditional Tools</div>
            <div className="font-bold text-[var(--color-brand-cyan-light)] text-center">Central Eye</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {comparisonData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-6 hover:bg-white/5 transition-colors items-center">
                <div className="font-semibold text-white">{row.feature}</div>
                
                <div className="text-center text-gray-400 flex flex-col items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-sm">{row.traditional}</span>
                </div>
                
                <div className="text-center text-[var(--color-brand-cyan-light)] flex flex-col items-center gap-2">
                  <Check className="w-5 h-5 text-[var(--color-brand-emerald-light)]" />
                  <span className="text-sm font-bold">{row.centralEye}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Bottom Line */}
        <div className="text-center bg-gradient-to-br from-[var(--color-brand-cyan-dark)]/20 to-[var(--color-brand-violet-dark)]/20 p-12 rounded-2xl border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6">The Bottom Line</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            You don't need another dashboard with red and green lights. You need an engine that understands routing protocols, layer 2 adjacency, configuration intent, and blast radiuses. You need a Digital Twin.
          </p>
          <button className="px-8 py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
            Book an Enterprise Demo
          </button>
        </div>

      </div>
    </div>
  );
}
