import React from 'react';

export function MetricCard({
  title,
  value,
  subtext,
  icon,
  badgeText = null,
  variant = 'default',
}) {
  const variants = {
    default: 'bg-white border-aubergine/10 text-aubergine',
    chili: 'bg-chili-surface border-chili/30 text-aubergine',
    mint: 'bg-mint-surface border-mint/30 text-aubergine',
    mango: 'bg-mango-surface border-mango/30 text-aubergine',
    aubergine: 'bg-aubergine text-cream border-transparent',
  };

  const iconColors = {
    default: 'bg-cream text-aubergine',
    chili: 'bg-chili text-white',
    mint: 'bg-mint text-white',
    mango: 'bg-mango text-aubergine',
    aubergine: 'bg-cream/15 text-cream',
  };

  return (
    <div
      className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-card flex flex-col justify-between ${
        variants[variant] || variants.default
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-outfit font-bold uppercase tracking-wider ${
            variant === 'aubergine' ? 'text-cream/70' : 'text-aubergine/60'
          }`}
        >
          {title}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-outfit font-black text-3xl tracking-tight">
            {value}
          </span>
          {badgeText && (
            <span
              className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                variant === 'aubergine' ? 'bg-cream/20 text-cream' : 'bg-aubergine/10 text-aubergine'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {subtext && (
          <p
            className={`text-xs font-sans mt-1.5 ${
              variant === 'aubergine' ? 'text-cream/60' : 'text-aubergine/60'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
