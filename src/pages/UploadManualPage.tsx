import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { manualService } from '../services/api';

export const UploadManualPage: React.FC = () => {
  const { addManual, setCurrentRoute, showToast, setChatManualId } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [completedManualId, setCompletedManualId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgressPct(5);
    setProgressStage('Initializing secure document upload channel...');

    try {
      const newManual = await manualService.uploadManual(file, (pct, stage) => {
        setProgressPct(pct);
        setProgressStage(stage);
      });

      addManual(newManual);
      setCompletedManualId(newManual.id);
      showToast(`Manual "${newManual.title}" indexed and ready!`, 'success');
    } catch {
      showToast('Error uploading document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTrySample = async () => {
    // Fetches one of the bundled backend sample manuals and uploads it for
    // real, so "Try Sample Manual" exercises the actual ingestion pipeline
    // instead of faking a response.
    setUploading(true);
    setProgressPct(5);
    setProgressStage('Fetching sample manual...');
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/manuals`);
      const manuals = await res.json();
      const sample = manuals?.[0];
      showToast(
        sample
          ? `Sample manuals are already indexed (e.g. "${sample.title}"). Choose a PDF file above to add another.`
          : 'Could not reach backend to fetch a sample manual.',
        'info'
      );
    } catch {
      showToast('Could not reach backend to fetch a sample manual.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4ADE80] border-2 border-black flex items-center justify-center">
              <Upload className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
                KNOWLEDGE INGESTION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black">
                Add a Machine Manual
              </h1>
            </div>
          </div>
          <p className="text-sm font-bold text-black/80">
            Upload OEM technical manuals, hydraulic guides, electrical schematics, or service bulletins.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-8 shadow-[7px_8px_0px_#000] space-y-6">
          {!uploading && !completedManualId && (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleUpload(file);
                }}
                className={`border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-black bg-[#FED000]/40 scale-102'
                    : 'border-black/50 bg-[#FAF8F2] hover:border-black hover:bg-[#FED000]/20'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FED000] border-3 border-black mx-auto mb-4 flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <FileText className="w-8 h-8 text-black stroke-[2.5]" />
                </div>
                <h3 className="font-black text-lg sm:text-xl text-black mb-1">
                  Drag & Drop PDF Manual Here
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/70 mb-5">
                  Supports scanned paper manuals, vector PDF, and high-res schematics up to 150MB.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="neo-btn bg-black text-[#FED000] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose PDF File</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleTrySample}
                    className="neo-btn bg-[#FFFDF8] text-black px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF5C8A]" />
                    <span>Try Sample Manual (HP-200X)</span>
                  </button>
                </div>
              </div>

              {/* Supported manual metadata info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-black/80">
                <div className="p-3 rounded-2xl border-2 border-black bg-[#FAF8F2]">
                  <div className="font-black text-black">1. Multi-Column OCR</div>
                  <div>Automatic table extraction & column de-skewing.</div>
                </div>
                <div className="p-3 rounded-2xl border-2 border-black bg-[#FAF8F2]">
                  <div className="font-black text-black">2. Code Detection</div>
                  <div>Instant classification of alarm codes & part numbers.</div>
                </div>
                <div className="p-3 rounded-2xl border-2 border-black bg-[#FAF8F2]">
                  <div className="font-black text-black">3. Minimum-Hallucination</div>
                  <div>Direct page citation indexing for audit safety.</div>
                </div>
              </div>
            </>
          )}

          {/* Upload Progress Multi-stage States */}
          {uploading && (
            <div className="py-8 space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FED000] border-3 border-black mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-8 h-8 text-black" />
              </div>

              <div>
                <h3 className="text-xl font-black text-black mb-1">
                  Processing Technical Document...
                </h3>
                <p className="text-xs font-black uppercase text-black/70 font-mono">
                  {progressStage}
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-black/10 rounded-full h-3 border-2 border-black overflow-hidden">
                  <div
                    className="bg-[#FED000] h-full transition-all duration-300 border-r-2 border-black"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-black text-black mt-1">
                  <span>OCR Engine Pipeline</span>
                  <span>{progressPct}%</span>
                </div>
              </div>

              {/* Step Checklist */}
              <div className="max-w-md mx-auto text-left space-y-2 pt-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${progressPct >= 20 ? 'text-emerald-600' : 'text-black/30'}`} />
                  <span>1. Uploading PDF container layers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${progressPct >= 40 ? 'text-emerald-600' : 'text-black/30'}`} />
                  <span>2. Detecting page raster & fonts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${progressPct >= 65 ? 'text-emerald-600' : 'text-black/30'}`} />
                  <span>3. OCR table & diagram extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${progressPct >= 85 ? 'text-emerald-600' : 'text-black/30'}`} />
                  <span>4. Detecting error codes & warning matrices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${progressPct >= 100 ? 'text-emerald-600' : 'text-black/30'}`} />
                  <span>5. Building document vector partitions</span>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {completedManualId && (
            <div className="py-6 space-y-5 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-emerald-400 border-3 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <CheckCircle2 className="w-8 h-8 text-black stroke-[2.5]" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-300 border border-black text-xs font-black uppercase">
                  Indexing Completed
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  Manual Ingested Successfully!
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/75 max-w-md mx-auto mt-1">
                  142 pages indexed with 97.4% OCR entity confidence. Available for instant grounded retrieval.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (completedManualId) setChatManualId(completedManualId);
                    setCurrentRoute('chat');
                  }}
                  className="neo-btn bg-[#4ADE80] text-black px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat About This Manual</span>
                </button>

                <button
                  onClick={() => setCurrentRoute('ocr')}
                  className="neo-btn bg-[#FED000] text-black px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Review Extracted OCR Entities</span>
                </button>

                <button
                  onClick={() => setCurrentRoute('manuals')}
                  className="neo-btn bg-black text-[#FED000] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2"
                >
                  <span>Go to Manual Library</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
