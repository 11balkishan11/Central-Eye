import { PricingExperience } from "@/experiences/PricingExperience";
import { CreditCard, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] mb-6">
            <CreditCard className="w-5 h-5 text-[var(--color-brand-cyan-light)]" />
            <span className="text-sm font-bold text-[var(--color-brand-cyan-light)]">Simple, Predictable Pricing</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            No complex modules. <br/> Just nodes.
          </h1>
          <p className="text-xl text-gray-400">
            Enterprise software shouldn't require a Ph.D to calculate pricing. We charge a flat platform fee and a per-node cost. You get every feature we build.
          </p>
        </div>

        {/* The Interactive Calculator */}
        <div className="mb-24">
          <PricingExperience />
        </div>

      </div>
    </div>
  );
}
