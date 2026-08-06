"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, Network, Eye, Edit3, ShieldAlert, Cpu } from "lucide-react";

type Role = "Network Engineer" | "Auditor" | "SOC Analyst" | "System Admin";

const rbacMatrix: Record<Role, { read: boolean; write: boolean; discover: boolean; validate: boolean; simulate: boolean; admin: boolean; desc: string }> = {
  "Network Engineer": { read: true, write: true, discover: true, validate: true, simulate: true, admin: false, desc: "Full operational access. Can run discoveries, push remediation playbooks, and simulate outages." },
  "Auditor": { read: true, write: false, discover: false, validate: true, simulate: false, admin: false, desc: "Read-only access for compliance. Can view Reality Graphs and configuration drift, but cannot change state." },
  "SOC Analyst": { read: true, write: false, discover: false, validate: true, simulate: true, admin: false, desc: "Security-focused. Can simulate blast radiuses and view policy violations to triage security events." },
  "System Admin": { read: true, write: true, discover: true, validate: true, simulate: true, admin: true, desc: "Full platform control. Can manage tenants, SSO configurations, and issue API tokens." },
};

export function SecurityExperience() {
  const [activeRole, setActiveRole] = useState<Role>("Network Engineer");

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Roles Sidebar */}
      <div className="w-full md:w-1/3 flex flex-col gap-3">
        <h3 className="text-white font-bold mb-2">Select Persona</h3>
        {(Object.keys(rbacMatrix) as Role[]).map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-3 rounded-lg text-left transition-all font-semibold flex items-center justify-between group ${activeRole === role ? 'bg-[var(--color-brand-cyan-dark)]/30 border border-[var(--color-brand-cyan-light)] text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <span>{role}</span>
            <Shield className={`w-4 h-4 ${activeRole === role ? 'text-[var(--color-brand-cyan-light)]' : 'text-gray-600 group-hover:text-gray-400'}`} />
          </button>
        ))}

        <div className="mt-6 p-4 bg-black/50 border border-white/10 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            {rbacMatrix[activeRole].desc}
          </p>
        </div>
      </div>

      {/* RBAC Matrix Display */}
      <div className="flex-1 glass-panel p-8 relative overflow-hidden">
        {/* Background glow based on active selection */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeRole}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-brand-cyan-dark)] rounded-full blur-[100px] pointer-events-none"
          />
        </AnimatePresence>

        <h3 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 relative z-10">
          Live Permissions Matrix
        </h3>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <PermissionCard label="View Digital Twin" icon={Eye} granted={rbacMatrix[activeRole].read} />
          <PermissionCard label="Execute Remediation" icon={Edit3} granted={rbacMatrix[activeRole].write} />
          <PermissionCard label="Run Network Discovery" icon={Network} granted={rbacMatrix[activeRole].discover} />
          <PermissionCard label="View Policy Violations" icon={ShieldAlert} granted={rbacMatrix[activeRole].validate} />
          <PermissionCard label="Simulate Outages" icon={Cpu} granted={rbacMatrix[activeRole].simulate} />
          <PermissionCard label="Manage SSO & Tenants" icon={Key} granted={rbacMatrix[activeRole].admin} />
        </div>
      </div>

    </div>
  );
}

function PermissionCard({ label, icon: Icon, granted }: { label: string, icon: any, granted: boolean }) {
  return (
    <motion.div 
      initial={false}
      animate={{ 
        backgroundColor: granted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        borderColor: granted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.2)'
      }}
      className="p-4 rounded-xl border flex items-center gap-4 transition-colors"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${granted ? 'bg-[var(--color-brand-emerald-dark)]/50' : 'bg-red-900/30'}`}>
        <Icon className={`w-5 h-5 ${granted ? 'text-[var(--color-brand-emerald-light)]' : 'text-red-500/50'}`} />
      </div>
      <div>
        <div className={`text-sm font-bold ${granted ? 'text-white' : 'text-gray-500'}`}>{label}</div>
        <div className={`text-xs ${granted ? 'text-gray-400' : 'text-red-500/50'}`}>
          {granted ? 'Access Granted' : 'Access Denied'}
        </div>
      </div>
    </motion.div>
  );
}
