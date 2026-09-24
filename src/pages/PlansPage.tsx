import React from 'react';
import { Check, Sparkles, Zap, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';

export const PlansPage: React.FC = () => {
  const { currentPlan, setCurrentPlan, showToast } = useApp();

  const handleSelectPlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    showToast(`Active Demo Plan updated to: ${plan.toUpperCase()}`, 'success');
  };

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'FREE',
      price: '$0',
      period: 'forever',
      description: 'Suitable for basic equipment troubleshooting and initial testing.',
      tabColor: '#9CA3AF',
      accentColor: '#FAF8F2',
      features: [
        '12 / 20 monthly troubleshooting queries',
        'Basic manual PDF text upload',
        'Text-based fault code lookup',
        'Basic source page citations',
        'Single machine profile',
        'English language responses',
      ],
      gated: [
        'OCR Scanned Manual Extraction',
        'HMI Optical Screenshot Vision',
        'Voice Troubleshooting',
        'Multilingual Reports Export',
      ],
    },
    {
      id: 'plus' as PlanType,
      name: 'PLUS',
      price: '$49',
      period: 'per month',
      popular: true,
      description: 'Ideal for plant technicians needing OCR manual ingestion and voice input.',
      tabColor: '#38BDF8',
      accentColor: '#FED000',
      features: [
        '250 monthly troubleshooting queries',
        'Neural OCR for scanned paper manuals',
        'HMI screenshot alarm analysis',
        'Voice-to-text shopfloor dictation',
        '15-Language multilingual translations',
        'Multilingual PDF & print reports',
        'Up to 5 connected machines',
      ],
      gated: ['Priority Vector Processing & Multi-Plant Fleet Sync'],
    },
    {
      id: 'pro' as PlanType,
      name: 'PRO',
      price: '$149',
      period: 'per month',
      description: 'Full industrial suite with multi-machine fleet sync, full source tracing, and live HMI vision.',
      tabColor: '#4ADE80',
      accentColor: '#4ADE80',
      features: [
        'Unlimited technical queries',
        'Advanced HMI vision with bounding telemetry',
        'High-density table and circuit OCR',
        'Real-time voice query engine',
        'Full source tracing & confidence metrics',
        'Unlimited equipment fleet library',
        'Custom OEM prompt tuning',
        'Direct ISO-13849 compliance reports',
      ],
      gated: [],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-8 shadow-[5px_6px_0px_#000] text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FED000] border-2 border-black text-xs font-black uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Industrial Maintenance Tiers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
            Flexible Plans for Any Shopfloor
          </h1>
          <p className="text-sm sm:text-base font-bold text-black/75 max-w-lg mx-auto mt-2">
            Switch plans anytime. For this hackathon demo, you can toggle tiers instantly with 1-click.
          </p>
        </div>

        {/* Demo Plan Switcher Alert Bar */}
        <div className="bg-black text-[#FED000] rounded-2xl border-3 border-black p-3.5 shadow-[4px_5px_0px_#FFFDF8] flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FED000] border border-black flex items-center justify-center overflow-hidden">
              <img
                src="/3710-bobuilder.png"
                alt="Bob the Builder"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs sm:text-sm font-black text-white">
              ACTIVE DEMO PLAN: <span className="uppercase text-[#FED000] font-black underline">{currentPlan}</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-white/70">
            Click "Activate Plan (Demo)" below to test feature gating
          </span>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 shadow-[7px_8px_0px_#000] flex flex-col justify-between transition-all ${
                  isCurrent ? 'ring-4 ring-black scale-102 bg-[#FFFDF8]' : 'hover:-translate-y-1'
                }`}
              >
                {/* Protruding Tab Label */}
                <div
                  className="absolute -top-5 left-6 px-3.5 h-6 rounded-t-lg border-t-3 border-x-3 border-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center z-20"
                  style={{ backgroundColor: plan.tabColor }}
                >
                  {plan.name} TIER
                </div>

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-2xl font-black text-black">{plan.name}</h3>
                      <p className="text-xs font-bold text-black/60 mt-1 min-h-[32px]">
                        {plan.description}
                      </p>
                    </div>
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded bg-[#FF5C8A] text-white border border-black text-[10px] font-black uppercase">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-4 border-y-2 border-black/15 py-3">
                    <span className="text-4xl font-black text-black">{plan.price}</span>
                    <span className="text-xs font-bold text-black/60">/ {plan.period}</span>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2.5 text-xs font-bold text-black/90">
                    <div className="text-[10px] font-black uppercase text-black/60 tracking-wider">
                      Included Capabilities
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}

                    {/* Gated Features (for Free/Plus) */}
                    {plan.gated.length > 0 && (
                      <div className="pt-2 space-y-2 text-black/40">
                        <div className="text-[10px] font-black uppercase tracking-wider">
                          Locked on this tier
                        </div>
                        {plan.gated.map((g, i) => (
                          <div key={i} className="flex items-start gap-2 line-through">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Action Button */}
                <div className="mt-8 pt-4 border-t-2 border-black/15">
                  <button
                    id={`btn-plan-${plan.id}`}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`neo-btn w-full py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-black text-[#FED000]'
                        : 'bg-[#FED000] hover:bg-[#FACC15] text-black'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Current Active Plan</span>
                      </>
                    ) : (
                      <>
                        <span>Activate {plan.name} (Demo)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
