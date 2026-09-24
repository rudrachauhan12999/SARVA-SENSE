import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Manual } from '../types';

export const ManualsPage: React.FC = () => {
  const { manuals, setCurrentRoute, setViewingSource, setChatManualId } = useApp();

  const [search, setSearch] = useState('');

  const filtered = manuals.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.machineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FEF08A] text-black border-2 border-black text-xs font-black uppercase">
                  Technical Knowledge Base
                </span>
                <span className="text-xs font-bold text-black/60">• 1,213 Verified Pages</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Manual Library
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Indexed OEM service documentation, schematics, and vector-embedded diagnostic tables.
              </p>
            </div>

            <button
              onClick={() => setCurrentRoute('upload-manual')}
              className="neo-btn bg-black text-[#FED000] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-[3px_3px_0px_#FFFDF8]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Manual PDF</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border-3 border-black bg-[#FFFDF8] p-3 shadow-[4px_4px_0px_#000] flex items-center gap-2">
          <Search className="w-4 h-4 text-black/60 pl-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manuals by equipment title, section, or keyword..."
            className="w-full bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-black"
          />
        </div>

        {/* Manuals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((manual) => (
            <div
              key={manual.id}
              className="rounded-3xl border-3.5 border-black bg-[#FFFDF8] p-5 shadow-[5px_6px_0px_#000] flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black text-[10px] font-black uppercase">
                      {manual.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FED000] border border-black text-[10px] font-black uppercase">
                      OCR: {manual.ocrStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-black/60">
                    {manual.fileSize}
                  </span>
                </div>

                <h3 className="text-xl font-black text-black leading-tight mb-1">
                  {manual.title}
                </h3>
                <div className="text-xs font-bold text-black/70">{manual.machineName}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <div className="p-2 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Pages</div>
                  <div className="font-black text-black">{manual.pages}</div>
                </div>
                <div className="p-2 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Revision</div>
                  <div className="font-black text-black truncate">{manual.version}</div>
                </div>
                <div className="p-2 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Uploaded</div>
                  <div className="font-black text-black">{manual.uploadedDate}</div>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-black/15 flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setChatManualId(manual.id);
                    setCurrentRoute('chat');
                  }}
                  className="neo-btn bg-[#4ADE80] hover:bg-[#22C55E] text-black px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat with Manual</span>
                </button>

                <button
                  onClick={() => setCurrentRoute('ocr')}
                  className="neo-btn bg-[#FAF8F2] hover:bg-[#FED000] text-black px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>OCR Entities</span>
                </button>

                <button
                  onClick={() => {
                    setViewingSource({
                      id: 'src-view',
                      manualTitle: manual.title,
                      section: 'Section 8.3: Diagnostic & Alarm Codebook',
                      page: 214,
                      relevance: 96,
                      matchedKeywords: ['E101', 'Hydraulic', 'Transducer', 'LOTO'],
                      snippet:
                        'ALARM CODE E101: Hydraulic pressure sensor circuit error. Analog loop feedback <3.6mA trips protective ramp-down.',
                      highlightedPhrase:
                        'E101 indicates analog signal loss on pressure transducer PX-102.',
                      documentType: 'Service Manual',
                    });
                  }}
                  className="neo-btn bg-black text-[#FED000] px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5"
                >
                  <span>Sample Citations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
