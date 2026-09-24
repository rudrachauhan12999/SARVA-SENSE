import React, { useState } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  Layers,
  Table,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeatureGate } from '../components/common/FeatureGate';
import { ocrService } from '../services/api';
import { OCRPageAnalysis } from '../types';
import { MOCK_OCR_PAGE } from '../data/mockData';

export const OCRPage: React.FC = () => {
  const { showToast, setCurrentRoute } = useApp();

  const [processing, setProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [ocrData, setOcrData] = useState<OCRPageAnalysis>(MOCK_OCR_PAGE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(MOCK_OCR_PAGE.rawText);

  const handleReprocess = async () => {
    setProcessing(true);
    try {
      const data = await ocrService.processScannedPage(
        214,
        (stage) => {
          setCurrentStage(stage);
        },
        'man-hp-1'
      );
      setOcrData(data);
      setEditedText(data.rawText);
      showToast('Page 214 re-processed successfully with 97.4% confidence', 'success');
    } catch {
      showToast('Error reprocessing OCR', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = () => {
    showToast('OCR approved and committed to RAG vector index!', 'success');
    setCurrentRoute('manuals');
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#4ADE80] text-black border-2 border-black text-xs font-black uppercase">
                  Document Intelligence
                </span>
                <span className="text-xs font-bold text-black/60">• Scanned Manual OCR</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                OCR Review & Entity Parser
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Inspect high-accuracy OCR extraction on technical schematics, alarm tables, and safety steps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReprocess}
                disabled={processing}
                className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
                <span>Reprocess Page</span>
              </button>

              <button
                onClick={handleApprove}
                className="neo-btn bg-black text-[#FED000] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_#FFFDF8]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve & Index</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Gating Wrapper */}
        <FeatureGate
          feature="ocr"
          featureName="Scanned Manual OCR"
          requiredPlan="plus"
          description="High-density OCR scanning and table parsing requires a Plus or Pro subscription."
        >
          {/* Main Workspace: Left Scanned Preview, Right Extracted Technical Text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Scanned Document Page Preview (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl border-4 border-black bg-[#FAF8F2] p-5 shadow-[6px_7px_0px_#000] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black/20 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-black" />
                    <span className="font-black text-xs text-black">
                      HP-200 Service Manual • Page {ocrData.pageNumber}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black text-[10px] font-black">
                    {ocrData.confidence}% Confidence
                  </span>
                </div>

                {/* Simulated Scanned Page with Visual Markers */}
                <div className="relative rounded-2xl border-2.5 border-black bg-white p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] font-mono text-xs text-black/85 space-y-3">
                  <div className="flex justify-between text-[10px] text-black/40 border-b border-black/10 pb-1 font-bold">
                    <span>OEM SERVICE CODEBOOK</span>
                    <span>FIG 8.3-A</span>
                  </div>

                  <div className="font-black text-sm text-black border-l-3 border-black pl-2">
                    SECTION 8.3 — HYDRAULIC DIAGNOSTIC & ALARM MATRIX
                  </div>

                  {/* Highlighted OCR entity box */}
                  <div className="p-2.5 rounded-xl bg-red-100 border-2 border-red-500 font-bold">
                    <div className="text-[9px] font-black text-red-700 uppercase">
                      Detected Alarm Entity
                    </div>
                    <div className="text-black">
                      <strong>Code: E101</strong> — Hydraulic pressure sensor circuit error (PX-102 open circuit).
                    </div>
                  </div>

                  {/* Warning block */}
                  <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-amber-500 font-bold">
                    <div className="text-[9px] font-black text-amber-800 uppercase">
                      Safety Warning Detected
                    </div>
                    <div>
                      ⚠ Lock-Out / Tag-Out required before opening Bleed Valve BV-01.
                    </div>
                  </div>

                  {/* Table detection representation */}
                  <div className="p-2.5 rounded-xl bg-blue-50 border-2 border-blue-400">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-800 uppercase mb-1">
                      <Table className="w-3 h-3" />
                      <span>Table 8.3-A Extracted (14 Rows)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                      <span className="bg-white p-1 border border-black/20">PIN 31: 4-20mA</span>
                      <span className="bg-white p-1 border border-black/20">PIN 32: GND</span>
                      <span className="bg-white p-1 border border-black/20">PX-102 MANIFOLD</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-black/40 italic">
                    Scanned at 600 DPI • De-skewed 1.2° • Bi-tonal OCR engine
                  </div>
                </div>

                {/* Detected Entities Summary Chips */}
                <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FFFDF8] space-y-2">
                  <div className="text-xs font-black uppercase text-black">Detected Entities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ocrData.detectedEntities.errorCodes.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-rose-200 border border-black text-[11px] font-black">
                        Code: {c}
                      </span>
                    ))}
                    {ocrData.detectedEntities.sections.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-blue-200 border border-black text-[11px] font-black">
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200 border border-black text-[11px] font-black">
                      Table: 8.3-A
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 border border-black text-[11px] font-black">
                      LOTO Warning
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Extracted Technical Text with Editable Mode (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-5 shadow-[6px_7px_0px_#000] space-y-4">
                <div className="flex items-center justify-between border-b-2.5 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-base text-black">Extracted Knowledge</h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="neo-btn bg-[#FFFDF8] px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'View Formatted' : 'Edit Raw Text'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={14}
                      className="w-full rounded-2xl border-2.5 border-black bg-[#FAF8F2] p-3 font-mono text-xs text-black outline-none focus:ring-2 focus:ring-black"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          showToast('Changes saved to page extraction buffer', 'success');
                        }}
                        className="neo-btn bg-black text-[#FED000] px-4 py-1.5 rounded-xl text-xs font-black"
                      >
                        Save Text Adjustments
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ocrData.structuredBlocks.map((block, idx) => {
                      if (block.type === 'warning') {
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-amber-200 border-2 border-black text-xs font-black">
                            {block.content}
                          </div>
                        );
                      }
                      if (block.type === 'table') {
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-blue-100 border-2 border-black text-xs font-bold font-mono">
                            {block.content}
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-[#FAF8F2] border-2 border-black text-xs font-bold leading-relaxed text-black/90">
                          {block.content}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-3 border-t-2 border-black/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-black/70">Ready for semantic retrieval</span>
                  <button
                    onClick={handleApprove}
                    className="neo-btn bg-[#4ADE80] text-black px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5"
                  >
                    <span>Commit to Knowledge Base</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
};
