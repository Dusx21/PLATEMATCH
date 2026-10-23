import React, { useState } from 'react';
import { InventoryItem } from './InventoryItem';
import { Package, PlusCircle, RotateCcw, AlertTriangle, TrendingDown, Leaf } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';

export function InventoryList({
  dishes = [],
  onUpdateStock,
  onResetStock,
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...new Set(dishes.map((d) => d.category))];

  const filteredDishes = dishes.filter((d) => {
    if (selectedCategory !== 'Todos' && d.category !== selectedCategory) return false;
    return true;
  });

  // Calculate waste reduction indicators
  const totalStock = dishes.reduce((acc, d) => acc + (d.stock_available || 0), 0);
  const soldOutCount = dishes.filter((d) => d.stock_available <= 0).length;

  return (
    <div className="space-y-5">
      {/* FoodTech Waste Prevention Summary Banner */}
      <div className="p-5 rounded-2xl bg-aubergine text-cream shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-mint text-white flex items-center justify-center shrink-0 shadow-sm">
            <Leaf size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-outfit font-black text-lg text-white">
                Control de Inventario y Reducción de Mermas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream/15 text-cream">
                ExpoAndina FoodTech
              </span>
            </div>
            <p className="text-xs text-cream/70 font-sans mt-0.5 max-w-xl">
              Cada plato reservado con anticipación asegura una porción vendida y evita comida preparada desechada al final de la jornada de almuerzo.
            </p>
          </div>
        </div>

        {/* Quick batch refill button */}
        {onResetStock && (
          <Button
            variant="mint"
            size="sm"
            onClick={onResetStock}
            icon={<RotateCcw size={14} />}
            className="shrink-0 text-xs h-10"
          >
            Restablecer Stock Demo
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-aubergine/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Porciones en Vitrina
          </span>
          <span className="font-outfit font-black text-2xl text-aubergine mt-1 block">
            {totalStock}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Listas para reservar</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Platos en Carta
          </span>
          <span className="font-outfit font-black text-2xl text-aubergine mt-1 block">
            {dishes.length}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Variedades criollas</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Platos Agotados
          </span>
          <span className={`font-outfit font-black text-2xl mt-1 block ${soldOutCount > 0 ? 'text-chili' : 'text-mint'}`}>
            {soldOutCount}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Stock en 0</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Merma Evitada Estimada
          </span>
          <span className="font-outfit font-black text-2xl text-mint mt-1 block">
            ~85%
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Pre-reservas con adelanto</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-outfit font-bold transition-all shrink-0 ${
                active
                  ? 'bg-aubergine text-cream shadow-xs'
                  : 'bg-cream-100 hover:bg-cream-200 text-aubergine/70'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => (
          <InventoryItem
            key={dish.id}
            dish={dish}
            onUpdateStock={onUpdateStock}
          />
        ))}
      </div>
    </div>
  );
}
