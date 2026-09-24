import React from 'react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Camera,
  FileSearch,
  Mic,
  FileText,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Layers,
  Wrench,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FolderCard } from '../components/cards/FolderCard';

export const LandingPage: React.FC = () => {
  const { setCurrentRoute, loadDemoScenario } = useApp();

  return (
    <div className="min-h-screen bg-[#FED000] text-black pb-16">
      {/* Neo-brutalist Background Accents */}
      <div className="relative overflow-hidden pt-8 sm:pt-14 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Playful Floating Neo-brutalist Shapes */}
        <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-[#FF3B81] border-3.5 border-black shadow-[5px_6px_0px_#000] -z-0 transform rotate-12 pointer-events-none opacity-90" />
        <div className="absolute top-80 -left-4 sm:left-4 w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-[#7C3AED] border-3.5 border-black shadow-[5px_6px_0px_#000] -z-0 transform -rotate-6 pointer-events-none opacity-90" />

        {/* HERO SECTION */}
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-4 sm:pt-8">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF8] border-3 border-black shadow-[3px_3px_0px_#000] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              AI-Powered Machine Troubleshooting Assistant
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-black mb-6">
            Fix Faster.<br />
            <span>Know Why.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-2xl font-bold text-black/85 max-w-2xl mx-auto mb-8 leading-snug">
            Sarva-Sense turns machine manuals, error codes, symptoms and HMI screenshots into clear, sourced troubleshooting guidance.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <button
              id="cta-start-troubleshooting"
              onClick={() => setCurrentRoute('dashboard')}
              className="neo-btn bg-black text-[#FED000] px-7 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2 shadow-[5px_6px_0px_#FFFDF8]"
            >
              <Wrench className="w-5 h-5 stroke-[2.5]" />
              <span>Start Troubleshooting</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              id="cta-explore-demo"
              onClick={() => loadDemoScenario('demo-1-e101')}
              className="neo-btn bg-[#FFFDF8] text-black px-6 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#FF3B81]" />
              <span>Explore Demo (E101)</span>
            </button>
          </div>

          {/* Hero Visual Surface Preview (Framed like the reference image) */}
          <div className="relative max-w-3xl mx-auto rounded-3xl bg-[#FFFDF8] border-4 border-black p-4 sm:p-6 shadow-[8px_10px_0px_#000] text-left">
            {/* Top header bar */}
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5C8A] border-2 border-black" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#FED000] border-2 border-black" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#4ADE80] border-2 border-black" />
                <span className="ml-2 font-mono text-xs font-black text-black">SARVA-SENSE WORKSPACE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black text-[10px] font-black uppercase">
                  Grounded RAG Engine
                </span>
              </div>
            </div>

            {/* Simulated Live Query Bar */}
            <div className="rounded-2xl border-3 border-black bg-[#FFFDF8] p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="font-mono text-base font-black text-black">#</span>
                <span className="font-extrabold text-sm sm:text-base text-black">
                  E101 on Hydraulic Press HP-200X
                </span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-black text-[#FED000] text-xs font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>

            {/* Answer Snippet with Citation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 rounded-2xl border-2.5 border-black bg-[#FED000]/25 p-3.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-black/60 mb-1">
                  DIAGNOSTIC OUTCOME
                </div>
                <div className="font-black text-base text-black mb-1">
                  Hydraulic Pressure Sensor Fault (PX-102)
                </div>
                <p className="text-xs font-bold text-black/80">
                  Transducer loop B feedback interrupted (&lt;3.6mA). Check M12 connector pins 31/32 and verify line pressure on gauge G-101.
                </p>
              </div>

              <div className="rounded-2xl border-2.5 border-black bg-[#FFFDF8] p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-black/60 mb-1">
                    OEM SOURCE CITATION
                  </div>
                  <div className="font-black text-xs text-black leading-tight">
                    HP-200 Service Manual
                  </div>
                  <div className="text-[11px] font-bold text-black/70">
                    Section 8.3 • Page 214
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-400 text-black border border-black text-[10px] font-black">
                    96% Evidence Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 CORE CAPABILITIES GRID */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-3">
              Engineered for Industrial Reliability
            </h2>
            <p className="text-base sm:text-lg font-bold text-black/75 max-w-xl mx-auto">
              Not another generic chat assistant. Sarva-Sense is strictly grounded in real OEM documentation, vision telemetry, and plant safety codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FolderCard
              title="Manual Intelligence"
              subtitle="RAG PIPELINE"
              tabColor="#4ADE80"
              icon={<FileSearch className="w-5 h-5" />}
              badgeText="Minimum Hallucinations"
              badgeColor="#FFFDF8"
              secondaryBadge="OEM Ready"
              onClick={() => setCurrentRoute('manuals')}
            />

            <FolderCard
              title="OCR for Scanned Manuals"
              subtitle="NEURAL VISION"
              tabColor="#FEF08A"
              icon={<Layers className="w-5 h-5" />}
              badgeText="Multi-column & Tables"
              badgeColor="#FFFDF8"
              onClick={() => setCurrentRoute('ocr')}
            />

            <FolderCard
              title="HMI Screenshot Analysis"
              subtitle="SCREEN VISION"
              tabColor="#38BDF8"
              icon={<Camera className="w-5 h-5" />}
              badgeText="Telemetry Boxes"
              badgeColor="#FFFDF8"
              secondaryBadge="Vision AI"
              onClick={() => setCurrentRoute('screenshot')}
            />

            <FolderCard
              title="Voice Troubleshooting"
              subtitle="HANDS-FREE"
              tabColor="#FB7185"
              icon={<Mic className="w-5 h-5" />}
              badgeText="Shopfloor Audio"
              badgeColor="#FFFDF8"
              onClick={() => setCurrentRoute('voice')}
            />

            <FolderCard
              title="Multilingual Reports"
              subtitle="EXPORT & SHARE"
              tabColor="#C084FC"
              icon={<FileText className="w-5 h-5" />}
              badgeText="15 Languages"
              badgeColor="#FFFDF8"
              secondaryBadge="PDF / Print"
              onClick={() => setCurrentRoute('reports')}
            />

            <FolderCard
              title="Source-Verified Answers"
              subtitle="TRACEABILITY"
              tabColor="#FED000"
              icon={<ShieldCheck className="w-5 h-5" />}
              badgeText="Page & Section Level"
              badgeColor="#FFFDF8"
              onClick={() => setCurrentRoute('troubleshoot')}
            />
          </div>
        </div>

        {/* BOTTOM HACKATHON JURY BANNER */}
        <div className="mt-16 rounded-3xl bg-black text-[#FFFDF8] border-4 border-black p-6 sm:p-8 shadow-[6px_8px_0px_#FFFDF8] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#FED000]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#FED000]">
                HACKATHON JURY READY PROTOTYPE
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Ready to test real machine troubleshooting?
            </h3>
            <p className="text-sm font-bold text-[#FFFDF8]/70 mt-1 max-w-xl">
              Explore 7 simulated scenarios including cross-manual ambiguity, no-hallucination refusal, and live HMI vision analysis.
            </p>
          </div>

          <button
            onClick={() => setCurrentRoute('dashboard')}
            className="neo-btn bg-[#FED000] text-black px-6 py-3.5 rounded-2xl font-black text-base flex-shrink-0 flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
