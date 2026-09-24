import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { VerificationState } from '../../types';

interface ConfidenceBadgeProps {
  verificationState: VerificationState;
  confidence?: number;
  evidenceCoverage?: 'High' | 'Medium' | 'Low';
  machineMatch?: 'Exact' | 'Partial' | 'Ambiguous' | 'None';
  claimsSupported?: string;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  verificationState,
  confidence = 92,
  evidenceCoverage = 'High',
  machineMatch = 'Exact',
  claimsSupported,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (verificationState) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-400',
          text: 'text-black',
          label: 'Sarva-Sense Verified',
          icon: <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />,
          desc: '100% grounded in verified OEM technical manual evidence.',
        };
      case 'PARTIALLY_VERIFIED':
        return {
          bg: 'bg-amber-300',
          text: 'text-black',
          label: 'Partially Verified',
          icon: <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />,
          desc: 'Cross-manual ambiguity or supplemental confirmation needed.',
        };
      case 'INSUFFICIENT_INFORMATION':
        return {
          bg: 'bg-rose-400',
          text: 'text-black',
          label: 'Insufficient Evidence',
          icon: <XCircle className="w-4 h-4 text-black stroke-[2.5]" />,
          desc: 'Manuals do not contain verifiable schematics for this symptom.',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Primary Verification Pill */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2.5 border-black font-black text-xs shadow-[2.5px_2.5px_0px_#000] ${style.bg} ${style.text}`}
      >
        {style.icon}
        <span>{style.label}</span>
      </div>

      {/* Confidence Numeric Chip */}
      {verificationState !== 'INSUFFICIENT_INFORMATION' && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-black bg-[#FFFDF8] font-black text-xs shadow-[2px_2px_0px_#000]">
          <span className="text-black/60 text-[10px] uppercase">CONFIDENCE:</span>
          <span className="text-black">{confidence}%</span>
        </div>
      )}

      {/* Coverage Chip */}
      {evidenceCoverage && verificationState !== 'INSUFFICIENT_INFORMATION' && (
        <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-black bg-[#FED000] font-black text-xs shadow-[2px_2px_0px_#000]">
          <span className="text-black/70 text-[10px] uppercase">EVIDENCE:</span>
          <span className="text-black">{evidenceCoverage}</span>
        </div>
      )}

      {/* Match Chip */}
      {machineMatch && (
        <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-black bg-[#FFFDF8] font-black text-xs shadow-[2px_2px_0px_#000]">
          <span className="text-black/70 text-[10px] uppercase">MODEL:</span>
          <span className="text-black">{machineMatch}</span>
        </div>
      )}

      {/* Claims Supported */}
      {claimsSupported && (
        <div className="hidden lg:inline-flex items-center gap-1 text-[11px] font-extrabold text-black/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{claimsSupported}</span>
        </div>
      )}
    </div>
  );
};
