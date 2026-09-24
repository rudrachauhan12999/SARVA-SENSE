import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
  Globe,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { SourceModal } from '../components/common/SourceModal';
import { LANGUAGES } from '../data/mockData';
import { LanguageCode, SourceCitation } from '../types';

export const TroubleshootPage: React.FC = () => {
  const {
    currentSession,
    selectedMachine,
    setSelectedMachine,
    machines,
    manuals,
    saveCurrentCase,
    sendFollowUpMessage,
    runTroubleshootQuery,
    responseLanguage,
    setResponseLanguage,
    viewingSource,
    setViewingSource,
    setCurrentRoute,
    loadDemoScenario,
  } = useApp();

  const [followUpInput, setFollowUpInput] = useState('');
  const [showEvidence, setShowEvidence] = useState(true);
  const [showWhyAnswer, setShowWhyAnswer] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const activeMachine =
    machines.find((m) => m.id === currentSession?.machineId) || selectedMachine || machines[0];
  const linkedManuals = manuals.filter(
    (man) => man.machineId === activeMachine?.id || man.machineId === 'hp-200x'
  );

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim()) return;
    sendFollowUpMessage(followUpInput);
    setFollowUpInput('');
  };

  const handleCopyAnswer = () => {
    setCopiedAnswer(true);
    navigator.clipboard?.writeText(
      `SARVA-SENSE DIAGNOSTIC REPORT\nMachine: ${activeMachine.name}\nFault: ${currentSession?.issueCode || 'Reported Issue'}`
    );
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  // NOTE: localization now happens server-side -- the backend receives
  // `responseLanguage` with every /api/troubleshoot request and Groq
  // generates the grounded answer directly in that language, so
  // `message.structuredAnswer` fields below are already in the right
  // language and don't need a client-side translation lookup table.

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#FFFDF8] border-3.5 border-black rounded-2xl p-3 shadow-[4px_5px_0px_#000]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#FED000] flex items-center justify-center border-2 border-black">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-black/60">
                  WORKSPACE DIAGNOSIS
                </span>
                <span className="px-2 py-0.2 rounded bg-emerald-400 border border-black text-[10px] font-black uppercase">
                  Active
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-black leading-none">
                {currentSession?.title || 'Interactive Troubleshooting'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Response Language Switcher (Multilingual requirement) */}
            <div className="flex items-center gap-1 bg-[#FED000]/40 border-2 border-black rounded-xl px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-black" />
              <span className="text-[11px] font-black text-black uppercase">Language:</span>
              <select
                id="select-response-lang"
                value={responseLanguage}
                onChange={(e) => setResponseLanguage(e.target.value as LanguageCode)}
                className="bg-transparent font-black text-xs text-black outline-none cursor-pointer"
              >
                {LANGUAGES.slice(0, 10).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveCurrentCase}
              className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black px-3 py-1.5 rounded-xl border-2.5 border-black text-xs font-black flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{currentSession?.isSaved ? 'Saved Case' : 'Save Case'}</span>
            </button>

            <button
              onClick={() => setCurrentRoute('reports')}
              className="neo-btn bg-black text-[#FED000] px-3.5 py-1.5 rounded-xl text-xs font-black"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* TWO-COLUMN WORKSPACE: LEFT = CONTEXT PANEL, RIGHT = CONVERSATION & STRUCTURED ANSWER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT CONTEXT PANEL (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Machine & Model Context Card */}
            <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-5 shadow-[5px_6px_0px_#000]">
              <div className="flex items-center justify-between border-b-2.5 border-black pb-3 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-black/70">
                  Target Machine Context
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-black/60 uppercase">Selected Machine</div>
                  <div className="font-black text-lg text-black">{activeMachine.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl border-2 border-black bg-[#FAF8F2]">
                    <div className="text-[10px] font-bold text-black/60 uppercase">Model</div>
                    <div className="font-extrabold text-black">{activeMachine.model}</div>
                  </div>
                  <div className="p-2 rounded-xl border-2 border-black bg-[#FAF8F2]">
                    <div className="text-[10px] font-bold text-black/60 uppercase">Serial</div>
                    <div className="font-extrabold text-black">{activeMachine.serialNumber}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-black/60 uppercase mb-1">
                    Indexed OEM Manuals ({linkedManuals.length})
                  </div>
                  <div className="space-y-1.5">
                    {linkedManuals.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-xl border-2 border-black bg-[#FED000]/20 flex items-center justify-between text-xs font-bold"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </div>
                        <span className="text-[10px] font-black bg-[#FFFDF8] px-1.5 py-0.5 rounded border border-black">
                          {m.pages}p
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Switch Machine Button */}
                <div className="pt-2 border-t border-black/15">
                  <label className="text-[10px] font-black uppercase text-black/60 block mb-1">
                    Switch Active Machine:
                  </label>
                  <select
                    value={activeMachine.id}
                    onChange={(e) => {
                      const m = machines.find((mac) => mac.id === e.target.value) || null;
                      setSelectedMachine(m);
                      if (currentSession && m) {
                        runTroubleshootQuery(
                          currentSession.issueCode || currentSession.title,
                          m
                        );
                      }
                    }}
                    className="w-full bg-[#FFFDF8] border-2 border-black rounded-xl p-2 font-bold text-xs outline-none"
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Hallucination Reduction Card ("Why am I seeing this answer?") */}
            <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-4 sm:p-5 shadow-[5px_6px_0px_#000]">
              <button
                onClick={() => setShowWhyAnswer(!showWhyAnswer)}
                className="w-full flex items-center justify-between text-left font-black text-xs sm:text-sm text-black"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Why am I seeing this answer?</span>
                </div>
                {showWhyAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWhyAnswer && (
                <div className="mt-3 pt-3 border-t-2 border-black/15 space-y-2.5 text-xs font-bold text-black/80 animate-in fade-in">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-black">
                    <div className="text-[10px] font-black uppercase text-emerald-800 mb-0.5">
                      Grounding Policy
                    </div>
                    <p className="text-black/80">
                      Answer strictly synthesized from retrieved PDF vectors. Zero external knowledge fabrication permitted.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-black text-black/60">Source Coverage:</span>
                    <div className="font-extrabold text-black">
                      HP-200 Service Manual Section 8.3 (Page 214) & Section 4.2 (Page 88)
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>Vector Confidence:</span>
                    <span className="font-mono font-black text-emerald-700">92% High Precision</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONVERSATION & ANSWER AREA (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Conversation Messages */}
            {currentSession?.messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div key={message.id} className="space-y-4">
                  {/* User Query Bubble */}
                  {isUser && (
                    <div className="flex justify-end">
                      <div className="max-w-xl rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-4 sm:p-5 shadow-[4px_5px_0px_#000]">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-black/60 mb-1">
                          <span>OPERATOR QUERY</span>
                          <span>•</span>
                          <span>{message.timestamp}</span>
                          {message.queryType && (
                            <span className="px-1.5 py-0.2 rounded bg-[#FED000] text-black border border-black">
                              {message.queryType}
                            </span>
                          )}
                        </div>
                        <p className="font-extrabold text-base sm:text-lg text-black">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Loading State with Stage Indicators */}
                  {message.isLoading && (
                    <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-6 shadow-[5px_6px_0px_#000] animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-[#FED000] border-2 border-black flex items-center justify-center animate-spin">
                          <RefreshCw className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-black">
                            SARVA-SENSE GROUNDING ENGINE ACTIVE
                          </div>
                          <div className="text-[11px] font-bold text-black/70">
                            {message.loadingStage || 'Searching technical indexes...'}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-2.5 border border-black overflow-hidden">
                        <div className="bg-[#FED000] h-full w-2/3 animate-progress" />
                      </div>
                    </div>
                  )}

                  {/* Ambiguity Resolution Component (Scenario 3) */}
                  {message.ambiguityOptions && (
                    <div className="rounded-3xl bg-[#FFFDF8] border-4 border-black p-6 shadow-[6px_7px_0px_#000] space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400 border-2 border-black text-xs font-black uppercase">
                          Cross-Manual Ambiguity Detected
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-black">
                        Which machine are you troubleshooting?
                      </h2>
                      <p className="text-sm font-bold text-black/75">
                        {message.text ||
                          'The error code appears in multiple equipment manuals with conflicting physical meanings:'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {message.ambiguityOptions.map((opt) => (
                          <div
                            key={opt.machineId}
                            onClick={() => {
                              const targetMachine = machines.find((m) => m.id === opt.machineId);
                              setSelectedMachine(targetMachine || null);
                              runTroubleshootQuery(
                                `E101 on ${opt.machineName}`,
                                targetMachine || null
                              );
                            }}
                            className="neo-btn p-4 rounded-2xl border-3 border-black bg-[#FAF8F2] hover:bg-[#FED000] cursor-pointer text-left transition-all"
                          >
                            <div className="text-xs font-black uppercase tracking-wider text-black/60 mb-1">
                              {opt.model}
                            </div>
                            <div className="font-black text-base text-black mb-1">
                              {opt.machineName}
                            </div>
                            <div className="text-xs font-bold text-black/80">{opt.meaning}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insufficient Information Component (Scenario 4) */}
                  {message.insufficientInfo && (
                    <div className="rounded-3xl bg-[#FFFDF8] border-4 border-black p-6 shadow-[6px_7px_0px_#000] space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-rose-400 border-2 border-black text-xs font-black uppercase text-black">
                          Insufficient Technical Evidence
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-black">
                        I couldn't find a reliable answer.
                      </h2>
                      <p className="text-sm font-bold text-black/80 leading-relaxed">
                        The available manuals do not provide enough verified schematic or acoustic evidence to safely diagnose this symptom. Sarva-Sense will not invent ungrounded repairs.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl border-2 border-black bg-emerald-50 text-xs font-bold">
                          <div className="font-black text-emerald-900 mb-1">What was searched:</div>
                          <ul className="list-disc list-inside space-y-1 text-black/80">
                            {message.insufficientInfo.found.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-2xl border-2 border-black bg-rose-50 text-xs font-bold">
                          <div className="font-black text-rose-900 mb-1">Missing OEM Manuals:</div>
                          <ul className="list-disc list-inside space-y-1 text-black/80">
                            {message.insufficientInfo.missing.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FED000]/25 text-xs font-extrabold text-black">
                        💡 Recommended Next Step: {message.insufficientInfo.recommendation}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => setCurrentRoute('upload-manual')}
                          className="neo-btn bg-black text-[#FED000] px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Machine Manual</span>
                        </button>
                        <button
                          onClick={() => loadDemoScenario('demo-1-e101')}
                          className="neo-btn bg-[#FFFDF8] text-black px-4 py-2.5 rounded-xl font-black text-xs"
                        >
                          Try Another Known Query
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STRUCTURED ANSWER (The core technical output!) */}
                  {message.structuredAnswer && (
                    <div className="rounded-3xl bg-[#FFFDF8] border-4 border-black p-6 sm:p-8 shadow-[7px_8px_0px_#000] space-y-6">
                      {/* Answer Header: Verification Badges & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-4">
                        <ConfidenceBadge
                          verificationState={message.structuredAnswer.verificationState}
                          confidence={message.structuredAnswer.confidence}
                          evidenceCoverage={message.structuredAnswer.evidenceCoverage}
                          machineMatch={message.structuredAnswer.machineMatch}
                          claimsSupported={message.structuredAnswer.claimsSupported}
                        />

                        <button
                          onClick={handleCopyAnswer}
                          className="neo-btn bg-[#FFFDF8] px-3 py-1 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1"
                        >
                          {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* SECTION 1: ERROR MEANING */}
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-1">
                          ERROR MEANING
                        </div>
                        <div className="font-black text-xl sm:text-2xl text-black leading-snug">
                          {message.structuredAnswer.errorMeaning}
                        </div>
                      </div>

                      {/* SECTION 2: PROBABLE CAUSES */}
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-2">
                          PROBABLE CAUSES
                        </div>
                        <div className="space-y-2">
                          {message.structuredAnswer.probableCauses.map((cause, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-black bg-[#FAF8F2] text-xs sm:text-sm font-bold text-black"
                            >
                              <span className="w-5 h-5 rounded-lg bg-[#FED000] border-1.5 border-black flex items-center justify-center font-black text-xs flex-shrink-0">
                                {i + 1}
                              </span>
                              <span>{cause}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: CORRECTIVE ACTION (Numbered Steps) */}
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-2">
                          CORRECTIVE ACTION STEPS
                        </div>
                        <div className="space-y-2.5">
                          {message.structuredAnswer.correctiveActions.map((action, idx) => (
                            <div
                              key={action.step}
                              className={`p-4 rounded-2xl border-2.5 border-black shadow-[2px_2px_0px_#000] ${
                                action.safetyCritical
                                  ? 'bg-[#FEF08A] border-black'
                                  : 'bg-[#FFFDF8]'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-black text-[#FED000] text-xs font-black">
                                  Step {action.step}
                                </span>
                                <h3 className="font-black text-sm sm:text-base text-black">
                                  {action.title}
                                </h3>
                                {action.safetyCritical && (
                                  <span className="ml-auto px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-black uppercase">
                                    LOTO Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-black/85 leading-relaxed pl-1">
                                {action.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 4: ⚠ SAFETY WARNING CARD */}
                      <div className="p-4 sm:p-5 rounded-2xl border-3 border-black bg-[#FF5C8A] text-white shadow-[4px_4px_0px_#000]">
                        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider mb-1">
                          <AlertTriangle className="w-5 h-5 text-[#FED000] stroke-[2.5]" />
                          <span>⚠ SAFETY-CRITICAL PRECAUTION</span>
                        </div>
                        <p className="font-extrabold text-xs sm:text-sm leading-relaxed text-white">
                          {message.structuredAnswer.safetyWarning}
                        </p>
                      </div>

                      {/* SECTION 5: RETRIEVED EVIDENCE & CLICKABLE SOURCES */}
                      <div className="pt-2 border-t-3 border-black">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider text-black/60">
                              RETRIEVED OEM EVIDENCE ({message.structuredAnswer.sources.length})
                            </div>
                            <div className="text-xs font-bold text-black/70">
                              Click any source to inspect verified manual page & highlighted passages
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {message.structuredAnswer.sources.map((src) => (
                            <div
                              key={src.id}
                              onClick={() => setViewingSource(src)}
                              className="group p-3.5 rounded-2xl border-2.5 border-black bg-[#FFFDF8] hover:bg-[#FED000]/40 cursor-pointer shadow-[3px_3px_0px_#000] transition-all"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="px-2 py-0.5 rounded bg-emerald-300 text-black border border-black text-[10px] font-black">
                                  {src.relevance}% Match
                                </span>
                                <span className="text-[10px] font-mono font-black text-black">
                                  Page {src.page}
                                </span>
                              </div>
                              <h4 className="font-black text-xs sm:text-sm text-black group-hover:underline line-clamp-1">
                                {src.manualTitle}
                              </h4>
                              <p className="text-[11px] font-bold text-black/70 line-clamp-1 mt-0.5">
                                {src.section}
                              </p>
                              <div className="mt-2 text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-black">
                                  <span>View Source</span>
                                  <ExternalLink className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contextual Follow-up Input Bar */}
            <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-3 sm:p-4 shadow-[5px_6px_0px_#000]">
              <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
                <input
                  id="input-followup"
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder="Ask a follow-up (e.g. 'What if that doesn't fix it?')..."
                  className="w-full bg-[#FAF8F2] border-2 border-black rounded-2xl p-3 font-bold text-xs sm:text-sm text-black outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  id="btn-send-followup"
                  className="neo-btn bg-black text-[#FED000] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-black"
                  title="Send Follow-up"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Source Viewer Modal */}
      <SourceModal source={viewingSource} onClose={() => setViewingSource(null)} />
    </div>
  );
};
