import React from 'react';
import { UtensilsCrossed, Store } from 'lucide-react';
import { AnimatedTabs } from '../ui/AnimatedTabs';

export function ModeSelector({ currentMode = 'dish', onChangeMode }) {
  const tabs = [
    {
      id: 'dish',
      label: 'Por Plato (Express)',
      icon: <UtensilsCrossed size={14} className={currentMode === 'dish' ? 'text-chili' : ''} />,
    },
    {
      id: 'restaurant',
      label: 'Por Restaurante',
      icon: <Store size={14} className={currentMode === 'restaurant' ? 'text-mango' : ''} />,
    },
  ];

  return (
    <div className="px-5 py-2">
      <AnimatedTabs
        tabs={tabs}
        activeTab={currentMode}
        onChange={onChangeMode}
        layoutId="modeSelectorSlidingPill"
        pillColor="bg-aubergine"
        pillTextColor="text-cream"
      />
    </div>
  );
}
