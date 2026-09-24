import React, { useState } from 'react';
import {
  Activity,
  Plus,
  BookOpen,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FolderCard } from '../components/cards/FolderCard';
import { Machine } from '../types';

export const MachinesPage: React.FC = () => {
  const { machines, setSelectedMachine, setCurrentRoute, runTroubleshootQuery } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeDetailMachine, setActiveDetailMachine] = useState<Machine | null>(null);

  const categories = ['ALL', 'Forming & Stamping', 'Precision Machining', 'Pneumatics & Air', 'Automated Packaging'];

  const filtered = machines.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#22C55E] text-black border-2 border-black text-xs font-black uppercase">
                  Asset Management
                </span>
                <span className="text-xs font-bold text-black/60">• Connected Plant Machinery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Machine Library
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Equipment fleet with indexed technical schematics, error registries, and active maintenance profiles.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedMachine(machines[0]);
                setCurrentRoute('troubleshoot');
              }}
              className="neo-btn bg-black text-[#FED000] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-[3px_3px_0px_#FFFDF8]"
            >
              <Wrench className="w-4 h-4" />
              <span>Diagnose Active Machine</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border-3 border-black bg-[#FFFDF8] p-3 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#FAF8F2] rounded-xl border-2 border-black px-3 py-1.5 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-black/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by machine name, model, serial..."
              className="bg-transparent border-none outline-none font-bold text-xs text-black w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-black transition-all border-2 border-black ${
                  selectedCategory === cat
                    ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                    : 'bg-[#FFFDF8] text-black hover:bg-[#FED000]'
                }`}
              >
                {cat === 'ALL' ? 'All Equipment' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Cards Grid (Matching reference image card visual structure) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((machine) => (
            <div key={machine.id} className="relative">
              <FolderCard
                title={machine.name}
                subtitle={machine.category.split(' ')[0]}
                tabColor={machine.tabColor}
                iconBgColor={machine.iconColor}
                icon={<Activity className="w-5 h-5" />}
                badgeText={`${machine.manualCount} Manuals`}
                secondaryBadge={machine.status === 'FAULT_REPORTED' ? 'FAULT' : undefined}
                onClick={() => setActiveDetailMachine(machine)}
              />

              {/* Quick Launch Troubleshoot Button */}
              <div className="mt-2 flex items-center justify-between px-2 text-xs font-bold">
                <span className="text-black/60">{machine.location.split('-')[0]}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMachine(machine);
                    runTroubleshootQuery(`E101 on ${machine.name}`, machine);
                  }}
                  className="font-black text-black hover:underline flex items-center gap-1"
                >
                  <span>Diagnose</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Machine Detailed Spec Modal */}
        {activeDetailMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FFFDF8] rounded-3xl border-4 border-black p-6 max-w-lg w-full shadow-[8px_10px_0px_#000] space-y-4">
              <div className="flex items-start justify-between border-b-2.5 border-black pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-black text-[#FED000] text-[10px] font-black uppercase">
                    {activeDetailMachine.category}
                  </span>
                  <h3 className="text-xl font-black text-black mt-1">
                    {activeDetailMachine.name}
                  </h3>
                  <p className="text-xs font-bold text-black/60">{activeDetailMachine.model}</p>
                </div>
                <button
                  onClick={() => setActiveDetailMachine(null)}
                  className="neo-btn bg-[#FFFDF8] p-1.5 rounded-lg border-2 border-black font-black"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="p-2.5 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Serial Number</div>
                  <div className="font-black text-black">{activeDetailMachine.serialNumber}</div>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Plant Bay</div>
                  <div className="font-black text-black">{activeDetailMachine.location}</div>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Indexed Manuals</div>
                  <div className="font-black text-black">{activeDetailMachine.manualCount} documents</div>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black bg-[#FAF8F2]">
                  <div className="text-[10px] text-black/60 uppercase">Resolved Cases</div>
                  <div className="font-black text-black">{activeDetailMachine.caseCount} sessions</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl border-2 border-black bg-[#FED000]/25 text-xs font-bold">
                <div className="text-[10px] uppercase font-black text-black/70 mb-1">
                  Last Recorded Fault
                </div>
                <div className="font-black text-sm text-black">
                  {activeDetailMachine.lastFault || 'None (Normal State)'}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedMachine(activeDetailMachine);
                    setActiveDetailMachine(null);
                    runTroubleshootQuery(`Diagnose ${activeDetailMachine.name}`, activeDetailMachine);
                  }}
                  className="neo-btn flex-1 bg-black text-[#FED000] py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Start Troubleshooting</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
