import { APIExperience } from "@/experiences/APIExperience";
import { Terminal } from "lucide-react";

export default function APIPage() {
  return (
    <div className="py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] mb-6">
            <Terminal className="w-5 h-5 text-[var(--color-brand-cyan-light)]" />
            <span className="text-sm font-bold text-[var(--color-brand-cyan-light)]">Developer API v1</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            API Playground
          </h1>
          <p className="text-xl text-gray-400">
            Automate everything. The entire Central Eye platform is API-first. If you can click it in the UI, you can execute it via the REST API.
          </p>
        </div>

        {/* Interactive API Explorer */}
        <div className="mb-24">
          <APIExperience />
        </div>

      </div>
    </div>
  );
}
