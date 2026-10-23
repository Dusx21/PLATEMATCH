import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk } from '../../lib/geo';
import { Badge } from '../ui/Badge';
import { MapPin, Star, Clock, Utensils, Heart, ArrowRight } from 'lucide-react';

export function RestaurantDetailModal({
  isOpen,
  onClose,
  restaurant,
  onSelectDish,
}) {
  if (!restaurant) return null;

  const distanceInfo = formatDistanceAndWalk(restaurant.distanceMeters);
  const defaultFallback = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={restaurant.name}
      subtitle={restaurant.tagline || restaurant.address}
    >
      <div className="space-y-4">
        {/* Restaurant Image Banner */}
        <div className="relative h-44 rounded-2xl overflow-hidden bg-cream-400">
          <img
            src={restaurant.image_url || defaultFallback}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-aubergine/70 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3">
            <Badge variant="white" size="sm" icon={<MapPin size={12} className="text-chili" />}>
              {distanceInfo.fullText}
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <Badge variant="mango" size="sm" icon={<Star size={12} className="fill-mango text-mango" />}>
              {restaurant.rating} ({restaurant.review_count} reseñas)
            </Badge>
          </div>

          <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white">
            <p className="font-outfit font-bold text-sm text-cream truncate">
              {restaurant.specialty ? `Especialidad: ${restaurant.specialty}` : restaurant.name}
            </p>
          </div>
        </div>

        {/* Operational Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-cream-100 rounded-xl border border-aubergine/5">
            <span className="text-[10px] uppercase font-bold text-aubergine/50 flex items-center gap-1 mb-0.5">
              <Clock size={11} className="text-chili" />
              Horario de atención
            </span>
            <span className="font-outfit font-bold text-aubergine">
              {restaurant.opening_hours || '11:30 AM - 4:00 PM'}
            </span>
          </div>

          <div className="p-2.5 bg-cream-100 rounded-xl border border-aubergine/5">
            <span className="text-[10px] uppercase font-bold text-aubergine/50 block mb-0.5">
              Rango de precios
            </span>
            <span className="font-outfit font-bold text-aubergine">
              {restaurant.price_level || 'S/ 12 - 18'}
            </span>
          </div>
        </div>

        {/* Categories / Tags */}
        {restaurant.categories && restaurant.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {restaurant.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-lg bg-cream-300 text-aubergine"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Address */}
        {restaurant.address && (
          <div className="p-3 bg-white rounded-xl border border-aubergine/10 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-chili shrink-0" />
              <p className="font-sans text-aubergine/80 font-medium">{restaurant.address}</p>
            </div>
            <span className="text-chili font-bold shrink-0 ml-2">
              {distanceInfo.distanceText}
            </span>
          </div>
        )}

        {/* Available Dishes Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 flex items-center gap-1.5">
              <Utensils size={13} className="text-chili" />
              Platos disponibles ({restaurant.totalAvailablePortions || (restaurant.dishes || []).length} porciones)
            </h4>
            <span className="text-[11px] font-semibold text-mint">
              {(restaurant.dishes || []).length} opciones
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(restaurant.dishes || []).length === 0 ? (
              <p className="text-xs text-aubergine/50 italic py-2">
                No hay platos registrados en este momento.
              </p>
            ) : (
              (restaurant.dishes || []).map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectDish(dish);
                  }}
                  className="w-full p-2.5 rounded-xl border border-aubergine/10 hover:border-chili/50 bg-cream-50 hover:bg-cream-100 text-left flex items-center justify-between transition-all group"
                  aria-label={`Seleccionar ${dish.title} por ${formatCurrency(dish.price)}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={dish.image_url}
                      alt={dish.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-outfit font-bold text-xs text-aubergine truncate group-hover:text-chili transition-colors">
                        {dish.title}
                      </p>
                      <p className="text-[10px] text-aubergine/60 font-sans line-clamp-1 mt-0.5">
                        {dish.description}
                      </p>
                      <span className="text-[10px] text-mint font-semibold font-sans block mt-0.5">
                        Quedan {dish.stock_available} porciones
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="font-outfit font-extrabold text-sm text-aubergine">
                      {formatCurrency(dish.price)}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-chili/10 group-hover:bg-chili group-hover:text-white text-chili flex items-center justify-center transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        {restaurant.dishes && restaurant.dishes.length > 0 && (
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onSelectDish(restaurant.dishes[0]);
              }}
              icon={<Heart size={18} className="fill-white" />}
              className="w-full h-12 text-base"
            >
              Hacer Match con {restaurant.name}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
