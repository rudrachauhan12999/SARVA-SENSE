import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Lock,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HelpPage: React.FC = () => {
  const { setCurrentRoute } = useApp();

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#FED000] border-2 border-black flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
                SAFETY & GROUNDING PROTOCOLS
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black">
                Help & Safety Guidelines
              </h1>
            </div>
          </div>
          <p className="text-sm font-bold text-black/80">
            How Sarva-Sense enforces minimum hallucination, evidence citations, and industrial safety compliance.
          </p>
        </div>

        {/* 1. Minimum Hallucination Guarantee */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-8 shadow-[6px_7px_0px_#000] space-y-4">
          <div className="flex items-center gap-2 border-b-2.5 border-black pb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
            <h2 className="text-xl font-black text-black">
              The "Minimum-Hallucination" Architecture
            </h2>
          </div>

          <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
            Industrial machinery maintenance demands absolute precision. A fabricated torque spec or an invented pinout diagram can cause catastrophic equipment failure or severe injury. Sarva-Sense operates under strict deterministic constraints:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-black/85">
            <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FAF8F2] space-y-1">
              <div className="text-[10px] font-black uppercase text-black/60">1. Grounded Citations</div>
              <div className="font-black text-black">Verifiable Page References</div>
              <p className="text-black/70">Every recommended step cites the exact manual title, chapter, and page number.</p>
            </div>

            <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FAF8F2] space-y-1">
              <div className="text-[10px] font-black uppercase text-black/60">2. Refusal Mode</div>
              <div className="font-black text-black">Explicit "Information Not In Manual"</div>
              <p className="text-black/70">If a query cannot be verified in OEM documentation, Sarva-Sense explicitly states so.</p>
            </div>

            <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FAF8F2] space-y-1">
              <div className="text-[10px] font-black uppercase text-black/60">3. Optical Verification</div>
              <div className="font-black text-black">Direct PDF Snippet Inspection</div>
              <p className="text-black/70">Technicians can open the Source Viewer to visually inspect the actual scanned page.</p>
            </div>
          </div>
        </div>

        {/* 2. Mandatory LOTO Protocol */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-8 shadow-[6px_7px_0px_#000] space-y-4">
          <div className="flex items-center gap-2 border-b-2.5 border-black pb-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 stroke-[2.5]" />
            <h2 className="text-xl font-black text-black">
              Lock-Out / Tag-Out (LOTO) Compliance
            </h2>
          </div>

          <div className="p-4 rounded-2xl border-3 border-black bg-[#FF5C8A] text-white space-y-2">
            <div className="font-black text-sm uppercase tracking-wider text-[#FED000]">
              CRITICAL SAFETY MANDATE (OSHA 1910.147 / ISO 12100)
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-relaxed text-white">
              Before inspecting, disassembling, or calibrating hydraulic manifolds, electrical cabinets, or high-pressure cylinders:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm font-bold space-y-1 text-white/95">
              <li>Isolate all electrical main breakers (400V / 480V 3-phase).</li>
              <li>Affix personal safety padlock and danger tag to the hasp.</li>
              <li>Relieve residual hydraulic and pneumatic pressure (open manual bleed valves).</li>
              <li>Verify zero energy state using a calibrated multi-meter and pressure gauge.</li>
            </ul>
          </div>
        </div>

        {/* 3. Diagnostic Confidence Metrics */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-8 shadow-[6px_7px_0px_#000] space-y-3">
          <h3 className="font-black text-lg text-black">Confidence Rating Explained</h3>
          <div className="space-y-2 text-xs font-bold">
            <div className="p-3 rounded-xl border-2 border-black bg-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-black text-emerald-950">90% – 100% VERIFIED BY MANUAL:</span>
                <span className="text-emerald-800 ml-1">Exact alarm code and schematic match in OEM manual.</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border-2 border-black bg-amber-100 flex items-center justify-between">
              <div>
                <span className="font-black text-amber-950">70% – 89% PLAUSIBLE MATCH:</span>
                <span className="text-amber-800 ml-1">Symptom match across subsystem or adjacent revision.</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border-2 border-black bg-rose-100 flex items-center justify-between">
              <div>
                <span className="font-black text-rose-950">&lt; 70% NOT GROUNDED / CAUTION:</span>
                <span className="text-rose-800 ml-1">Manual lacks verified data; technician must escalate to OEM.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Troubleshooter */}
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentRoute('troubleshoot')}
            className="neo-btn bg-black text-[#FED000] px-6 py-3 rounded-2xl font-black text-sm inline-flex items-center gap-2 shadow-[4px_4px_0px_#FFFDF8]"
          >
            <span>Return to Troubleshooter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
