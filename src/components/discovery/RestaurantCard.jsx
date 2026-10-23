import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Star, MapPin, Clock, Utensils, Check, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk } from '../../lib/geo';
import { Badge } from '../ui/Badge';

export function RestaurantCard({
  restaurant,
  onSwipeLeft,
  onSwipeRight,
  onSelectDish,
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

      {/* Restaurant Atmosphere Banner */}
      <div className="relative h-[42%] w-full bg-cream-400 overflow-hidden">
        <img
          src={imageError ? defaultFallback : (restaurant.image_url || defaultFallback)}
          alt={restaurant.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aubergine/80 via-aubergine/20 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
          <Badge variant="white" size="sm" icon={<MapPin size={12} className="text-chili" />}>
            {distanceInfo.fullText}
          </Badge>

          <Badge variant="mango" size="sm" icon={<Star size={12} className="fill-mango text-mango" />}>
            {restaurant.rating} ({restaurant.review_count})
          </Badge>
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
          <h2 className="text-xl font-outfit font-extrabold text-cream leading-tight">
            {restaurant.name}
          </h2>
          <p className="text-xs font-sans text-cream/80 truncate">
            {restaurant.tagline || restaurant.address}
          </p>
        </div>
      </div>

      {/* Menu Showcase for Indecisive Users */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-outfit font-bold uppercase tracking-wider text-aubergine/60 flex items-center gap-1">
              <Utensils size={12} className="text-chili" />
              Platos disponibles ahora
            </span>
            <span className="text-xs font-bold text-mint">
              {restaurant.totalAvailablePortions || (restaurant.dishes || []).length} porciones listas
            </span>
          </div>

          {/* Dishes list within this restaurant */}
          <div className="space-y-2">
            {(restaurant.dishes || []).slice(0, 3).map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDish(dish);
                }}
                className="w-full p-2.5 rounded-xl border border-aubergine/10 hover:border-chili/50 bg-cream-100 hover:bg-cream-200 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={dish.image_url}
                    alt={dish.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-outfit font-bold text-xs text-aubergine truncate group-hover:text-chili transition-colors">
                      {dish.title}
                    </p>
                    <span className="text-[10px] text-aubergine/60 font-sans block">
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

        <div className="pt-2 border-t border-aubergine/8 flex items-center justify-between text-xs text-aubergine/60">
          <span>Horario: {restaurant.opening_hours || '11:30 - 16:00'}</span>
          <span className="font-semibold text-aubergine">
            Precios: {restaurant.price_level || 'S/ 12 - 18'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
