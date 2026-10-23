import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RotateCcw, Check } from 'lucide-react';

const CATEGORIES = ['Todos', 'Criollo', 'Menú del Día', 'Fusión', 'Regional', 'Saludable'];
const PRICE_PRESETS = [
  { label: 'Cualquier precio', value: null },
  { label: 'Hasta S/ 13', value: 13 },
  { label: 'Hasta S/ 15', value: 15 },
  { label: 'Hasta S/ 18', value: 18 },
];

export function FilterSheet({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  onResetFilters,
}) {
  const [filters, setFilters] = useState(activeFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros de Almuerzo"
      subtitle="Personaliza tu búsqueda en función de tu hambre y presupuesto"
    >
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-2.5">
            Tipo de Comida
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = (filters.category || 'Todos') === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                  className={`px-3.5 py-2 rounded-xl text-xs font-outfit font-bold transition-all ${
                    active
                      ? 'bg-aubergine text-cream shadow-sm'
                      : 'bg-cream-200 text-aubergine/80 hover:bg-cream-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-2.5">
            Presupuesto Máximo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((p) => {
              const active = filters.maxPrice === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, maxPrice: p.value }))}
                  className={`p-2.5 rounded-xl text-xs font-outfit font-bold border transition-all text-left flex items-center justify-between ${
                    active
                      ? 'border-chili bg-chili-surface text-chili'
                      : 'border-aubergine/10 bg-white text-aubergine/80 hover:bg-cream-100'
                  }`}
                >
                  <span>{p.label}</span>
                  {active && <Check size={14} className="text-chili" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting options */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-2.5">
            Ordenar Por
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'proximity', label: 'Más Cercanos Primero' },
              { id: 'price', label: 'Menor Precio Primero' },
            ].map((s) => {
              const active = (filters.sortBy || 'proximity') === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, sortBy: s.id }))}
                  className={`p-2.5 rounded-xl text-xs font-outfit font-bold border transition-all text-left flex items-center justify-between ${
                    active
                      ? 'border-aubergine bg-aubergine text-cream'
                      : 'border-aubergine/10 bg-white text-aubergine/80 hover:bg-cream-100'
                  }`}
                >
                  <span>{s.label}</span>
                  {active && <Check size={14} className="text-cream" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-aubergine/10 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleReset}
            icon={<RotateCcw size={14} />}
            className="flex-1 text-xs"
          >
            Restablecer
          </Button>

          <Button
            variant="primary"
            onClick={handleApply}
            className="flex-1"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Modal>
  );
}
