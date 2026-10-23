import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';
import { RESERVATION_STATUS_MAP } from '../../lib/validators';
import { Utensils, Clock, User, CheckCircle2, ShieldCheck, AlertCircle, Smartphone } from 'lucide-react';

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onComplete,
  isProcessing = false,
}) {
  if (!reservation) return null;

  const statusMeta = RESERVATION_STATUS_MAP[reservation.status] || RESERVATION_STATUS_MAP.confirmed;
  const timeFormatted = new Date(reservation.created_at).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const expiresFormatted = new Date(reservation.expires_at).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Comanda"
      subtitle={`Código de Reserva: ${reservation.reservationCode || reservation.id}`}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Status Badge Banner */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${statusMeta.badgeClass}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="font-outfit font-extrabold text-sm">{statusMeta.label}</span>
          </div>
          <span className="text-[11px] font-sans opacity-80 uppercase tracking-wider font-bold">
            {reservation.status}
          </span>
        </div>

        {/* Dish Info Card */}
        <div className="p-4 bg-cream-100 rounded-2xl border border-aubergine/10 flex items-center gap-3.5">
          <img
            src={reservation.dish?.image_url}
            alt={reservation.dish?.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-outfit font-extrabold text-base text-aubergine truncate">
              {reservation.dish?.title}
            </h4>
            <div className="flex items-center gap-2 text-xs font-sans text-aubergine/70 mt-1">
              <span>Cantidad: <strong className="text-aubergine">{reservation.quantity} porción(es)</strong></span>
              <span>•</span>
              <span className="font-bold text-chili">{formatCurrency(reservation.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Diner & Timing Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
          <div className="p-3 bg-white rounded-xl border border-aubergine/10">
            <span className="text-[10px] font-bold text-aubergine/50 uppercase block">Comensal</span>
            <div className="font-outfit font-bold text-sm text-aubergine mt-0.5 flex items-center gap-1.5">
              <User size={14} className="text-chili shrink-0" />
              <span className="truncate">{reservation.user_name}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-aubergine/10">
            <span className="text-[10px] font-bold text-aubergine/50 uppercase block">Hora Pedido</span>
            <div className="font-outfit font-bold text-sm text-aubergine mt-0.5 flex items-center gap-1.5">
              <Clock size={14} className="text-aubergine/60 shrink-0" />
              <span>{timeFormatted}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-aubergine/10">
            <span className="text-[10px] font-bold text-aubergine/50 uppercase block">Método Adelanto</span>
            <div className="font-outfit font-bold text-xs text-aubergine mt-0.5 flex items-center gap-1">
              <Smartphone size={13} className="text-purple-600 shrink-0" />
              <span className="capitalize">{reservation.payment_mode?.replace('_demo', ' Demo')}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-aubergine/10">
            <span className="text-[10px] font-bold text-aubergine/50 uppercase block">Tolerancia hasta</span>
            <div className="font-outfit font-bold text-xs text-aubergine mt-0.5 flex items-center gap-1">
              <Clock size={13} className="text-chili shrink-0" />
              <span>{expiresFormatted}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 space-y-2 text-xs font-sans">
          <div className="flex justify-between text-aubergine/70">
            <span>Precio total del plato</span>
            <span className="font-semibold text-aubergine">{formatCurrency(reservation.totalPrice)}</span>
          </div>

          <div className="flex justify-between text-aubergine/70">
            <span>Adelanto del 50%</span>
            <span className="font-semibold text-mint">{formatCurrency(reservation.advanceAmount)}</span>
          </div>

          <div className="flex justify-between text-aubergine/70">
            <span>Comisión de servicio</span>
            <span className="font-semibold text-aubergine">{formatCurrency(reservation.serviceFee || 0.5)}</span>
          </div>

          <div className="pt-2 border-t border-aubergine/10 flex justify-between font-bold text-sm text-aubergine">
            <span>Saldo a cobrar al comensal en caja</span>
            <span className="font-outfit font-black text-base text-chili">
              {formatCurrency(reservation.remainingAmount)}
            </span>
          </div>
        </div>

        {/* Action button if order is confirmed */}
        {reservation.status === 'confirmed' && onComplete && (
          <div className="pt-2">
            <Button
              variant="mint"
              onClick={() => onComplete(reservation.id)}
              isLoading={isProcessing}
              icon={<ShieldCheck size={18} />}
              className="w-full h-12 text-sm"
            >
              Marcar como Servido & Cobrar Saldo ({formatCurrency(reservation.remainingAmount)})
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
