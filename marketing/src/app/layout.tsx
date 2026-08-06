import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { RuntimeProviderComponent } from "@/runtime/providers/RuntimeProvider";
import { RuntimeInspector } from "@/runtime/ui/RuntimeInspector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Central Eye | The AI-Powered Network Digital Twin Platform",
  description: "Observe, understand, predict, and automate your enterprise infrastructure with the world's most advanced network digital twin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-cyan-900`}
      >
        <RuntimeProviderComponent>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
          <CommandPalette />
          <RuntimeInspector />
        </RuntimeProviderComponent>
      </body>
    </html>
  );
}
