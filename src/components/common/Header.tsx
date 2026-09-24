import React, { useState } from 'react';
import {
  Activity,
  Wrench,
  BookOpen,
  FileText,
  Clock,
  Settings,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  Layers,
  Camera,
  FileSearch,
  Mic,
  MessageCircle,
} from 'lucide-react';
import { useApp, AppRoute } from '../../context/AppContext';
import { LANGUAGES } from '../../data/mockData';
import { PlanType } from '../../types';

export const Header: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    currentPlan,
    setCurrentPlan,
    selectedLanguage,
    setSelectedLanguage,
    loadDemoScenario,
    showToast,
  } = useApp();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navLinks: { id: AppRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'troubleshoot', label: 'Troubleshoot', icon: <Wrench className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'machines', label: 'Machines', icon: <Activity className="w-4 h-4" /> },
    { id: 'manuals', label: 'Manuals', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  ];

  const handlePlanChange = (plan: PlanType) => {
    setCurrentPlan(plan);
    showToast(`Switched Demo Plan to: ${plan.toUpperCase()}`, 'info');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FED000] border-b-3.5 border-black px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          id="nav-logo"
          onClick={() => setCurrentRoute('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FED000] border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#FFFDF8] group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/3710-bobuilder.png"
              alt="Bob the Builder"
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-black leading-none">
                SARVA-SENSE
              </span>
            </div>
            <p className="text-[10px] font-bold text-black/70 tracking-tight leading-tight hidden sm:block">
              Machine Troubleshooting Assistant
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#FFFDF8] px-2 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000]">
          {navLinks.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setCurrentRoute(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  isActive
                    ? 'bg-black text-[#FED000] shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-black hover:bg-[#FED000]/60 hover:text-black'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Demo Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Jury Demo Scenarios Button */}
          <div className="relative">
            <button
              id="btn-demo-scenarios"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="neo-btn bg-[#FF5C8A] text-white px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black"
            >
              <Sparkles className="w-4 h-4 text-[#FED000]" />
              <span className="hidden sm:inline">Jury Demos</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDemoMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDemoMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFDF8] rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000] z-50 p-2.5 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 border-b-2 border-black/20 mb-2 flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-black">
                      Hackathon Demo Scenarios
                    </span>
                    <span className="text-[10px] font-bold bg-[#FED000] px-1 rounded border border-black">
                      1-Click
                    </span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        loadDemoScenario('demo-1-e101');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-emerald-400 border border-black flex items-center justify-center text-[10px] font-black">
                        1
                      </span>
                      <div>
                        <div className="font-black text-black">Exact E101 (HP-200X)</div>
                        <div className="text-[10px] text-black/70">Sourced OEM hydraulic diagnosis</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-2-overheat');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-amber-400 border border-black flex items-center justify-center text-[10px] font-black">
                        2
                      </span>
                      <div>
                        <div className="font-black text-black">Natural Language Query</div>
                        <div className="text-[10px] text-black/70">"Why is HP-200X overheating?"</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-3-ambiguous');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-purple-400 border border-black flex items-center justify-center text-[10px] font-black">
                        3
                      </span>
                      <div>
                        <div className="font-black text-black">Cross-Manual Ambiguity</div>
                        <div className="text-[10px] text-black/70">E101 collision (Press vs CNC)</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-4-insufficient');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-rose-400 border border-black flex items-center justify-center text-[10px] font-black">
                        4
                      </span>
                      <div>
                        <div className="font-black text-black">Insufficient Info Refusal</div>
                        <div className="text-[10px] text-black/70">Safe no-hallucination refusal</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-5-screenshot');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-sky-400 border border-black flex items-center justify-center text-[10px] font-black">
                        <Camera className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="font-black text-black">HMI Screen Vision</div>
                        <div className="text-[10px] text-black/70">Bounding box telemetry extraction</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-6-ocr');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-lime-400 border border-black flex items-center justify-center text-[10px] font-black">
                        <FileSearch className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="font-black text-black">Scanned Manual OCR</div>
                        <div className="text-[10px] text-black/70">Document structure & alarm parser</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        loadDemoScenario('demo-7-voice');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FED000] border-2 border-transparent hover:border-black font-bold text-xs flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded bg-pink-400 border border-black flex items-center justify-center text-[10px] font-black">
                        <Mic className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="font-black text-black">Voice Troubleshooting</div>
                        <div className="text-[10px] text-black/70">Spoken query transcription</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Demo Plan Switcher Pill */}
          <div className="hidden sm:flex items-center bg-[#FFFDF8] border-2.5 border-black rounded-xl p-0.5 shadow-[2px_2px_0px_#000]">
            <span className="px-2 text-[10px] font-black text-black/60 uppercase tracking-wider">
              PLAN:
            </span>
            {(['free', 'plus', 'pro'] as PlanType[]).map((plan) => (
              <button
                key={plan}
                onClick={() => handlePlanChange(plan)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  currentPlan === plan
                    ? 'bg-black text-[#FED000] shadow-[1px_1px_0px_#000]'
                    : 'text-black hover:bg-black/10'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              id="btn-lang-selector"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="neo-btn bg-[#FFFDF8] text-black p-1.5 sm:px-2 sm:py-1 rounded-xl flex items-center gap-1 text-xs font-black"
              title="Change UI Language"
            >
              <Globe className="w-4 h-4 text-black" />
              <span className="hidden md:inline uppercase text-[11px]">
                {LANGUAGES.find((l) => l.code === selectedLanguage)?.code}
              </span>
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-[#FFFDF8] rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] z-50 p-1.5">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-black/60">
                    UI Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-between ${
                        selectedLanguage === lang.code ? 'bg-[#FED000] font-black border border-black' : 'hover:bg-black/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      <span className="text-[10px] text-black/60 font-mono">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Settings Button */}
          <button
            id="btn-settings-top"
            onClick={() => setCurrentRoute('settings')}
            className="neo-btn bg-[#FFFDF8] text-black p-1.5 sm:p-2 rounded-xl"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            id="btn-help-top"
            onClick={() => setCurrentRoute('help')}
            className="neo-btn bg-[#FFFDF8] text-black p-1.5 sm:p-2 rounded-xl"
            title="Safety & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
