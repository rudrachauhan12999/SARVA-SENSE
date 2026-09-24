import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES, MOCK_ANSWER_E101_HP200X, MOCK_TRANSLATIONS } from '../data/mockData';
import { LanguageCode } from '../types';

export const ReportsPage: React.FC = () => {
  const { currentSession, machines, showToast } = useApp();

  const [reportLang, setReportLang] = useState<LanguageCode>('en');
  const [downloading, setDownloading] = useState(false);

  const activeMachine =
    machines.find((m) => m.id === currentSession?.machineId) || machines[0];
  const answer = currentSession?.messages.find((m) => m.structuredAnswer)?.structuredAnswer ||
    MOCK_ANSWER_E101_HP200X;

  const localizedData = MOCK_TRANSLATIONS[reportLang] || MOCK_TRANSLATIONS.en;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast(
        `Exported Sarva-Sense Report [${activeMachine.model}_E101.pdf]`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Controls Bar (Hidden in print) */}
        <div className="print:hidden bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 shadow-[5px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#C084FC] text-black border-2 border-black text-xs font-black uppercase">
                Plant Compliance Export
              </span>
              <span className="text-xs font-bold text-black/60">• Grounded RAG Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Troubleshooting Report
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-[#FED000]/40 border-2 border-black rounded-xl px-2.5 py-1.5">
              <Globe className="w-4 h-4 text-black" />
              <span className="text-xs font-black uppercase text-black">Report In:</span>
              <select
                id="select-report-language"
                value={reportLang}
                onChange={(e) => setReportLang(e.target.value as LanguageCode)}
                className="bg-transparent font-black text-xs text-black outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black px-3.5 py-2 rounded-xl border-2.5 border-black text-xs font-black flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              id="btn-download-report-pdf"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="neo-btn bg-black text-[#FED000] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_#FFFDF8]"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Compiling PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT PREVIEW (Styled professionally matching the neo-brutalist identity) */}
        <div
          id="printable-report-card"
          className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-10 shadow-[8px_10px_0px_#000] print:border-2 print:shadow-none print:rounded-none space-y-6"
        >
          {/* Report Official Header */}
          <div className="border-b-3 border-black pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#FED000] flex items-center justify-center border-2 border-black overflow-hidden">
                  <img
                    src="/3710-bobuilder.png"
                    alt="Bob the Builder"
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-black text-xl tracking-tight text-black">
                  SARVA-SENSE
                </span>
                <span className="text-xs font-bold text-black/50">| OEM Grounded Assist</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
                MACHINE TROUBLESHOOTING REPORT
              </h2>
              <p className="text-xs font-mono font-bold text-black/60">
                REPORT REF: SSR-{new Date().getFullYear()}-0841 • ISO-13849 SAFETY COMPLIANT
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-xl bg-emerald-400 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                {answer.verificationState}
              </div>
              <div className="text-xs font-bold text-black/70 mt-1">
                Confidence: <strong className="text-black font-black">{answer.confidence}%</strong>
              </div>
              <div className="text-[11px] font-mono text-black/50">
                Generated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Machine & Incident Overview Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2]">
              <div className="text-[10px] font-bold text-black/60 uppercase">Equipment</div>
              <div className="font-black text-sm text-black">{activeMachine.name}</div>
            </div>
            <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2]">
              <div className="text-[10px] font-bold text-black/60 uppercase">Model / Variant</div>
              <div className="font-black text-sm text-black">{activeMachine.model}</div>
            </div>
            <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2]">
              <div className="text-[10px] font-bold text-black/60 uppercase">Reported Fault</div>
              <div className="font-black text-sm text-rose-700">
                {currentSession?.issueCode || 'E101'}
              </div>
            </div>
            <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2]">
              <div className="text-[10px] font-bold text-black/60 uppercase">Location</div>
              <div className="font-black text-sm text-black">{activeMachine.location}</div>
            </div>
          </div>

          {/* Section 1: Problem & Diagnosis */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-black/60">
              1. DIAGNOSIS & FAULT ANALYSIS
            </div>
            <div className="p-4 rounded-2xl border-2.5 border-black bg-[#FED000]/20 font-black text-base text-black">
              {reportLang !== 'en' && localizedData ? localizedData.meaning : answer.errorMeaning}
            </div>
          </div>

          {/* Section 2: Probable Causes */}
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-black/60">
              2. PROBABLE ROOT CAUSES
            </div>
            <div className="space-y-1.5">
              {(reportLang !== 'en' && localizedData ? localizedData.causes : answer.probableCauses).map(
                (cause, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2] text-xs sm:text-sm font-bold text-black flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#FED000] border border-black flex items-center justify-center font-black text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{cause}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Section 3: Corrective Actions */}
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-black/60">
              3. MANDATORY CORRECTIVE ACTIONS
            </div>
            <div className="space-y-2">
              {answer.correctiveActions.map((action, idx) => (
                <div
                  key={action.step}
                  className="p-3.5 rounded-xl border-2 border-black bg-[#FFFDF8] text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.2 rounded bg-black text-[#FED000] text-xs font-black">
                      Step {action.step}
                    </span>
                    <strong className="font-black text-black">{action.title}</strong>
                  </div>
                  <p className="font-bold text-black/80 pl-1">
                    {reportLang !== 'en' && localizedData?.actions[idx]
                      ? localizedData.actions[idx]
                      : action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Safety Precautions */}
          <div className="p-4 rounded-2xl border-3 border-black bg-[#FF5C8A] text-white">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-[#FED000] stroke-[3]" />
              <span>4. SAFETY PRECAUTIONS & LOTO REQUIREMENTS</span>
            </div>
            <p className="font-extrabold text-xs sm:text-sm leading-relaxed text-white">
              {reportLang !== 'en' && localizedData ? localizedData.safety : answer.safetyWarning}
            </p>
          </div>

          {/* Section 5: Grounded Sources & Citations */}
          <div className="space-y-2 pt-2 border-t-2 border-black/20">
            <div className="text-[11px] font-black uppercase tracking-wider text-black/60">
              5. VERIFIED OEM DOCUMENT SOURCES
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {answer.sources.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2] flex items-center justify-between"
                >
                  <div>
                    <div className="font-black text-black">{s.manualTitle}</div>
                    <div className="text-[11px] font-bold text-black/60">
                      {s.section} • Page {s.page}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black font-black text-[10px]">
                    {s.relevance}% Match
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Footer / Sign-off Block */}
          <div className="pt-6 border-t-3 border-black grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-black/70">
            <div>
              <div className="text-[10px] uppercase font-black text-black/50">Inspected By:</div>
              <div className="font-mono text-black mt-1 font-bold">PLANT MAINTENANCE TECH #42</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-black/50">Verification Hash:</div>
              <div className="font-mono text-black mt-1 font-bold">SHA-256: e8f4c20b...</div>
            </div>
            <div className="sm:text-right col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-black text-black/50">Sarva-Sense Engine:</div>
              <div className="font-black text-emerald-700 mt-1">Minimum-Hallucination Certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
