import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Clock, MapPin, Info, Flame, Heart, X, Check } from 'lucide-react';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk } from '../../lib/geo';
import { Badge } from '../ui/Badge';

export function DishCard({
  dish,
  onSwipeLeft,
  onSwipeRight,
  onOpenDetail,
  isFront = true,
}) {
  const [imageError, setImageError] = useState(false);
  const x = useMotionValue(0);

  // Smooth transforms based on horizontal drag distance
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.6, 1, 1, 1, 0.6]);

  // Stamp opacity transforms
  const matchOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipeRight(dish);
    } else if (info.offset.x < -threshold) {
      onSwipeLeft(dish);
    }
  };

  const distanceInfo = formatDistanceAndWalk(dish.distanceMeters);

  // Fallback food graphic if Unsplash is unreachable
  const defaultFallback = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80';

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

      {/* Culinary Image Area */}
      <div className="relative h-[55%] w-full bg-cream-400 overflow-hidden">
        <img
          src={imageError ? defaultFallback : (dish.image_url || defaultFallback)}
          alt={dish.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 pointer-events-none"
          draggable={false}
        />

        {/* Gradient shade for bottom readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-aubergine/80 via-aubergine/15 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
          <Badge variant="white" size="sm" icon={<MapPin size={12} className="text-chili" />}>
            {distanceInfo.fullText}
          </Badge>

          {/* Stock Availability Badge (Mango) */}
          <Badge
            variant={dish.stock_available <= 3 ? 'chili' : 'mango'}
            size="sm"
            icon={<Flame size={12} />}
          >
            {dish.stock_available <= 1
              ? '¡Última porción!'
              : `Quedan ${dish.stock_available} porciones`}
          </Badge>
        </div>

        {/* Info button floating on image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(dish);
          }}
          className="absolute bottom-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-aubergine shadow-md hover:bg-white transition-all active:scale-95"
          aria-label="Ver detalles del plato"
        >
          <Info size={17} />
        </button>

        {/* Category tag */}
        <div className="absolute bottom-3.5 left-3.5 z-10">
          <span className="font-outfit text-xs font-bold uppercase tracking-wider text-cream/90 bg-aubergine/80 backdrop-blur-sm px-2.5 py-1 rounded-xl">
            {dish.category}
          </span>
        </div>
      </div>

      {/* Dish Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Restaurant & Address */}
          <div className="flex items-center justify-between text-xs text-aubergine/70 mb-1">
            <span className="font-sans font-semibold text-aubergine/90 truncate max-w-[220px]">
              {dish.restaurant_name}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-aubergine/60 shrink-0">
              <Clock size={11} />
              ~{dish.preparation_time_mins || 7} min
            </span>
          </div>

          {/* Dish Title */}
          <h2 className="text-xl font-outfit font-extrabold text-aubergine line-clamp-1 leading-tight tracking-tight">
            {dish.title}
          </h2>

          {/* Brief appetizing description */}
          <p className="text-xs font-sans text-aubergine/70 mt-1 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Price & Tags Footer */}
        <div className="pt-2 border-t border-aubergine/8 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-sans uppercase font-bold text-aubergine/50 tracking-wider block">
              Precio al paso
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-outfit font-extrabold text-2xl text-aubergine">
                {formatCurrency(dish.price)}
              </span>
              <span className="text-[10px] font-sans text-mint font-semibold">
                (50% adelanto)
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            {(dish.tags || []).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-lg bg-cream-300 text-aubergine/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
