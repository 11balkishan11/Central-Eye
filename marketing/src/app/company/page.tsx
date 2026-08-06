import { Rocket, Target, Users2, Globe, Shield } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function CompanyPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            We are building the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-cyan-light)] to-[var(--color-brand-emerald-light)]">
              Network Digital Twin
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Networks run the modern world, yet the tools used to manage them are stuck in the 1990s. We founded Central Eye to bring AI-native graph intelligence to enterprise infrastructure.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <GlassPanel className="p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-cyan-dark)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Target className="w-8 h-8 text-[var(--color-brand-cyan-light)] mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed relative z-10">
              To eliminate network outages by moving from reactive monitoring to proactive architecture. We believe operators should interact with an intelligent Digital Twin, not a list of IP addresses and SNMP traps.
            </p>
          </GlassPanel>
          
          <GlassPanel className="p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-[var(--color-brand-emerald-dark)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Rocket className="w-8 h-8 text-[var(--color-brand-emerald-light)] mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Our Vision</h3>
            <p className="text-gray-400 leading-relaxed relative z-10">
              A world where every change is simulated before execution, every intent is continuously validated against reality, and network downtime is a thing of the past.
            </p>
          </GlassPanel>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white mb-2 font-mono">1.2M+</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nodes Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white mb-2 font-mono">$40M</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Series B Funding</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white mb-2 font-mono">85+</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white mb-2 font-mono">4</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Global Offices</div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-[var(--color-brand-cyan-light)]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Graph over Lists</h4>
              <p className="text-gray-400">Everything is connected. We prioritize relationships and topologies over flat lists of metrics.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6">
                <Users2 className="w-6 h-6 text-[var(--color-brand-cyan-light)]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Engineers First</h4>
              <p className="text-gray-400">We build tools that we actually want to use. No fluff, just powerful APIs and CLIs.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[var(--color-brand-cyan-light)]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Secure by Design</h4>
              <p className="text-gray-400">Zero trust isn't a buzzword, it's how our architecture is built from the ground up.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
