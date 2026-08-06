"use client";

import { motion } from "framer-motion";
import { Server, ShieldCheck, Database, Cloud, Network } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const vendors = [
  {
    name: "Cisco",
    icon: Network,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/50",
    protocols: ["SNMP v2c/v3", "LLDP", "CDP", "SSH", "RESTCONF"],
    models: ["Catalyst 9k", "Nexus 7k/9k", "ISR/ASR", "Meraki"],
    discoveryDepth: 95,
    backup: 100,
    validation: 90
  },
  {
    name: "Palo Alto",
    icon: ShieldCheck,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/50",
    protocols: ["XML API", "REST API", "SNMP v3", "SSH"],
    models: ["PA-Series", "Panorama", "Prisma Access"],
    discoveryDepth: 100,
    backup: 100,
    validation: 100
  },
  {
    name: "VMware",
    icon: Server,
    color: "text-blue-300",
    bg: "bg-blue-300/10",
    border: "border-blue-300/50",
    protocols: ["vSphere API", "NSX-T API"],
    models: ["ESXi 7.0+", "vCenter", "NSX-T Edge"],
    discoveryDepth: 90,
    backup: 0,
    validation: 80
  },
  {
    name: "AWS",
    icon: Cloud,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    protocols: ["AWS API", "CloudWatch"],
    models: ["VPC", "Transit Gateway", "EC2", "ALB"],
    discoveryDepth: 100,
    backup: 0,
    validation: 100
  },
  {
    name: "Juniper",
    icon: Network,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/50",
    protocols: ["NETCONF", "SNMP v2c/v3", "SSH", "LLDP"],
    models: ["MX Series", "QFX Series", "SRX Series", "EX Series"],
    discoveryDepth: 90,
    backup: 100,
    validation: 95
  },
  {
    name: "Kubernetes",
    icon: Database,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/50",
    protocols: ["Kube API"],
    models: ["Pods", "Services", "Ingress", "NetworkPolicies"],
    discoveryDepth: 100,
    backup: 0,
    validation: 100
  }
];

export default function IntegrationsPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Extensive Integrations
          </h1>
          <p className="text-xl text-gray-400">
            Central Eye speaks the native language of your infrastructure. We don't rely on generic ping sweeps; we build deep, vendor-specific protocol adapters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <IntegrationCard key={vendor.name} vendor={vendor} />
          ))}
        </div>

      </div>
    </div>
  );
}

function IntegrationCard({ vendor }: { vendor: any }) {
  const Icon = vendor.icon;
  
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${vendor.color.replace('text-', '')}/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none z-0`} />
      
      <div className={`glass-panel p-6 h-full border border-white/5 group-hover:${vendor.border} transition-colors relative z-10 overflow-hidden`}>
        
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${vendor.bg} border border-white/10`}>
            <Icon className={`w-6 h-6 ${vendor.color}`} />
          </div>
          <h3 className="text-2xl font-bold text-white">{vendor.name}</h3>
        </div>

        {/* Hover Reveal Content */}
        <div className="space-y-6">
          
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supported Protocols</h4>
            <div className="flex flex-wrap gap-2">
              {vendor.protocols.map((p: string) => (
                <span key={p} className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded border border-white/10 font-mono">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supported Models</h4>
            <div className="text-sm text-gray-400 leading-relaxed">
              {vendor.models.join(", ")}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 pt-4 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
            <ProgressBar label="Discovery Depth" value={vendor.discoveryDepth} color="bg-[var(--color-brand-cyan-light)]" />
            <ProgressBar label="Config Backup" value={vendor.backup} color="bg-[var(--color-brand-emerald-light)]" />
            <ProgressBar label="Intent Validation" value={vendor.validation} color="bg-[var(--color-brand-violet-light)]" />
          </div>

        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 font-bold">{label}</span>
        <span className="text-gray-500 font-mono">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-black/50 rounded overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
