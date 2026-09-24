import React, { useState } from 'react';
import {
  Search,
  Plus,
  Mic,
  Camera,
  Wrench,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FolderCard } from '../components/cards/FolderCard';
import { Machine } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    setCurrentRoute,
    machines,
    selectedMachine,
    setSelectedMachine,
    runTroubleshootQuery,
    historySessions,
    loadDemoScenario,
  } = useApp();

  const [queryInput, setQueryInput] = useState('');
  const [activeMachineFilter, setActiveMachineFilter] = useState<string>('hp-200x');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) return;

    const targetMachine = machines.find((m) => m.id === activeMachineFilter) || null;
    runTroubleshootQuery(queryInput, targetMachine);
  };

  const samplePrompts = [
    { label: 'E101', query: 'E101 on HP-200X' },
    { label: 'Overheating', query: 'Why is the HP-200X overheating?' },
    { label: 'Cross-Manual Ambiguity', query: 'E101' },
    { label: 'Vibration & Noise', query: 'Why is my machine making a high-pitched noise?' },
  ];

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-6 sm:py-10">
      {/* Centered Application Container */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top App Surface Header (Reference Style) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black border-2.5 border-black flex items-center justify-center text-[#FED000] shadow-[2.5px_2.5px_0px_#FFFDF8]">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                INTELLIGENT DIAGNOSTIC HUB
              </span>
              <div className="text-xs font-black text-black">SARVA-SENSE</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentRoute('upload-manual')}
              className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Manual</span>
            </button>
            <button
              onClick={() => setCurrentRoute('settings')}
              className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black p-2 rounded-xl"
              title="Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Editorial Heading (Directly from requirement: "Find the fault. Fix the machine.") */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-[1.0]">
            Find the fault.<br />
            Fix the machine.
          </h1>
          <p className="text-base sm:text-lg font-bold text-black/80 max-w-xl">
            Ask about an error code, symptom, machine or HMI screen.
          </p>
        </div>

        {/* MAIN TROUBLESHOOTING INPUT CARD (Visual Reference Image Signature) */}
        <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-4 sm:p-5 shadow-[6px_7px_0px_#000]">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            {/* Machine Scope Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-mono font-black text-black/60 text-[11px] uppercase mr-1">
                EQUIPMENT:
              </span>
              <button
                type="button"
                onClick={() => setActiveMachineFilter('any')}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-black text-xs whitespace-nowrap transition-all ${
                  activeMachineFilter === 'any'
                    ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                    : 'bg-[#FFFDF8] text-black hover:bg-[#FED000]'
                }`}
              >
                All Machines (Detect)
              </button>
              {machines.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMachineFilter(m.id)}
                  className={`px-2.5 py-1 rounded-lg border-2 border-black font-black text-xs whitespace-nowrap transition-all ${
                    activeMachineFilter === m.id
                      ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                      : 'bg-[#FFFDF8] text-black hover:bg-[#FED000]'
                  }`}
                >
                  {m.name.split(' ')[0]} {m.model.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Input Row: Hash mark + text input + Yellow Action Button */}
            <div className="flex items-center gap-2 rounded-2xl border-3 border-black bg-white p-2 sm:p-2.5 shadow-[3px_3px_0px_#000] focus-within:ring-2 focus-within:ring-black">
              <span className="font-mono text-xl font-black text-black pl-2">#</span>
              <input
                id="main-troubleshoot-input"
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Describe the problem or enter an error code (e.g., E101)..."
                className="w-full bg-transparent border-none outline-none font-bold text-sm sm:text-base text-black placeholder:text-black/40 px-2"
              />
              <button
                type="submit"
                id="btn-ask-sarva-sense"
                className="neo-btn bg-[#FED000] hover:bg-[#FACC15] text-black w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2.5 border-black shadow-[2px_2px_0px_#000]"
                title="Ask Sarva-Sense"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Input Action Buttons & Sample Prompts */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-black/60 uppercase">Try:</span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryInput(p.query);
                      runTroubleshootQuery(
                        p.query,
                        machines.find((m) => m.id === activeMachineFilter) || null
                      );
                    }}
                    className="px-2 py-0.5 rounded-md border border-black bg-[#FFFDF8] hover:bg-[#FED000] text-[11px] font-bold text-black transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  id="btn-quick-voice"
                  onClick={() => setCurrentRoute('voice')}
                  className="neo-btn bg-[#FB7185] text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>
                <button
                  type="button"
                  id="btn-quick-screenshot"
                  onClick={() => setCurrentRoute('screenshot')}
                  className="neo-btn bg-[#38BDF8] text-black px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Screenshot</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* QUICK ACTIONS SECTION (Cards matching the reference image styling) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Quick Actions
            </h2>
            <span className="text-xs font-bold text-black/70">Select diagnostic mode</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FolderCard
              id="card-quick-error"
              title="Enter Error Code"
              subtitle="DIAGNOSTIC"
              tabColor="#4ADE80"
              icon={<AlertCircle className="w-5 h-5" />}
              badgeText="Fast Lookup"
              onClick={() => {
                setQueryInput('E101');
                runTroubleshootQuery('E101 on HP-200X', machines[0]);
              }}
            />

            <FolderCard
              id="card-quick-hmi"
              title="Analyze HMI Screenshot"
              subtitle="VISION AI"
              tabColor="#38BDF8"
              icon={<Camera className="w-5 h-5" />}
              badgeText="Alarm Boxes"
              secondaryBadge="NEW"
              onClick={() => setCurrentRoute('screenshot')}
            />

            <FolderCard
              id="card-quick-manual"
              title="Upload Manual"
              subtitle="OCR INDEX"
              tabColor="#FEF08A"
              icon={<Upload className="w-5 h-5" />}
              badgeText="Scanned PDF"
              onClick={() => setCurrentRoute('upload-manual')}
            />

            <FolderCard
              id="card-quick-voice"
              title="Ask by Voice"
              subtitle="HANDS FREE"
              tabColor="#FB7185"
              icon={<Mic className="w-5 h-5" />}
              badgeText="Shopfloor Mic"
              onClick={() => setCurrentRoute('voice')}
            />
          </div>
        </div>

        {/* YOUR MACHINES SECTION (Visual Reference Grid of Folder Cards!) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                My Machines
              </h2>
              <p className="text-xs font-bold text-black/70">
                Connected plant equipment with verified manuals
              </p>
            </div>
            <button
              onClick={() => setCurrentRoute('machines')}
              className="neo-btn bg-[#FFFDF8] text-black px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1"
            >
              <span>View All ({machines.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {machines.map((machine) => (
              <FolderCard
                key={machine.id}
                id={`card-machine-${machine.id}`}
                title={machine.name}
                subtitle={machine.category.split(' ')[0]}
                tabColor={machine.tabColor}
                iconBgColor={machine.iconColor}
                icon={<Activity className="w-5 h-5" />}
                badgeText={`${machine.manualCount} manuals`}
                secondaryBadge={machine.status === 'FAULT_REPORTED' ? 'FAULT' : undefined}
                onClick={() => {
                  setSelectedMachine(machine);
                  setCurrentRoute('troubleshoot');
                }}
              />
            ))}
          </div>
        </div>

        {/* RECENT TROUBLESHOOTING & SAVED CASES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recent History */}
          <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-5 shadow-[5px_6px_0px_#000]">
            <div className="flex items-center justify-between border-b-2.5 border-black pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FED000] border-2 border-black flex items-center justify-center overflow-hidden">
                  <img
                    src="/3710-bobuilder.png"
                    alt="Bob the Builder"
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-black text-base text-black">Recent Cases</h3>
              </div>
              <button
                onClick={() => setCurrentRoute('history')}
                className="text-xs font-black text-black hover:underline"
              >
                Full History →
              </button>
            </div>

            <div className="space-y-2.5">
              {historySessions.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentRoute('troubleshoot');
                  }}
                  className="group p-3 rounded-xl border-2 border-black bg-[#FAF8F2] hover:bg-[#FED000]/40 cursor-pointer transition-all flex items-start justify-between gap-3 shadow-[2px_2px_0px_#000]"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-400 border border-black text-[10px] font-black uppercase">
                        {s.verificationState}
                      </span>
                      <span className="text-[10px] font-bold text-black/60">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-black text-xs sm:text-sm text-black group-hover:underline">
                      {s.title}
                    </div>
                    <div className="text-[11px] font-bold text-black/70 mt-0.5">
                      {s.machineName}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-black flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Saved Cases / Highlights */}
          <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-5 shadow-[5px_6px_0px_#000]">
            <div className="flex items-center justify-between border-b-2.5 border-black pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FB7185] border-2 border-black flex items-center justify-center text-white font-black text-xs">
                  ★
                </div>
                <h3 className="font-black text-base text-black">Grounded Verification</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black text-[10px] font-black uppercase">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FED000]/20 space-y-2 text-xs font-bold text-black/90">
              <div className="flex items-center gap-2 text-emerald-800 font-black">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>OEM Verified Citations Only</span>
              </div>
              <p className="text-black/80 leading-relaxed">
                Sarva-Sense cross-references equipment models against indexed vector chunks. If evidence does not exist, the system safely refuses to fabricate diagnoses.
              </p>
              <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
                <span>Indexed Manuals: <strong>4 (1,213 pages)</strong></span>
                <span className="font-mono text-emerald-700">97.4% OCR Confidence</span>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setCurrentRoute('reports')}
                className="neo-btn w-full bg-[#C084FC] text-black py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Shift Troubleshooting Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
