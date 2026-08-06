import { Search, ChevronRight, Hash, Terminal as TerminalIcon, FileText, Cpu, Network, Zap } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-black overflow-hidden font-sans border-t border-white/10 mt-16 text-gray-300">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0A0A0B] flex flex-col hidden md:flex overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search docs (Ctrl+K)" 
              className="w-full bg-[#111112] border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[var(--color-brand-cyan-light)] transition-colors"
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Getting Started
            </h4>
            <ul className="space-y-1">
              <li><Link href="#" className="block px-2 py-1 text-sm text-[var(--color-brand-cyan-light)] bg-[var(--color-brand-cyan-dark)]/20 rounded font-medium">Introduction</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Quickstart Guide</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Architecture</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Core Concepts
            </h4>
            <ul className="space-y-1">
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Digital Twin Graph</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Intent vs Reality</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Blast Radius Simulation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Network className="w-4 h-4" /> Deployment
            </h4>
            <ul className="space-y-1">
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Installing Collectors</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">High Availability</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Multi-Tenant Isolation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <TerminalIcon className="w-4 h-4" /> CLI & SDK
            </h4>
            <ul className="space-y-1">
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Central Eye CLI Reference</Link></li>
              <li><Link href="#" className="block px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors">Python SDK</Link></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Article */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            
            <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
              <span>Getting Started</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[var(--color-brand-cyan-light)]">Introduction</span>
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-6">Introduction to Central Eye</h1>
            
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Central Eye is an AI-native Network Digital Twin platform. Unlike traditional NMS tools that rely on static ping sweeps and flat IP lists, Central Eye automatically infers your Layer 2 and Layer 3 topology to create a living, relational Reality Graph.
            </p>

            <div className="bg-[#111112] border-l-4 border-[var(--color-brand-cyan-light)] p-4 rounded-r mb-8">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-[var(--color-brand-cyan-light)] shrink-0" />
                <div>
                  <h5 className="font-bold text-white text-sm mb-1">Interactive Documentation</h5>
                  <p className="text-sm text-gray-400">
                    This documentation portal is built for engineers. Every CLI command and API request can be copied and executed directly against your environment.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-2 group cursor-pointer">
              <Hash className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-brand-cyan-light)] transition-colors" />
              How it Works
            </h2>
            <p className="mb-6 leading-relaxed">
              The platform operates on a four-stage pipeline:
            </p>
            <ol className="list-decimal list-inside space-y-3 mb-8 ml-2 text-gray-300">
              <li><strong className="text-white">Observation:</strong> Distributed, stateless collectors stream telemetry and config data securely to the core via mTLS.</li>
              <li><strong className="text-white">Normalization:</strong> Multi-vendor outputs (Cisco, Juniper, Palo Alto) are translated into unified JSON objects.</li>
              <li><strong className="text-white">Inference:</strong> The Topology Engine pieces together LLDP, BGP, and OSPF tables to assemble the Reality Graph.</li>
              <li><strong className="text-white">Validation:</strong> The graph is continuously checked against your security Intent to detect drift and violations.</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-2 group cursor-pointer">
              <Hash className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-brand-cyan-light)] transition-colors" />
              Installing the Collector
            </h2>
            <p className="mb-6 leading-relaxed">
              The easiest way to start discovering your network is to deploy a collector via Docker. Ensure you have your Tenant API Key ready.
            </p>

            {/* Code Block Mock */}
            <div className="bg-[#0D0D0E] border border-white/10 rounded-lg overflow-hidden mb-8">
              <div className="bg-black/50 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded cursor-pointer text-white">Docker</span>
                  <span className="text-xs text-gray-400 bg-transparent px-2 py-1 rounded cursor-pointer hover:text-white">Kubernetes</span>
                  <span className="text-xs text-gray-400 bg-transparent px-2 py-1 rounded cursor-pointer hover:text-white">Linux Binary</span>
                </div>
                <button className="text-xs text-gray-500 hover:text-white transition-colors">Copy</button>
              </div>
              <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                <span className="text-gray-500"># Run the collector in your management VPC</span><br/>
                <span className="text-green-400">docker run</span> -d \<br/>
                {'  '}--name central-eye-collector \<br/>
                {'  '}-e <span className="text-[var(--color-brand-cyan-light)]">API_KEY</span>=your_tenant_key \<br/>
                {'  '}-e <span className="text-[var(--color-brand-cyan-light)]">CORE_URL</span>=wss://api.centraleye.ai \<br/>
                {'  '}centraleye/collector:latest
              </pre>
            </div>

          </div>
        </div>

        {/* Right Sidebar: Table of Contents */}
        <aside className="w-64 border-l border-white/10 p-6 hidden xl:block overflow-y-auto">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">On this page</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="#" className="text-[var(--color-brand-cyan-light)] font-medium transition-colors">Introduction to Central Eye</a></li>
            <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Installing the Collector</a></li>
          </ul>
        </aside>

      </main>
    </div>
  );
}
