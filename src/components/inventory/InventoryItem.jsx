import React, { useState } from 'react';
import { formatCurrency } from '../../lib/money';
import { Plus, Minus, Flame, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function InventoryItem({
  dish,
  onUpdateStock,
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAdjust = async (delta) => {
    setIsUpdating(true);
    try {
      await onUpdateStock(dish.id, delta, false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const isSoldOut = dish.stock_available <= 0;
  const isLowStock = dish.stock_available > 0 && dish.stock_available <= 2;

  return (
    <div
      className={`p-4 rounded-2xl bg-white border transition-all hover:shadow-card flex flex-col justify-between ${
        isSoldOut
          ? 'border-gray-200 opacity-80'
          : isLowStock
          ? 'border-chili/40 shadow-xs'
          : 'border-aubergine/10 shadow-xs'
      }`}
    >
      <div>
        {/* Dish image & Stock badge */}
        <div className="relative h-40 rounded-xl overflow-hidden bg-cream-300 mb-3">
          <img
            src={dish.image_url}
            alt={dish.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isSoldOut ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-aubergine/60 via-transparent to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5">
            <span className="font-outfit text-[11px] font-bold uppercase tracking-wider text-cream bg-aubergine/80 backdrop-blur-sm px-2.5 py-0.5 rounded-lg">
              {dish.category}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5">
            {isSoldOut ? (
              <Badge variant="chili" size="xs">
                Agotado
              </Badge>
            ) : isLowStock ? (
              <Badge variant="chili" size="xs" icon={<Flame size={11} />}>
                ¡Pocas porciones!
              </Badge>
            ) : (
              <Badge variant="mint" size="xs">
                Disponible
              </Badge>
            )}
          </div>

          <div className="absolute bottom-2.5 left-2.5 text-white">
            <span className="font-outfit font-extrabold text-base text-cream">
              {formatCurrency(dish.price)}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-outfit font-extrabold text-base text-aubergine leading-snug line-clamp-1">
          {dish.title}
        </h3>
        <p className="text-xs font-sans text-aubergine/60 mt-1 line-clamp-2 leading-relaxed">
          {dish.description}
        </p>
      </div>

      {/* Stock Controls Counter */}
      <div className="mt-4 pt-3 border-t border-aubergine/8 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-sans uppercase font-bold text-aubergine/50 tracking-wider block">
            Porciones en Vitrina
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-outfit font-black text-2xl ${isSoldOut ? 'text-gray-400' : 'text-aubergine'}`}>
              {dish.stock_available}
            </span>
            <span className="text-xs font-sans text-aubergine/60 font-semibold">
              platos
            </span>
          </div>
        </div>

        {/* + and - Stepper Buttons */}
        <div className="flex items-center gap-1.5 bg-cream-200 p-1 rounded-xl border border-aubergine/10">
          <button
            type="button"
            disabled={isUpdating || dish.stock_available <= 0}
            onClick={() => handleAdjust(-1)}
            className="w-8 h-8 rounded-lg bg-white text-aubergine hover:text-chili hover:bg-cream-100 flex items-center justify-center font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
            aria-label="Disminuir porción"
          >
            <Minus size={15} />
          </button>

          <span className="w-7 text-center font-outfit font-bold text-sm text-aubergine">
            {dish.stock_available}
          </span>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleAdjust(1)}
            className="w-8 h-8 rounded-lg bg-aubergine text-cream hover:bg-aubergine-900 flex items-center justify-center font-bold text-base transition-all disabled:opacity-40 shadow-xs active:scale-95"
            aria-label="Aumentar porción"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
