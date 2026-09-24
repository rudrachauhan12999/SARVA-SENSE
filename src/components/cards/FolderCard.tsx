import React from 'react';

interface FolderCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  tabColor?: string;
  iconBgColor?: string;
  icon: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  secondaryBadge?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  id,
  title,
  subtitle,
  tabColor = '#4ADE80',
  iconBgColor,
  icon,
  badgeText,
  badgeColor = '#FFFFFF',
  secondaryBadge,
  onClick,
  className = '',
  isActive = false,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative cursor-pointer pt-5 transition-transform duration-150 ${className}`}
    >
      {/* Neo-brutalist Protruding Folder Tab (Reference Image Signature) */}
      <div
        className="absolute top-0 left-4 h-6 px-3 rounded-t-lg border-t-3 border-x-3 border-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center transition-transform group-hover:-translate-y-0.5 z-20"
        style={{ backgroundColor: tabColor }}
      >
        <span className="text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
          {subtitle || 'FOLDER'}
        </span>
      </div>

      {/* Main Card Surface */}
      <div
        className={`relative z-10 bg-[#FFFDF8] rounded-2xl border-3 border-black p-4 transition-all duration-120 flex flex-col justify-between min-h-[140px] ${
          isActive
            ? 'translate-x-1 translate-y-1 shadow-[2px_2px_0px_#000000] ring-3 ring-black'
            : 'shadow-[5px_6px_0px_#000000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[7px_8px_0px_#000000] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-[2px_2px_0px_#000000]'
        }`}
      >
        {/* Top Row: Icon Container & Badges */}
        <div className="flex items-start justify-between gap-2">
          {/* Icon Box */}
          <div
            className="w-11 h-11 rounded-xl border-2.5 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: iconBgColor || tabColor }}
          >
            <div className="text-black stroke-[2.5]">{icon}</div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            {badgeText && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md border-2 border-black text-xs font-black tracking-tight shadow-[1.5px_1.5px_0px_#000]"
                style={{ backgroundColor: badgeColor }}
              >
                {badgeText}
              </span>
            )}
            {secondaryBadge && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded border border-black bg-[#FF5C8A] text-white text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                {secondaryBadge}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Title */}
        <div className="mt-3">
          <h3 className="font-extrabold text-base sm:text-lg text-black tracking-tight leading-tight line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};
