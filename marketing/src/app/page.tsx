import { HomepageHero } from "../components/marketing/HomepageHero";
import { IncidentReplay } from "../components/marketing/IncidentReplay";
import { DemoGateway } from "../components/marketing/DemoGateway";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Chapter 1: The Future of Infrastructure Operations (Hero) */}
      <HomepageHero />

      {/* Chapter 2: The Problem (Animation comparing Old World vs Central Eye) */}
      <section className="min-h-screen border-b border-white/5 py-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-500 mb-4">[Chapter 2 Placeholder: The Problem]</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Traditional monitoring vs Central Eye observation.</p>
        </div>
      </section>

      {/* Chapter 3: Watch It Solve A Real Incident (The Signature Proof) */}
      <IncidentReplay />

      {/* Chapter 4: From Devices to Understanding (Digital Twin Intro) */}
      <section className="min-h-screen border-b border-white/5 py-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-500 mb-4">[Chapter 4 Placeholder: Digital Twin]</h2>
          <p className="text-gray-600 max-w-xl mx-auto">From devices to understanding relationships.</p>
        </div>
      </section>

      {/* Chapter 5: How Central Eye Thinks (Pipeline Animation) */}
      <section className="min-h-screen border-b border-white/5 py-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-500 mb-4">[Chapter 5 Placeholder: Pipeline]</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Discover - Observe - Normalize - Infer - Understand - Predict - Recommend</p>
        </div>
      </section>

      {/* Chapter 6: Explore The Platform (Capability Teasers) */}
      <section className="min-h-screen border-b border-white/5 py-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-500 mb-4">[Chapter 6 Placeholder: Platform Teasers]</h2>
        </div>
      </section>

      {/* Chapter 7: Built For Enterprise (Trust) */}
      <section className="min-h-[50vh] border-b border-white/5 py-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-500 mb-4">[Chapter 7 Placeholder: Trust Cards]</h2>
        </div>
      </section>

      {/* Chapter 8: Ready To Experience It? (Live Demo CTA) */}
      <DemoGateway />

      {/* Chapter 9: Manifesto (Vision) */}
      <section className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0b]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Infrastructure should explain itself.</h2>
          <p className="text-xl text-gray-400 font-light leading-relaxed mb-12">
            Operators shouldn't correlate 17 dashboards. Networks should answer questions. Systems should reason. Monitoring should become understanding. That is why we built Central Eye.
          </p>
        </div>
      </section>
    </div>
  );
}
