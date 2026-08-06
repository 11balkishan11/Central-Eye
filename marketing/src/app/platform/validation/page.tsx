import { ValidationExperience } from "@/experiences/ValidationExperience";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function ValidationPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Continuous Validation
          </h1>
          <p className="text-xl text-gray-400">
            Automatically detect configuration drift and enforce security policies before they cause an outage.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Experience</h2>
          <ValidationExperience />
        </div>

        {/* Technical Deep Dive */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">Configuration Drift</h3>
            <p className="text-sm text-gray-400">
              The Difference Engine continuously compares the Reality Graph against your desired Intent. If an engineer makes a manual out-of-band change to a firewall, it is flagged immediately as drift.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">Policy Enforcement</h3>
            <p className="text-sm text-gray-400">
              Go beyond simple diffs. Write complex business logic checks using our Validation SDK. Ensure that no access switch is ever directly connected to the internet, or that all BGP neighbors use MD5 authentication.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h3 className="text-xl font-bold text-white mb-4">Automated Remediation</h3>
            <p className="text-sm text-gray-400">
              When a violation is detected, the AI Assistant automatically maps the blast radius and generates a targeted CLI or API playbook to remediate the issue safely.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
