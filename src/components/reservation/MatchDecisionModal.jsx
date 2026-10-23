import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';
import { formatDistanceAndWalk, getGoogleMapsWalkingUrl } from '../../lib/geo';
import { Badge } from '../ui/Badge';
import { Sparkles, Footprints, ShieldCheck, Clock, MapPin, Flame } from 'lucide-react';

export function MatchDecisionModal({
  isOpen,
  onClose,
  dish,
  userLocation,
  onOpenCheckout,
}) {
  if (!dish) return null;

  const distanceInfo = formatDistanceAndWalk(dish.distanceMeters);

  const handleWalkingRoute = () => {
    const originLat = userLocation?.latitude || null;
    const originLng = userLocation?.longitude || null;
    const url = getGoogleMapsWalkingUrl(
      dish.restaurant_lat,
      dish.restaurant_lng,
      dish.restaurant_name,
      originLat,
      originLng
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¡Hiciste Match!"
      subtitle="Elige cómo deseas asegurar tu comida"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Match Dish Card Snapshot */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-cream-200 border border-aubergine/10">
          <img
            src={dish.image_url}
            alt={dish.title}
            className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-sans font-semibold text-aubergine/70 block truncate">
              {dish.restaurant_name}
            </span>
            <h4 className="font-outfit font-extrabold text-base text-aubergine truncate leading-snug">
              {dish.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-outfit font-extrabold text-sm text-chili">
                {formatCurrency(dish.price)}
              </span>
              <Badge variant="mango" size="xs">
                {dish.stock_available} porciones
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-aubergine/60 font-sans mt-0.5">
              <span>{distanceInfo.fullText}</span>
            </div>
          </div>
        </div>

        {/* Option 1: Reserva Express (Recommended) */}
        <div className="p-4 rounded-2xl border-2 border-chili bg-chili-surface relative overflow-hidden group hover:border-chili-dark transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-chili text-white shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-outfit font-extrabold text-base text-aubergine">
                  Reserva Express
                </h4>
                <p className="text-xs text-aubergine/70 font-sans">
                  Asegura tu porción antes de que se agote
                </p>
              </div>
            </div>
            <Badge variant="mint" size="xs">
              Recomendado
            </Badge>
          </div>

          <p className="text-xs font-sans text-aubergine/80 mb-3 leading-relaxed">
            Pagas un <strong className="font-semibold text-aubergine">adelanto del 50%</strong> ({formatCurrency(dish.price * 0.5)}) + <strong className="font-semibold text-aubergine">S/ 0.50 de servicio</strong>. Tu plato se envía a cocina de inmediato con 15 min de tolerancia.
          </p>

          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onOpenCheckout(dish);
            }}
            className="w-full h-11"
          >
            Reservar por {formatCurrency(dish.price * 0.5 + 0.5)}
          </Button>
        </div>

        {/* Option 2: Solo ir a pie */}
        <div className="p-4 rounded-2xl border border-aubergine/15 bg-white hover:bg-cream-100 transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-aubergine/10 text-aubergine">
                <Footprints size={18} />
              </div>
              <div>
                <h4 className="font-outfit font-extrabold text-base text-aubergine">
                  Solo ir a pie
                </h4>
                <p className="text-xs text-aubergine/60 font-sans">
                  ¿Prefieres ir directamente sin reservar?
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs font-sans text-aubergine/70 mb-3 leading-relaxed">
            Te abrimos la ruta a pie en Google Maps ({distanceInfo.walkText}). Ten en cuenta que la porción no queda reservada y podría agotarse.
          </p>

          <Button
            variant="outline"
            onClick={handleWalkingRoute}
            icon={<MapPin size={16} />}
            className="w-full h-11"
          >
            Abrir Ruta en Google Maps
          </Button>
        </div>
      </div>
    </Modal>
  );
}
