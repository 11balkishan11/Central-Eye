"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Server, Database, Shield, Zap, Globe, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useRuntime } from "@/runtime/hooks/useRuntime";

const STEPS = ["Scale", "Architecture", "Compliance", "Support"];

export function PricingExperience() {
  const runtime = useRuntime();
  const [step, setStep] = useState(0);

  const [config, setConfig] = useState({
    sites: 10,
    nodes: 2500,
    deployment: 'Cloud',
    retention: '30 Days',
    ha: false,
    compliance: false,
    support: 'Standard'
  });

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else runtime.dispatch('PRICING_UPDATED', config, 'PricingWizard');
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Calculations
  const base = config.deployment === 'Cloud' ? 2000 : 5000;
  const nodeCost = config.nodes * 12;
  const haMultiplier = config.ha ? 1.5 : 1;
  const compMultiplier = config.compliance ? 1.2 : 1;
  const supportAddon = config.support === 'Enterprise' ? 2500 : 0;
  
  const monthlyTotal = Math.floor(((base + nodeCost) * haMultiplier * compMultiplier) + supportAddon);
  const edition = config.compliance || config.support === 'Enterprise' ? 'Enterprise' : 'Professional';
  const collectors = Math.ceil(config.nodes / 1000);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Left Pane: Configurator Wizard */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-2 ${i <= step ? 'text-[var(--color-brand-cyan-light)]' : 'text-gray-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${i <= step ? 'border-[var(--color-brand-cyan-light)] bg-[var(--color-brand-cyan-dark)]/20' : 'border-gray-600'}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10 hidden sm:block" />}
            </div>
          ))}
        </div>

        <GlassPanel className="relative overflow-hidden min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {step === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Network Scale</h2>
                  <p className="text-gray-400 text-sm mb-6">Tell us about the size of the infrastructure you are managing.</p>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2 block">Active Nodes</label>
                    <div className="text-3xl font-extrabold text-white mb-4 font-mono">{config.nodes.toLocaleString()}</div>
                    <input 
                      type="range" min="100" max="25000" step="100" 
                      value={config.nodes} 
                      onChange={(e) => setConfig({...config, nodes: Number(e.target.value)})}
                      className="w-full accent-[var(--color-brand-cyan-light)]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2 block mt-8">Global Sites / Datacenters</label>
                    <div className="text-3xl font-extrabold text-white mb-4 font-mono">{config.sites}</div>
                    <input 
                      type="range" min="1" max="100" 
                      value={config.sites} 
                      onChange={(e) => setConfig({...config, sites: Number(e.target.value)})}
                      className="w-full accent-[var(--color-brand-cyan-light)]"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Architecture</h2>
                  <p className="text-gray-400 text-sm mb-6">How would you like Central Eye deployed?</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setConfig({...config, deployment: 'Cloud'})} className={`p-4 border rounded-xl text-left transition-colors ${config.deployment === 'Cloud' ? 'bg-[var(--color-brand-cyan-dark)]/20 border-[var(--color-brand-cyan-light)]' : 'border-white/10 hover:border-white/30'}`}>
                      <Globe className={`w-6 h-6 mb-3 ${config.deployment === 'Cloud' ? 'text-[var(--color-brand-cyan-light)]' : 'text-gray-400'}`} />
                      <div className="text-white font-bold mb-1">SaaS Cloud</div>
                      <div className="text-xs text-gray-400">Fully managed, instant updates.</div>
                    </button>
                    <button onClick={() => setConfig({...config, deployment: 'On-Prem'})} className={`p-4 border rounded-xl text-left transition-colors ${config.deployment === 'On-Prem' ? 'bg-[var(--color-brand-cyan-dark)]/20 border-[var(--color-brand-cyan-light)]' : 'border-white/10 hover:border-white/30'}`}>
                      <Server className={`w-6 h-6 mb-3 ${config.deployment === 'On-Prem' ? 'text-[var(--color-brand-cyan-light)]' : 'text-gray-400'}`} />
                      <div className="text-white font-bold mb-1">On-Premises</div>
                      <div className="text-xs text-gray-400">Air-gapped, total control.</div>
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer" onClick={() => setConfig({...config, ha: !config.ha})}>
                    <div>
                      <div className="text-white font-bold">High Availability (HA)</div>
                      <div className="text-xs text-gray-400">Deploy collectors in active/standby clusters.</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full border flex items-center px-0.5 transition-colors ${config.ha ? 'bg-[var(--color-brand-emerald-dark)] border-[var(--color-brand-emerald-light)] justify-end' : 'bg-transparent border-gray-600 justify-start'}`}>
                      <div className={`w-3 h-3 rounded-full ${config.ha ? 'bg-[var(--color-brand-emerald-light)]' : 'bg-gray-500'}`} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Data & Compliance</h2>
                  <p className="text-gray-400 text-sm mb-6">Select your data retention and security requirements.</p>
                  
                  <label className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2 block">Telemetry Retention</label>
                  <select 
                    value={config.retention}
                    onChange={(e) => setConfig({...config, retention: e.target.value})}
                    className="w-full bg-[#111112] border border-white/10 text-white rounded-lg p-3 outline-none focus:border-[var(--color-brand-cyan-light)]"
                  >
                    <option>30 Days</option>
                    <option>90 Days</option>
                    <option>1 Year</option>
                    <option>Infinite (S3 Archival)</option>
                  </select>

                  <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer" onClick={() => setConfig({...config, compliance: !config.compliance})}>
                    <div className="flex gap-4 items-center">
                      <Shield className={`w-6 h-6 ${config.compliance ? 'text-[var(--color-brand-emerald-light)]' : 'text-gray-500'}`} />
                      <div>
                        <div className="text-white font-bold">Strict Compliance Mode</div>
                        <div className="text-xs text-gray-400">HIPAA / PCI-DSS / SOC2 Audit Logging</div>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full border flex items-center px-0.5 transition-colors ${config.compliance ? 'bg-[var(--color-brand-emerald-dark)] border-[var(--color-brand-emerald-light)] justify-end' : 'bg-transparent border-gray-600 justify-start'}`}>
                      <div className={`w-3 h-3 rounded-full ${config.compliance ? 'bg-[var(--color-brand-emerald-light)]' : 'bg-gray-500'}`} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Support Tier</h2>
                  <p className="text-gray-400 text-sm mb-6">Choose your SLA and dedicated engineering response.</p>
                  
                  <div className="space-y-3">
                    <button onClick={() => setConfig({...config, support: 'Standard'})} className={`w-full p-4 border rounded-xl text-left transition-colors flex items-center justify-between ${config.support === 'Standard' ? 'bg-[var(--color-brand-cyan-dark)]/20 border-[var(--color-brand-cyan-light)]' : 'border-white/10 hover:border-white/30'}`}>
                      <div>
                        <div className="text-white font-bold mb-1">Standard Support</div>
                        <div className="text-xs text-gray-400">8x5 business hours, 24h response time.</div>
                      </div>
                      {config.support === 'Standard' && <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-cyan-light)]" />}
                    </button>
                    <button onClick={() => setConfig({...config, support: 'Enterprise'})} className={`w-full p-4 border rounded-xl text-left transition-colors flex items-center justify-between ${config.support === 'Enterprise' ? 'bg-[var(--color-brand-emerald-dark)]/20 border-[var(--color-brand-emerald-light)]' : 'border-white/10 hover:border-white/30'}`}>
                      <div>
                        <div className="text-white font-bold mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-[var(--color-brand-emerald-light)]"/> Mission Critical</div>
                        <div className="text-xs text-gray-400">24/7 dedicated engineer, 1h response time SLA.</div>
                      </div>
                      {config.support === 'Enterprise' && <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-emerald-light)]" />}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between pt-6 border-t border-white/10">
            <button 
              onClick={prevStep} 
              disabled={step === 0}
              className="px-6 py-2 rounded text-sm font-bold text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={nextStep} 
              className="px-6 py-2 rounded text-sm font-bold text-white bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              {step === STEPS.length - 1 ? 'Generate Quote' : 'Continue'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassPanel>
      </div>

      {/* Right Pane: Generated Architecture & Quote */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <GlassPanel className={`transition-all duration-500 h-full flex flex-col ${step === STEPS.length - 1 ? 'border-[var(--color-brand-cyan-light)] bg-gradient-to-br from-black to-[var(--color-brand-cyan-dark)]/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]' : 'opacity-80'}`}>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" /> Architecture Generated
            </h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Edition</div>
                <div className={`font-bold ${edition === 'Enterprise' ? 'text-[var(--color-brand-emerald-light)]' : 'text-white'}`}>{edition}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Collectors Req.</div>
                <div className="font-bold text-white">{collectors} {config.ha ? '(x2 HA Pairs)' : ''}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Deployment</div>
                <div className="font-bold text-white">{config.deployment}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Storage Tier</div>
                <div className="font-bold text-white">{config.retention}</div>
              </div>
            </div>

            <div className="space-y-3 mb-8 pt-6 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Platform Base ({config.deployment})</span>
                <span className="text-white font-mono">${base.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Node Licenses ({config.nodes})</span>
                <span className="text-white font-mono">${nodeCost.toLocaleString()}</span>
              </div>
              {config.ha && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-emerald-light)]">High Availability Architecture</span>
                  <span className="text-white font-mono">included</span>
                </div>
              )}
              {config.compliance && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-emerald-light)]">Compliance Pack</span>
                  <span className="text-white font-mono">included</span>
                </div>
              )}
              {config.support === 'Enterprise' && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-brand-cyan-light)]">Mission Critical Support SLA</span>
                  <span className="text-white font-mono">${supportAddon.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-brand-cyan-dark)]/50">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Estimated Monthly Cost</div>
                <div className="text-5xl font-extrabold text-white font-mono">${monthlyTotal.toLocaleString()}</div>
              </div>
              <div className="text-right pb-1">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Annual Total</div>
                <div className="text-lg text-white font-mono">${(monthlyTotal * 12).toLocaleString()}</div>
              </div>
            </div>
            {step === STEPS.length - 1 && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => runtime.dispatch('PRICING_UPDATED', config, 'Pricing')}
                className="w-full mt-4 py-4 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] text-white font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Send Quote to Procurement
              </motion.button>
            )}
          </div>
        </GlassPanel>
      </div>

    </div>
  );
}
