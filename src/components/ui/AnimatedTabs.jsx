import React from 'react';
import { motion } from 'framer-motion';
import { transitions } from '../../lib/animations';

/**
 * Hover.dev inspired sliding pill tab bar
 * Uses layoutId to smoothly slide the active indicator across items
 */
export function AnimatedTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  pillColor = 'bg-aubergine',
  pillTextColor = 'text-cream',
  inactiveTextColor = 'text-aubergine/70 hover:text-aubergine',
  layoutId = 'animatedTabPill',
  size = 'md',
}) {
  const sizeStyles = {
    sm: 'text-xs py-1 px-2.5 rounded-lg',
    md: 'text-xs font-bold py-2 px-3.5 rounded-xl',
    lg: 'text-sm font-bold py-2.5 px-4 rounded-xl',
  };

  return (
    <div className={`flex items-center gap-1 p-1 bg-aubergine/8 rounded-2xl relative select-none ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id;
        const label = typeof tab === 'string' ? tab : tab.label;
        const icon = typeof tab === 'object' ? tab.icon : null;
        const badge = typeof tab === 'object' ? tab.badge : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative flex items-center justify-center gap-1.5 font-outfit transition-colors duration-200 z-10 flex-1 ${
              sizeStyles[size] || sizeStyles.md
            } ${isActive ? pillTextColor : inactiveTextColor}`}
          >
            {/* Sliding Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={transitions.snappy}
                className={`absolute inset-0 rounded-xl shadow-xs -z-10 ${pillColor}`}
              />
            )}

            {icon && <span className="shrink-0">{icon}</span>}
            <span className="truncate">{label}</span>

            {badge !== null && badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                  isActive ? 'bg-cream/20 text-cream' : 'bg-aubergine/10 text-aubergine'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
