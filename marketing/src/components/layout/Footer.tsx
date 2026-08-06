import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-[var(--color-brand-cyan-light)]" />
              <span className="text-xl font-bold tracking-tight text-white">Central Eye</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              The AI-Powered Network Digital Twin Platform. Observe, understand, predict, and automate your enterprise infrastructure.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/platform/discovery" className="text-sm text-gray-400 hover:text-white transition-colors">Discovery</Link></li>
              <li><Link href="/platform/digital-twin" className="text-sm text-gray-400 hover:text-white transition-colors">Digital Twin</Link></li>
              <li><Link href="/platform/monitoring" className="text-sm text-gray-400 hover:text-white transition-colors">Monitoring</Link></li>
              <li><Link href="/platform/simulation" className="text-sm text-gray-400 hover:text-white transition-colors">Simulation</Link></li>
              <li><Link href="/platform/ai" className="text-sm text-gray-400 hover:text-white transition-colors">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Technical</h3>
            <ul className="space-y-3">
              <li><Link href="/architecture" className="text-sm text-gray-400 hover:text-white transition-colors">Architecture</Link></li>
              <li><Link href="/security" className="text-sm text-gray-400 hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/deployment" className="text-sm text-gray-400 hover:text-white transition-colors">Deployment</Link></li>
              <li><Link href="/api" className="text-sm text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Central Eye, Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
