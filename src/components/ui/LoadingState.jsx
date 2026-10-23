import React from 'react';
import { PlateMatchLogo } from '../brand/PlateMatchLogo';

export function LoadingState({ message = 'Buscando comida caliente a tu alrededor...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-auto text-center w-full max-w-sm mx-auto">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-cream-400/50 animate-ping absolute inset-0" />
        <div className="relative z-10 p-4 bg-white rounded-full shadow-card flex items-center justify-center">
          <PlateMatchLogo size="lg" withText={false} />
        </div>
      </div>

      <h4 className="text-lg font-outfit font-bold text-aubergine mb-2">
        {message}
      </h4>

      <p className="text-xs text-aubergine/60 font-sans max-w-xs">
        Calculando porciones disponibles y tiempo a pie en Cusco...
      </p>

      {/* Skeleton card preview */}
      <div className="w-full mt-6 bg-white/60 rounded-card p-4 space-y-3 animate-pulse border border-aubergine/5">
        <div className="h-44 bg-aubergine/10 rounded-2xl w-full" />
        <div className="h-5 bg-aubergine/15 rounded-md w-3/4" />
        <div className="h-4 bg-aubergine/10 rounded-md w-1/2" />
      </div>
    </div>
  );
}
