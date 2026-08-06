import { SecurityExperience } from "@/experiences/SecurityExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ShieldCheck, Lock, Activity, Users, FileDigit, Building2 } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] mb-6">
            <ShieldCheck className="w-5 h-5 text-[var(--color-brand-cyan-light)]" />
            <span className="text-sm font-bold text-[var(--color-brand-cyan-light)]">SOC2 Type II Ready</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            The Trust Center
          </h1>
          <p className="text-xl text-gray-400">
            Enterprise-grade security is not an afterthought. It is the foundation of the Central Eye architecture.
          </p>
        </div>

        {/* Interactive RBAC Experience */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Role-Based Access Control</h2>
          <SecurityExperience />
        </div>

        {/* Core Security Principles */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">Security by Design</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GlassPanel hoverEffect className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Zero Trust Architecture</h3>
              <p className="text-gray-400 text-sm">
                Central Eye never assumes trust. Collectors establish mutual TLS (mTLS) with the centralized queue. All data in transit and at rest is encrypted using AES-256.
              </p>
            </GlassPanel>

            <GlassPanel hoverEffect className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded bg-[var(--color-brand-emerald-dark)]/30 border border-[var(--color-brand-emerald-light)]/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--color-brand-emerald-light)]" />
              </div>
              <h3 className="text-xl font-bold text-white">SSO & SCIM</h3>
              <p className="text-gray-400 text-sm">
                Integrate with your existing Identity Provider (Okta, Azure AD, PingIdentity) via SAML 2.0 or OIDC. Automate user provisioning and deprovisioning with SCIM.
              </p>
            </GlassPanel>

            <GlassPanel hoverEffect className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                <FileDigit className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Immutable Audit Logs</h3>
              <p className="text-gray-400 text-sm">
                Every action—from a user logging in, to the AI generating a playbook, to a simulation being run—is recorded in a cryptographically signed, immutable event store.
              </p>
            </GlassPanel>

            <GlassPanel hoverEffect className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Multi-Tenant Isolation</h3>
              <p className="text-gray-400 text-sm">
                For MSPs and large global enterprises, Central Eye provides deep tenant isolation. Data from one tenant cannot bleed into another, enforced at the database level.
              </p>
            </GlassPanel>

            <GlassPanel hoverEffect className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">High Availability & DR</h3>
              <p className="text-gray-400 text-sm">
                The platform is designed to survive Availability Zone failures. Core services run in Active/Active clusters, and the graph database supports real-time multi-region replication.
              </p>
            </GlassPanel>

          </div>
        </div>

      </div>
    </div>
  );
}
