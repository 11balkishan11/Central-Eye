import { AIAssistantExperience } from "@/experiences/AIAssistantExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function AIPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Central Eye Enterprise AI Assistant
          </h1>
          <p className="text-xl text-gray-400">
            A conversational interface directly wired into your network's Digital Twin. Stop querying raw logs and start asking questions.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Experience</h2>
          <AIAssistantExperience />
        </div>

        {/* Deep Dive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          <GlassPanel hoverEffect>
            <h3 className="text-xl font-bold text-white mb-2">Context-Aware</h3>
            <p className="text-sm text-gray-400">
              Generic LLMs don't understand your network. Central Eye's AI builds its context directly from the Reality Graph, making its recommendations highly accurate and specific to your infrastructure.
            </p>
          </GlassPanel>

          <GlassPanel hoverEffect>
            <h3 className="text-xl font-bold text-white mb-2">Root Cause Analysis</h3>
            <p className="text-sm text-gray-400">
              When an alert triggers, the AI automatically correlates events across time, identifying the exact configuration change, link failure, or policy violation that started the cascade.
            </p>
          </GlassPanel>

          <GlassPanel hoverEffect>
            <h3 className="text-xl font-bold text-white mb-2">Automated Playbooks</h3>
            <p className="text-sm text-gray-400">
              Once the root cause is identified, the AI generates a remediation playbook. You can review the exact CLI commands or API payloads before executing them safely.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
