import { TourExperience } from "@/experiences/TourExperience";
import { Compass, Sparkles } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="py-24 bg-black min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-emerald-dark)]/20 border border-[var(--color-brand-emerald-light)] mb-6">
            <Compass className="w-5 h-5 text-[var(--color-brand-emerald-light)]" />
            <span className="text-sm font-bold text-[var(--color-brand-emerald-light)]">Guided Product Tours</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4 flex justify-center items-center gap-4">
            Interactive Missions <Sparkles className="w-8 h-8 text-[var(--color-brand-cyan-light)] animate-pulse" />
          </h1>
          <p className="text-xl text-gray-400">
            Follow along with predefined automated sequences that demonstrate exactly how Central Eye solves the most complex enterprise networking challenges.
          </p>
        </div>

        {/* The Tours Experience */}
        <div className="mb-24">
          <TourExperience />
        </div>

      </div>
    </div>
  );
}
