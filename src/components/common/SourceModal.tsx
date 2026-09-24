import React from 'react';
import { X, ExternalLink, ShieldCheck, BookOpen, Copy, Check, FileText } from 'lucide-react';
import { SourceCitation } from '../../types';

interface SourceModalProps {
  source: SourceCitation | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ source, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `Source: ${source.manualTitle}, ${source.section}, Page ${source.page} - "${source.snippet}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-3xl border-4 border-black shadow-[8px_10px_0px_#000] p-6 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b-3 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FED000] border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <BookOpen className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-black border border-black text-[10px] font-black uppercase tracking-wider">
                  OEM Grounded Evidence
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FFFDF8] text-black border border-black text-[10px] font-black">
                  {source.relevance}% Match
                </span>
              </div>
              <h2 className="text-xl font-black text-black leading-tight mt-1">
                {source.manualTitle}
              </h2>
              <p className="text-xs font-bold text-black/70">{source.section}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black p-2 rounded-xl border-2.5 border-black"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scanned Document Simulation with Highlighted Marker */}
        <div className="my-4 overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Document metadata banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FED000]/30 border-2 border-black">
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <FileText className="w-4 h-4 text-black" />
              <span>Document Page: <strong className="underline">Page {source.page}</strong></span>
              <span>•</span>
              <span>Doc Type: {source.documentType}</span>
            </div>
            <button
              onClick={handleCopy}
              className="neo-btn bg-[#FFFDF8] px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Citation</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>

          {/* Scanned page preview container */}
          <div className="bg-[#FAF8F2] border-3 border-black rounded-2xl p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] font-mono text-sm leading-relaxed text-black/90">
            <div className="border-b border-black/20 pb-2 mb-3 flex items-center justify-between text-xs text-black/50">
              <span>HP-200X OEM ENGINEERING REPOSITORY</span>
              <span>INDEXED VECTOR CHUNK #214-B</span>
            </div>

            <p className="mb-3 text-xs text-black/60 italic">
              [...] Previous context: Primary Manifold Block A diagnostic telemetry and sensor pinout [...]
            </p>

            {/* Highlighted text block */}
            <div className="my-3 p-4 rounded-xl bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_#000]">
              <div className="text-[10px] font-black uppercase tracking-wider text-black/60 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>GROUNDED PASSAGE EXTRACT</span>
              </div>
              <p className="font-extrabold text-black text-sm sm:text-base leading-snug">
                "{source.snippet}"
              </p>
              <div className="mt-2.5 pt-2 border-t border-black/20 text-xs font-bold text-black/80">
                Key phrase: <mark className="bg-emerald-300 px-1 py-0.5 rounded font-black text-black">{source.highlightedPhrase}</mark>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/20">
              <div className="text-xs font-bold text-black mb-1.5">Matched Keywords:</div>
              <div className="flex flex-wrap gap-1.5">
                {source.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md border border-black bg-[#FFFDF8] text-[11px] font-bold text-black"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t-3 border-black flex items-center justify-between">
          <div className="text-xs font-bold text-black/70 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>Minimum-Hallucination Grounding Guarantee</span>
          </div>

          <button
            onClick={onClose}
            className="neo-btn bg-black text-[#FED000] px-5 py-2 rounded-xl text-xs font-black"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
