import React from 'react';
import { Utensils, RotateCcw, SlidersHorizontal, MapPin } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = '¡Te quedaste sin opciones en este radio!',
  description = 'Has explorado todos los platos disponibles a menos de 500 m. Puedes restablecer las tarjetas o ampliar tus preferencias.',
  onReset,
  onOpenFilters,
  onExpandRadius,
  type = 'cards_exhausted', // 'cards_exhausted' | 'no_filter_results'
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/70 backdrop-blur-sm rounded-card border border-aubergine/10 shadow-card my-auto max-w-sm mx-auto">
      <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center text-chili mb-5 shadow-inner">
        <Utensils size={36} className="animate-pulse" />
      </div>

      <h3 className="text-xl font-outfit font-extrabold text-aubergine mb-2 leading-tight">
        {title}
      </h3>

      <p className="text-sm text-aubergine/70 mb-6 font-sans leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col w-full gap-2.5">
        {onReset && (
          <Button
            variant="primary"
            onClick={onReset}
            icon={<RotateCcw size={16} />}
            className="w-full"
          >
            Volver a barajar platos
          </Button>
        )}

        {onExpandRadius && (
          <Button
            variant="subtle"
            onClick={onExpandRadius}
            icon={<MapPin size={16} />}
            className="w-full"
          >
            Buscar hasta 500 m
          </Button>
        )}

        {onOpenFilters && (
          <Button
            variant="ghost"
            onClick={onOpenFilters}
            icon={<SlidersHorizontal size={16} />}
            className="w-full text-xs"
          >
            Ajustar filtros de precio y categoría
          </Button>
        )}
      </div>
    </div>
  );
}
