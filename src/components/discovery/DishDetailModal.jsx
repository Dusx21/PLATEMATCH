import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk } from '../../lib/geo';
import { Badge } from '../ui/Badge';
import { Clock, MapPin, Flame, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export function DishDetailModal({
  isOpen,
  onClose,
  dish,
  onSelectMatch,
}) {
  if (!dish) return null;

  const distanceInfo = formatDistanceAndWalk(dish.distanceMeters);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dish.title}
      subtitle={dish.restaurant_name}
    >
      <div className="space-y-4">
        {/* Dish Image */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-cream-400">
          <img
            src={dish.image_url}
            alt={dish.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="white" size="sm" icon={<MapPin size={12} className="text-chili" />}>
              {distanceInfo.fullText}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="mango" size="sm" icon={<Flame size={12} />}>
              {dish.stock_available} porciones disponibles
            </Badge>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/60 mb-1">
            Descripción y Preparación
          </h4>
          <p className="text-sm font-sans text-aubergine/80 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Nutritional & Prep Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-aubergine/10 text-center">
          <div className="p-2 bg-cream-100 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-aubergine/50 block">Tiempo</span>
            <span className="font-outfit font-extrabold text-sm text-aubergine">
              ~{dish.preparation_time_mins || 7} min
            </span>
          </div>

          <div className="p-2 bg-cream-100 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-aubergine/50 block">Calorías</span>
            <span className="font-outfit font-extrabold text-sm text-aubergine">
              {dish.calories || '580 kcal'}
            </span>
          </div>

          <div className="p-2 bg-cream-100 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-aubergine/50 block">Precio</span>
            <span className="font-outfit font-extrabold text-sm text-chili">
              {formatCurrency(dish.price)}
            </span>
          </div>
        </div>

        {/* Allergens warning */}
        {dish.allergens && dish.allergens.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-mango-surface border border-mango/20 text-xs">
            <ShieldAlert size={16} className="text-mango-dark shrink-0 mt-0.5" />
            <p className="text-mango-dark font-sans leading-snug">
              <strong className="font-semibold">Información de Alérgenos:</strong> Contiene{' '}
              {dish.allergens.join(', ')}.
            </p>
          </div>
        )}

        {/* Restaurant location note */}
        <div className="p-3 bg-white rounded-xl border border-aubergine/10 text-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-aubergine">{dish.restaurant_name}</p>
            <p className="text-aubergine/60">{dish.restaurant_address}</p>
          </div>
          <span className="text-chili font-semibold shrink-0">
            {distanceInfo.distanceText}
          </span>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onSelectMatch(dish);
            }}
            icon={<Heart size={18} className="fill-white" />}
            className="w-full h-12 text-base"
          >
            Hacer Match con este plato
          </Button>
        </div>
      </div>
    </Modal>
  );
}
