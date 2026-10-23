import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CountdownTimer } from './CountdownTimer';
import { ReservationQR } from './ReservationQR';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/money';
import { getGoogleMapsWalkingUrl } from '../../lib/geo';
import { RESERVATION_STATUS_MAP } from '../../lib/validators';
import {
  CheckCircle2,
  Navigation,
  ArrowLeft,
  Utensils,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  CheckCheck,
} from 'lucide-react';

export function ActiveTicket({
  reservation,
  userLocation,
  onBackToFeed,
  onSimulateComplete,
}) {
  useEffect(() => {
    // Fire celebratory confetti on mounting confirmed ticket
    if (reservation?.status === 'confirmed') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5A3C', '#19C37D', '#FF9F1C', '#2A1455'],
        });
      } catch (e) {
        // Fallback silently if confetti unsupported
      }
    }
  }, [reservation?.status]);

  if (!reservation) return null;

  const statusMeta = RESERVATION_STATUS_MAP[reservation.status] || RESERVATION_STATUS_MAP.confirmed;

  const handleOpenMaps = () => {
    const originLat = userLocation?.latitude || null;
    const originLng = userLocation?.longitude || null;
    const url = getGoogleMapsWalkingUrl(
      reservation.dish?.restaurant_lat,
      reservation.dish?.restaurant_lng,
      reservation.dish?.restaurant_name,
      originLat,
      originLng
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formattedCreatedTime = new Date(reservation.created_at).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex-1 p-5 pb-10 flex flex-col space-y-5 animate-fade-in-up">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-1.5 text-xs font-outfit font-bold text-aubergine hover:text-chili transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver al Descubrimiento</span>
        </button>

        <Badge variant={reservation.is_demo ? 'mango' : 'mint'} size="xs">
          {reservation.is_demo ? 'Demo ExpoAndina' : 'Supabase Sincronizado'}
        </Badge>
      </div>

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-modal p-6 shadow-modal border border-aubergine/10 text-center relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cream rounded-bl-full -z-0 opacity-80" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-mint-surface text-mint flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-2xl font-outfit font-extrabold text-aubergine leading-tight">
            ¡Tu plato te espera!
          </h2>

          {/* Status Badge */}
          <div className="mt-2">
            <span
              className={`inline-block text-xs font-sans font-semibold px-3 py-1 rounded-full border ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <p className="text-xs text-aubergine/60 font-sans mt-2 max-w-xs">
            {statusMeta.description}
          </p>

          {/* Countdown Timer with 15-minute tolerance */}
          <div className="my-6">
            <CountdownTimer
              expiresAt={reservation.expires_at}
              status={reservation.status}
            />
          </div>

          {/* QR Code Presentation */}
          <ReservationQR reservation={reservation} className="w-full max-w-xs mb-4" />

          {/* Order Details Accordion / Summary */}
          <div className="w-full bg-cream-100 rounded-2xl p-4 text-left border border-aubergine/10 space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between font-bold text-aubergine pb-2 border-b border-aubergine/10">
              <span className="flex items-center gap-1.5 font-outfit text-sm">
                <Utensils size={15} className="text-chili" />
                {reservation.dish?.title}
              </span>
              <span className="text-chili font-outfit text-base">
                {formatCurrency(reservation.totalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between text-aubergine/70">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-chili" />
                Restaurante
              </span>
              <span className="font-semibold text-aubergine truncate max-w-[180px]">
                {reservation.dish?.restaurant_name}
              </span>
            </div>

            <div className="flex items-center justify-between text-aubergine/70">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Hora de pedido
              </span>
              <span>{formattedCreatedTime}</span>
            </div>

            <div className="flex items-center justify-between text-aubergine/70">
              <span>Adelanto pagado (50% + comisión)</span>
              <span className="font-semibold text-mint">
                {formatCurrency(reservation.totalInitialPayment)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-aubergine/8 text-aubergine font-semibold">
              <span>Saldo restante al recibir tu plato</span>
              <span className="text-aubergine font-bold">
                {formatCurrency(reservation.remainingAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Button
          variant="primary"
          onClick={handleOpenMaps}
          icon={<Navigation size={18} />}
          className="w-full h-13 text-sm"
        >
          Abrir Ruta a Pie en Google Maps
        </Button>

        {/* Demo Simulation Action: Scans QR / marks as completed */}
        {reservation.status === 'confirmed' && (
          <Button
            variant="mint"
            onClick={() => onSimulateComplete(reservation.id)}
            icon={<CheckCheck size={18} />}
            className="w-full h-11 text-xs"
          >
            [Demo Jurado] Simular Escaneo de QR en Restaurante
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onBackToFeed}
          className="w-full h-11 text-xs"
        >
          Buscar otro plato
        </Button>
      </div>
    </div>
  );
}
