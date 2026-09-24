import React, { useState } from 'react';
import {
  Clock,
  Bookmark,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TroubleshootingSession } from '../types';

export const HistoryPage: React.FC = () => {
  const {
    historySessions,
    setCurrentSession,
    setCurrentRoute,
    deleteSavedCase,
    saveCurrentCase,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [search, setSearch] = useState('');

  const filtered = historySessions.filter((s) => {
    const matchTab = activeTab === 'all' || s.isSaved;
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.machineName && s.machineName.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  const handleOpenCase = (session: TroubleshootingSession) => {
    setCurrentSession(session);
    setCurrentRoute('troubleshoot');
    showToast(`Loaded troubleshooting case: ${session.title}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FED000] text-black border-2 border-black text-xs font-black uppercase">
                  Session Logbook
                </span>
                <span className="text-xs font-bold text-black/60">• Grounded Diagnostics History</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Troubleshooting History
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Review, reopen, and export previous diagnostic sessions and saved plant cases.
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Search Controls */}
        <div className="rounded-2xl border-3 border-black bg-[#FFFDF8] p-3 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
                activeTab === 'all'
                  ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                  : 'bg-[#FFFDF8] text-black hover:bg-[#FED000]'
              }`}
            >
              All Cases ({historySessions.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
                activeTab === 'saved'
                  ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                  : 'bg-[#FFFDF8] text-black hover:bg-[#FED000]'
              }`}
            >
              Saved Cases ({historySessions.filter((s) => s.isSaved).length})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF8F2] rounded-xl border-2 border-black px-3 py-1.5 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-black/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search historical cases..."
              className="bg-transparent border-none outline-none font-bold text-xs text-black w-full"
            />
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border-3.5 border-black bg-[#FFFDF8] p-10 text-center shadow-[5px_6px_0px_#000]">
              <Clock className="w-12 h-12 text-black/40 mx-auto mb-3" />
              <h3 className="text-xl font-black text-black">No troubleshooting cases yet.</h3>
              <p className="text-xs sm:text-sm font-bold text-black/70 max-w-sm mx-auto mt-1 mb-4">
                Run a diagnostic query from the dashboard to start logging equipment sessions.
              </p>
              <button
                onClick={() => setCurrentRoute('dashboard')}
                className="neo-btn bg-[#FED000] text-black px-4 py-2 rounded-xl font-black text-xs"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            filtered.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl border-3 border-black bg-[#FFFDF8] p-4 shadow-[4px_5px_0px_#000] hover:shadow-[6px_7px_0px_#000] transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.2 rounded bg-emerald-400 border border-black text-[10px] font-black uppercase">
                      {session.verificationState}
                    </span>
                    {session.isSaved && (
                      <span className="px-2 py-0.2 rounded bg-[#FB7185] text-white border border-black text-[10px] font-black uppercase">
                        Saved
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-black/60">
                      {new Date(session.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-black leading-snug">
                    {session.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs font-bold text-black/70">
                    <span>Machine: <strong className="text-black">{session.machineName}</strong></span>
                    <span>•</span>
                    <span>Sources: {session.sourceCount || 2} citations</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCase(session)}
                    className="neo-btn bg-black text-[#FED000] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Open Case</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSession(session);
                      setCurrentRoute('reports');
                    }}
                    className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black p-2 rounded-xl border-2 border-black"
                    title="Export Report"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteSavedCase(session.id)}
                    className="neo-btn bg-[#FFFDF8] hover:bg-rose-200 text-black p-2 rounded-xl border-2 border-black"
                    title="Delete Case"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
