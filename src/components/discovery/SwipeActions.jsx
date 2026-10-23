import React from 'react';
import { X, Heart, Info, RotateCcw } from 'lucide-react';

export function SwipeActions({
  onPass,
  onMatch,
  onInfo,
  onUndo,
  disabled = false,
  canUndo = false,
}) {
  return (
    <div className="px-6 py-3 flex items-center justify-center gap-5 z-20">
      {/* Undo / Rewind button */}
      <button
        type="button"
        disabled={disabled || !canUndo}
        onClick={onUndo}
        className="w-11 h-11 rounded-full bg-white border border-aubergine/15 text-aubergine/60 hover:text-aubergine hover:border-aubergine/30 shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Deshacer último descarte"
      >
        <RotateCcw size={18} />
      </button>

      {/* Discard / Pass button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onPass}
        className="w-14 h-14 rounded-full bg-white border-2 border-chili text-chili hover:bg-chili hover:text-white shadow-card flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
        aria-label="Descartar plato o restaurante"
      >
        <X size={26} strokeWidth={2.5} />
      </button>

      {/* Info button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onInfo}
        className="w-11 h-11 rounded-full bg-white border border-aubergine/15 text-aubergine hover:bg-cream-100 shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
        aria-label="Ver detalles de información"
      >
        <Info size={19} />
      </button>

      {/* Match button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onMatch}
        className="w-16 h-16 rounded-full bg-chili text-white shadow-float hover:bg-chili-dark flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 relative group"
        aria-label="Hacer match con este plato"
      >
        <Heart size={30} className="fill-white group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
