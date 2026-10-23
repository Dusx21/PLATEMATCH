import React from 'react';

export function Badge({
  children,
  variant = 'mango',
  size = 'md',
  icon = null,
  className = '',
}) {
  const variants = {
    mango: 'bg-mango-surface text-mango-dark border-mango/30',
    mint: 'bg-mint-surface text-mint-dark border-mint/30',
    chili: 'bg-chili-surface text-chili border-chili/30',
    aubergine: 'bg-aubergine-50 text-aubergine border-aubergine/20',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    white: 'bg-white/90 backdrop-blur-sm text-aubergine border-aubergine/10 shadow-sm',
    dark: 'bg-aubergine text-cream border-transparent',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 rounded-lg gap-1',
    sm: 'text-xs px-2.5 py-1 rounded-xl gap-1.5',
    md: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-2 rounded-2xl gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border font-sans font-medium tracking-wide select-none ${variants[variant] || variants.mango} ${sizes[size] || sizes.md} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
