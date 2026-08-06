"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Terminal } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Product",
    href: "/platform",
    items: [
      { label: "Overview", href: "/platform" },
      { label: "Digital Twin", href: "/platform/digital-twin" },
      { label: "Monitoring", href: "/platform/monitoring" },
      { label: "Simulation", href: "/platform/simulation" },
      { label: "Validation", href: "/platform/validation" },
      { label: "AI Assistant", href: "/platform/ai" },
    ]
  },
  {
    label: "Solutions",
    href: "/solutions",
    items: [
      { label: "Enterprise", href: "/solutions/enterprise" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Manufacturing", href: "/solutions/manufacturing" },
      { label: "Cloud", href: "/solutions/cloud" },
      { label: "ISP", href: "/solutions/isp" },
    ]
  },
  {
    label: "Developers",
    href: "/developers",
    items: [
      { label: "Docs", href: "/developers/docs" },
      { label: "API", href: "/developers/api" },
      { label: "SDK", href: "/developers/sdk" },
      { label: "Architecture", href: "/developers/architecture" },
    ]
  },
  {
    label: "Enterprise",
    href: "/enterprise",
    items: [
      { label: "Security", href: "/enterprise/security" },
      { label: "Deployment", href: "/enterprise/deployment" },
      { label: "Integrations", href: "/enterprise/integrations" },
      { label: "Status", href: "/enterprise/status" },
    ]
  },
  {
    label: "Company",
    href: "/company",
    items: [
      { label: "Why Central Eye", href: "/why-central-eye" },
      { label: "About", href: "/company/about" },
      { label: "Blog", href: "/company/blog" },
      { label: "Careers", href: "/company/careers" },
      { label: "Contact", href: "/company/contact" },
    ]
  },
  {
    label: "Pricing",
    href: "/pricing",
  }
];

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-cyan-light)] flex items-center justify-center">
              <span className="text-black font-bold text-xl">C</span>
            </div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Central Eye
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1" onMouseLeave={() => setActiveMenu(null)}>
            {NAV_ITEMS.map((item) => (
              <div 
                key={item.label} 
                className="relative"
                onMouseEnter={() => setActiveMenu(item.label)}
              >
                <Link 
                  href={item.href}
                  className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {item.label} {item.items && <ChevronDown className="w-4 h-4 opacity-50" />}
                </Link>

                {item.items && (
                  <AnimatePresence>
                    {activeMenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 w-48 rounded-xl bg-[#111] border border-white/10 shadow-2xl overflow-hidden py-2"
                      >
                        {item.items.map((subItem) => (
                          <Link 
                            key={subItem.label} 
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/demo" 
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[var(--color-brand-emerald-dark)] rounded-md hover:bg-[var(--color-brand-emerald-light)] hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Terminal className="w-4 h-4" /> Launch Live Demo
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
