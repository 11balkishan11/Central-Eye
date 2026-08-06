import { discoveryContent } from "@/content/platform/discovery";
import { DiscoveryExperience } from "@/experiences/DiscoveryExperience";

export default function DiscoveryPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            {discoveryContent.hero.title}
          </h1>
          <p className="text-xl text-gray-400">
            {discoveryContent.hero.subtitle}
          </p>
          <p className="mt-4 text-gray-300">
            {discoveryContent.hero.description}
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Interactive Experience</h2>
          <DiscoveryExperience />
        </div>

        {/* Technical Explanation */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{discoveryContent.problem.title}</h3>
            <p className="text-gray-400">{discoveryContent.problem.description}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{discoveryContent.solution.title}</h3>
            <p className="text-gray-400">{discoveryContent.solution.description}</p>
          </div>
        </div>

        {/* Architecture Pipeline */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Technical Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {discoveryContent.technical.pipeline.map((item, index) => (
              <div key={index} className="glass-panel p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cyan-dark)]/20 border border-[var(--color-brand-cyan-light)] flex items-center justify-center text-white font-bold mb-4">
                  {index + 1}
                </div>
                <h4 className="text-white font-semibold mb-2">{item.step}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
