import Image from "next/image";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function PlatformPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            The Enterprise Digital Twin
          </h1>
          <p className="text-xl text-gray-400">
            A unified, living model of your entire network infrastructure.
          </p>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-24 shadow-[0_0_80px_rgba(6,182,212,0.15)]">
          <Image 
            src="/images/digital_twin_platform.png" 
            alt="Digital Twin Overview" 
            fill 
            className="object-cover mix-blend-lighten"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GlassPanel hoverEffect className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Discovery Engine</h3>
            <p className="text-gray-400 mb-6 flex-1">
              Continuously observe reality across multiple protocols without static polling.
            </p>
            <Link href="/platform/discovery" className="text-[var(--color-brand-cyan-light)] text-sm font-medium hover:underline">
              Explore Discovery &rarr;
            </Link>
          </GlassPanel>

          <GlassPanel hoverEffect className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Topology Intelligence</h3>
            <p className="text-gray-400 mb-6 flex-1">
              Automatically assemble Layer 2 and Layer 3 dependencies into an interactive Reality Graph.
            </p>
            <Link href="/platform/topology" className="text-[var(--color-brand-cyan-light)] text-sm font-medium hover:underline">
              Explore Topology &rarr;
            </Link>
          </GlassPanel>

          <GlassPanel hoverEffect className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Simulation Engine</h3>
            <p className="text-gray-400 mb-6 flex-1">
              Ask "What if?" Predict the blast radius of outages or configuration changes before they happen.
            </p>
            <Link href="/platform/simulation" className="text-[var(--color-brand-cyan-light)] text-sm font-medium hover:underline">
              Explore Simulation &rarr;
            </Link>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
