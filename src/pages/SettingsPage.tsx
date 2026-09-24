import React from 'react';
import {
  Settings,
  Globe,
  Shield,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../data/mockData';
import { PlanType, LanguageCode } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    currentPlan,
    setCurrentPlan,
    selectedLanguage,
    setSelectedLanguage,
    responseLanguage,
    setResponseLanguage,
    showToast,
  } = useApp();

  const handleResetData = () => {
    localStorage.removeItem('sarva_history');
    showToast('Local demonstration storage reset to default factory state', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#FED000] border-2 border-black flex items-center justify-center">
              <Settings className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
                SYSTEM CONFIGURATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black">
                Settings & Demo Preferences
              </h1>
            </div>
          </div>
          <p className="text-sm font-bold text-black/80">
            Customize plant interface languages, demo tiers, and strict safety thresholds.
          </p>
        </div>

        {/* Demo Mode Tier Switcher Card */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 shadow-[6px_7px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2.5 border-black pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#FED000] border-1.5 border-black flex items-center justify-center overflow-hidden">
                <img
                  src="/3710-bobuilder.png"
                  alt="Bob the Builder"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-black text-lg text-black">Demo Mode Plan Selector</h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-black/80">
            Instantly switch simulated tier to evaluate gated features (OCR, HMI Vision, Voice, Multilingual reports).
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(['free', 'plus', 'pro'] as PlanType[]).map((plan) => (
              <button
                key={plan}
                onClick={() => {
                  setCurrentPlan(plan);
                  showToast(`Demo Plan switched to: ${plan.toUpperCase()}`, 'success');
                }}
                className={`p-3 rounded-2xl border-3 border-black text-center font-black text-xs sm:text-sm transition-all ${
                  currentPlan === plan
                    ? 'bg-black text-[#FED000] shadow-[2px_2px_0px_#FED000]'
                    : 'bg-[#FAF8F2] text-black hover:bg-[#FED000]'
                }`}
              >
                <div className="text-base uppercase">{plan}</div>
                <div className="text-[10px] opacity-75 font-mono mt-0.5">
                  {plan === 'free' ? 'Basic (20q)' : plan === 'plus' ? 'OCR+Voice' : 'Full Suite'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Multilingual Localization Preferences */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 shadow-[6px_7px_0px_#000] space-y-4">
          <div className="flex items-center gap-2 border-b-2.5 border-black pb-3">
            <Globe className="w-5 h-5 text-black" />
            <h3 className="font-black text-lg text-black">Languages & Localization</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-black/70">
                Application UI Language:
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                className="w-full rounded-xl border-2 border-black bg-[#FAF8F2] p-2.5 font-bold text-xs text-black outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-black text-black/70">
                Diagnostic Response Language:
              </label>
              <select
                value={responseLanguage}
                onChange={(e) => setResponseLanguage(e.target.value as LanguageCode)}
                className="w-full rounded-xl border-2 border-black bg-[#FAF8F2] p-2.5 font-bold text-xs text-black outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Safety & Grounding Strictness */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 shadow-[6px_7px_0px_#000] space-y-4">
          <div className="flex items-center gap-2 border-b-2.5 border-black pb-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-lg text-black">Safety & Refusal Policies</h3>
          </div>

          <div className="space-y-2 text-xs font-bold text-black/85">
            <div className="p-3 rounded-2xl border-2 border-black bg-emerald-50 flex items-center justify-between">
              <div>
                <div className="font-black text-emerald-950">Hallucination Refusal Policy</div>
                <div className="text-[11px] text-emerald-800">
                  Strictly decline when manual pages lack verified acoustic or circuit schematics.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-400 border border-black text-[10px] font-black uppercase">
                ENFORCED
              </span>
            </div>

            <div className="p-3 rounded-2xl border-2 border-black bg-amber-50 flex items-center justify-between">
              <div>
                <div className="font-black text-amber-950">Mandatory LOTO Safety Flagging</div>
                <div className="text-[11px] text-amber-800">
                  Highlight Lock-Out / Tag-Out steps in high-contrast neon containers before hazardous disassembly.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-400 border border-black text-[10px] font-black uppercase">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Reset / Storage Maintenance */}
        <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 shadow-[6px_7px_0px_#000] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-sm text-black">Reset Demonstration State</h4>
            <p className="text-xs font-bold text-black/60">
              Clear simulated cases and restore default factory mock data.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
