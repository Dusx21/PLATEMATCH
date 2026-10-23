import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Star, MapPin, Utensils, Check, X, ArrowRight, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk } from '../../lib/geo';
import { Badge } from '../ui/Badge';

export function RestaurantCard({
  restaurant,
  onSwipeLeft,
  onSwipeRight,
  onSelectDish,
  onOpenDetail,
  isFront = true,
}) {
  const [imageError, setImageError] = useState(false);
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.6, 1, 1, 1, 0.6]);

  const matchOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipeRight(restaurant);
    } else if (info.offset.x < -threshold) {
      onSwipeLeft(restaurant);
    }
  };

  const distanceInfo = formatDistanceAndWalk(restaurant.distanceMeters);
  const defaultFallback = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        opacity: isFront ? opacity : 1,
        touchAction: 'none',
      }}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 select-none cursor-grab active:cursor-grabbing rounded-card bg-white shadow-card overflow-hidden flex flex-col border border-aubergine/10 ${
        isFront ? 'z-20' : 'z-10 scale-[0.96] translate-y-3 pointer-events-none'
      }`}
    >
      {/* Visual Stamps on Drag */}
      {isFront && (
        <>
          <motion.div
            style={{ opacity: matchOpacity }}
            className="absolute top-6 left-6 z-30 pointer-events-none transform -rotate-12 border-4 border-mint text-mint bg-white/95 px-4 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5"
          >
            <Check size={24} strokeWidth={3} />
            <span className="font-outfit font-extrabold text-2xl tracking-wider">MATCH</span>
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-6 right-6 z-30 pointer-events-none transform rotate-12 border-4 border-chili text-chili bg-white/95 px-4 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5"
          >
            <X size={24} strokeWidth={3} />
            <span className="font-outfit font-extrabold text-2xl tracking-wider">PASAR</span>
          </motion.div>
        </>
      )}

      {/* Restaurant Atmosphere Banner - Compact proportional height */}
      <div className="relative h-36 w-full bg-cream-400 overflow-hidden shrink-0">
        <img
          src={imageError ? defaultFallback : (restaurant.image_url || defaultFallback)}
          alt={restaurant.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aubergine/90 via-aubergine/30 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-10">
          <Badge variant="white" size="sm" icon={<MapPin size={12} className="text-chili" />}>
            {distanceInfo.fullText}
          </Badge>

          <Badge variant="mango" size="sm" icon={<Star size={12} className="fill-mango text-mango" />}>
            {restaurant.rating} ({restaurant.review_count})
          </Badge>
        </div>

        {/* Info button floating on image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(restaurant);
          }}
          className="absolute bottom-2.5 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-aubergine shadow-md hover:bg-white transition-all active:scale-95"
          aria-label={`Ver detalles e información de ${restaurant.name}`}
        >
          <Info size={16} />
        </button>

        <div className="absolute bottom-2.5 left-3.5 right-12 z-10 text-white">
          <h2 className="text-lg font-outfit font-extrabold text-cream leading-tight truncate">
            {restaurant.name}
          </h2>
          <p className="text-[11px] font-sans text-cream/80 truncate">
            {restaurant.tagline || restaurant.address}
          </p>
        </div>
      </div>

      {/* Menu Showcase for Indecisive Users */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-[11px] font-outfit font-bold uppercase tracking-wider text-aubergine/60 flex items-center gap-1">
              <Utensils size={12} className="text-chili" />
              Platos disponibles ahora
            </span>
            <span className="text-xs font-bold text-mint">
              {restaurant.totalAvailablePortions || (restaurant.dishes || []).length} porciones listas
            </span>
          </div>

          {/* Dishes list with well-defined internal scroll to never cut off bottom elements */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 overscroll-contain">
            {(restaurant.dishes || []).map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDish(dish);
                }}
                className="w-full p-2 rounded-xl border border-aubergine/10 hover:border-chili/50 bg-cream-50 hover:bg-cream-100 text-left flex items-center justify-between transition-all group"
                aria-label={`Seleccionar plato ${dish.title} por ${formatCurrency(dish.price)}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={dish.image_url}
                    alt={dish.title}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-outfit font-bold text-xs text-aubergine truncate group-hover:text-chili transition-colors">
                      {dish.title}
                    </p>
                    <span className="text-[10px] text-aubergine/60 font-sans block truncate">
                      Quedan {dish.stock_available} porciones
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="font-outfit font-extrabold text-xs text-aubergine">
                    {formatCurrency(dish.price)}
                  </span>
                  <ArrowRight size={13} className="text-aubergine/40 group-hover:text-chili group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom operational info (Horario y Precios) — always visible, shrink-0 */}
        <div className="pt-2.5 pb-0.5 border-t border-aubergine/10 mt-2 flex items-center justify-between text-[11px] text-aubergine/70 shrink-0 bg-white">
          <span className="font-sans truncate mr-2">
            Horario: <strong className="font-medium text-aubergine">{restaurant.opening_hours || '11:30 - 16:00'}</strong>
          </span>
          <span className="font-semibold text-aubergine shrink-0">
            Precios: <strong className="font-bold text-chili">{restaurant.price_level || 'S/ 12 - 18'}</strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
