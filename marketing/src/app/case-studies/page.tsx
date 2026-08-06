import { ArrowRight, Building2, Shield, HeartPulse } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const studies = [
  {
    title: "Global FinTech Provider",
    icon: Shield,
    color: "text-[var(--color-brand-cyan-light)]",
    bg: "bg-[var(--color-brand-cyan-dark)]/20",
    border: "border-[var(--color-brand-cyan-light)]",
    metric: "400%",
    metricLabel: "Faster Incident Resolution",
    description: "How a top-tier payment processor used Central Eye to map 12,000 nodes and reduce Mean Time To Resolution (MTTR) from 4 hours to 45 minutes using the Digital Twin topology.",
    tags: ["Zero Trust", "PCI-DSS", "AWS + On-Prem"]
  },
  {
    title: "National Healthcare Network",
    icon: HeartPulse,
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500",
    metric: "0",
    metricLabel: "Compliance Violations",
    description: "Central Eye's Intent Validation engine continuously monitors this hospital network's strict segmentation policies, ensuring IoT medical devices never communicate outside their VLANs.",
    tags: ["HIPAA", "IoT Security", "Segmentation"]
  },
  {
    title: "Automotive Manufacturer",
    icon: Building2,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500",
    metric: "12,000+",
    metricLabel: "Hours Saved Annually",
    description: "By replacing manual spreadsheet documentation with Central Eye's auto-discovery and Simulation engine, this global manufacturer eliminated change-window rollbacks.",
    tags: ["OT/IT Convergence", "SD-WAN", "Change Management"]
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Trusted by the Enterprise
          </h1>
          <p className="text-xl text-gray-400">
            See how the world's most complex networks rely on Central Eye to transition from reactive monitoring to proactive architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {studies.map((study, idx) => {
            const Icon = study.icon;
            return (
              <GlassPanel key={idx} className="flex flex-col h-full group hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full ${study.bg} -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${study.bg} border ${study.border}/30`}>
                    <Icon className={`w-6 h-6 ${study.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{study.title}</h3>
                </div>

                <div className="mb-8 relative z-10">
                  <div className={`text-4xl font-extrabold ${study.color} mb-1 font-mono`}>{study.metric}</div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{study.metricLabel}</div>
                </div>

                <p className="text-gray-400 mb-8 flex-1 leading-relaxed relative z-10">
                  {study.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                  {study.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-[var(--color-brand-cyan-light)] transition-colors relative z-10">
                  Read Full Study <ArrowRight className="w-4 h-4" />
                </div>
              </GlassPanel>
            );
          })}
        </div>

      </div>
    </div>
  );
}
