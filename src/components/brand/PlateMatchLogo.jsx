import React from 'react';

/**
 * Reusable platematch Brand v2 Logo & Isotype
 * Two overlapping plates/circles rotated 45 degrees
 */
export function PlateMatchLogo({
  size = 'md',
  withText = true,
  textColor = 'text-aubergine',
  badgeText = null,
  className = '',
}) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 36, text: 'text-2xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 46, text: 'text-3xl', badge: 'text-xs px-2.5 py-0.5' },
    xl: { icon: 60, text: 'text-4xl', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Isotype SVG: Two overlapping plates rotated 45 degrees */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
        aria-label="platematch isotipo"
      >
        <g transform="rotate(45 24 24)">
          {/* Base Plate: Aubergine depth with embossed interior ring */}
          <circle
            cx="17"
            cy="24"
            r="14"
            fill="#2A1455"
            className="filter drop-shadow-[0_2px_4px_rgba(42,20,85,0.25)]"
          />
          <circle
            cx="17"
            cy="24"
            r="9.5"
            stroke="#FFF3E4"
            strokeWidth="1.8"
            opacity="0.35"
          />

          {/* Overlapping Plate: Chili vibrant accent with rim */}
          <circle
            cx="31"
            cy="24"
            r="14"
            fill="#FF5A3C"
            className="filter drop-shadow-[0_2px_6px_rgba(255,90,60,0.35)]"
          />
          <circle
            cx="31"
            cy="24"
            r="9.5"
            stroke="#FFF3E4"
            strokeWidth="1.8"
            opacity="0.65"
          />

          {/* Golden Mango intersection nucleus */}
          <circle
            cx="24"
            cy="24"
            r="3.5"
            fill="#FF9F1C"
            className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
          />
        </g>
      </svg>

      {withText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-outfit font-extrabold tracking-tight ${currentSize.text} ${textColor}`}>
            plate<span className="text-chili">match</span>
          </span>
          {badgeText && (
            <span
              className={`font-outfit font-bold uppercase tracking-wider rounded-full bg-aubergine text-cream ${currentSize.badge}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
