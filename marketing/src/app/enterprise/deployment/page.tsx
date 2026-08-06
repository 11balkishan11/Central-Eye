import { DeploymentExperience } from "@/experiences/DeploymentExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Server, ShieldCheck, Database, Zap } from "lucide-react";

export default function DeploymentPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Deploy Anywhere
          </h1>
          <p className="text-xl text-gray-400">
            A decoupled, horizontally scalable architecture designed to fit your compliance and residency requirements.
          </p>
        </div>

        {/* Interactive Architecture Experience */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Deployment Sandbox</h2>
          <DeploymentExperience />
        </div>

        {/* Deep Dive Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <GlassPanel hoverEffect className="flex gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] flex items-center justify-center">
              <Server className="w-5 h-5 text-[var(--color-brand-cyan-light)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Stateless Edge Collectors</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Collectors are lightweight, stateless binaries. You can deploy hundreds of them across different VPCs, DMZs, or physical branch offices. They never store data; they only stream Observations securely back to the core.
              </p>
            </div>
          </GlassPanel>

          <GlassPanel hoverEffect className="flex gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-brand-emerald-dark)]/20 border border-[var(--color-brand-emerald-light)] flex items-center justify-center">
              <Database className="w-5 h-5 text-[var(--color-brand-emerald-light)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Centralized Reality Graph</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The core database is completely isolated from the collection edge. For highly secure environments (like Government or Financial sectors), the core can run entirely air-gapped on-premises.
              </p>
            </div>
          </GlassPanel>

          <GlassPanel hoverEffect className="flex gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Tenant by Default</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Built for MSPs and massive global conglomerates. Deploy a single core infrastructure and carve out isolated Workspaces. Tenants share the same binaries but have cryptographically separated data streams.
              </p>
            </div>
          </GlassPanel>

          <GlassPanel hoverEffect className="flex gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">High Availability (HA)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Collectors automatically load-balance and failover. If the primary Queue goes offline, Collectors buffer Observations locally until the secondary cluster assumes the primary role.
              </p>
            </div>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
}
