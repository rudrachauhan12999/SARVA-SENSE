import React from 'react';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';

interface FeatureGateProps {
  feature: 'ocr' | 'screenshot' | 'voice' | 'advanced_reports' | 'unlimited_queries';
  featureName: string;
  requiredPlan?: PlanType;
  description?: string;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  featureName,
  requiredPlan = 'plus',
  description = 'Unlock advanced intelligence with Sarva-Sense Plus or Pro tiers.',
  children,
}) => {
  const { currentPlan, setCurrentPlan, showToast, setCurrentRoute } = useApp();

  const isUnlocked = () => {
    if (currentPlan === 'pro') return true;
    if (currentPlan === 'plus' && requiredPlan !== 'pro') return true;
    return false;
  };

  if (isUnlocked()) {
    return <>{children}</>;
  }

  const handleUpgradeDemo = () => {
    setCurrentPlan(requiredPlan);
    showToast(`Upgraded Demo to ${requiredPlan.toUpperCase()} Plan! Feature unlocked.`, 'success');
  };

  return (
    <div className="relative rounded-3xl border-3.5 border-black bg-[#FFFDF8] p-6 sm:p-8 shadow-[6px_8px_0px_#000] text-center overflow-hidden">
      {/* Neo-brutalist lock badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#FED000] border-3 border-black mx-auto mb-4 flex items-center justify-center shadow-[3px_3px_0px_#000]">
        <Lock className="w-8 h-8 text-black stroke-[2.5]" />
      </div>

      <span className="inline-block px-3 py-1 rounded-lg bg-black text-[#FED000] text-xs font-black uppercase tracking-wider mb-2">
        Available on {requiredPlan.toUpperCase()}
      </span>

      <h3 className="text-2xl font-black text-black tracking-tight mb-2">
        {featureName} is Gated
      </h3>

      <p className="max-w-md mx-auto text-sm font-bold text-black/70 mb-6 leading-relaxed">
        {description} Your current demo plan is{' '}
        <span className="uppercase font-black text-black underline">{currentPlan}</span>.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleUpgradeDemo}
          className="neo-btn bg-[#FF5C8A] text-white px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#FED000]" />
          <span>Switch to {requiredPlan.toUpperCase()} (1-Click Demo)</span>
        </button>

        <button
          onClick={() => setCurrentRoute('plans')}
          className="neo-btn bg-[#FED000] text-black px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5"
        >
          <span>Compare All Plans</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-black/10 text-[11px] font-bold text-black/50">
        Demo Notice: Frontend feature gating simulation. Instant switching allowed for jury testing.
      </div>
    </div>
  );
};
