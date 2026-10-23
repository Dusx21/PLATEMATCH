import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../lib/money';
import { RESERVATION_STATUS_MAP } from '../../lib/validators';
import { Search, Filter, Utensils, Clock, User, CheckCircle2, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReservationDetailModal } from './ReservationDetailModal';

export function ReservationList({
  reservations = [],
  onCompleteOrder,
  isProcessing = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'completed' | 'expired'
  const [selectedRes, setSelectedRes] = useState(null);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      // 2. Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesUser = r.user_name?.toLowerCase().includes(term);
        const matchesDish = r.dish?.title?.toLowerCase().includes(term);
        const matchesCode = r.reservationCode?.toLowerCase().includes(term) || r.id?.toLowerCase().includes(term);
        return matchesUser || matchesDish || matchesCode;
      }

      return true;
    });
  }, [reservations, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    return {
      all: reservations.length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
      completed: reservations.filter((r) => r.status === 'completed').length,
      expired: reservations.filter((r) => r.status === 'expired').length,
    };
  }, [reservations]);

  return (
    <div className="space-y-4">
      {/* Search and Status Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-aubergine/10 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aubergine/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por comensal, plato o código (ej. PM-CUS)..."
            className="w-full pl-9 pr-4 py-2.5 text-xs font-sans rounded-xl border border-aubergine/15 focus:outline-none focus:ring-2 focus:ring-chili focus:border-transparent bg-cream-50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos', count: counts.all },
            { id: 'confirmed', label: 'En Cocina', count: counts.confirmed, color: 'bg-chili text-white' },
            { id: 'completed', label: 'Completados', count: counts.completed, color: 'bg-mint text-white' },
            { id: 'expired', label: 'Expirados', count: counts.expired },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  active
                    ? 'bg-aubergine text-cream shadow-xs'
                    : 'bg-cream-100 hover:bg-cream-200 text-aubergine/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-cream/20 text-cream' : 'bg-aubergine/10 text-aubergine'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-aubergine/10">
          <Utensils size={32} className="mx-auto text-aubergine/30 mb-2" />
          <h4 className="font-outfit font-bold text-base text-aubergine">
            No se encontraron reservas
          </h4>
          <p className="text-xs text-aubergine/60 font-sans mt-1">
            Prueba ajustando el término de búsqueda o cambiando el filtro de estado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((res) => {
            const statusMeta = RESERVATION_STATUS_MAP[res.status] || RESERVATION_STATUS_MAP.confirmed;
            const timeFormatted = new Date(res.created_at).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isConfirmed = res.status === 'confirmed';

            return (
              <div
                key={res.id}
                className={`p-4 rounded-2xl bg-white border transition-all hover:shadow-card flex flex-col justify-between ${
                  isConfirmed ? 'border-chili/40 shadow-xs ring-1 ring-chili/20' : 'border-aubergine/10'
                }`}
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="font-outfit font-black text-xs text-aubergine tracking-wider">
                        {res.reservationCode || res.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-sans text-aubergine/60 mt-0.5">
                        <Clock size={12} />
                        <span>{timeFormatted}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label.split('·')[0].trim()}
                    </span>
                  </div>

                  {/* Dish snapshot */}
                  <div className="flex items-center gap-3 p-2.5 bg-cream-100 rounded-xl mb-3">
                    <img
                      src={res.dish?.image_url}
                      alt={res.dish?.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-outfit font-bold text-xs text-aubergine truncate">
                        {res.dish?.title}
                      </h4>
                      <p className="text-[11px] font-sans text-aubergine/70">
                        {res.quantity} porción(es) · <strong className="text-chili">{formatCurrency(res.totalPrice)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs font-sans text-aubergine/80 mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-aubergine/60">Comensal:</span>
                      <strong className="truncate max-w-[170px]">{res.user_name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-aubergine/60">Adelanto 50%:</span>
                      <strong className="text-mint">{formatCurrency(res.advanceAmount)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-aubergine/60">Saldo a cobrar:</span>
                      <strong className="text-chili font-outfit text-sm">{formatCurrency(res.remainingAmount)}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-aubergine/8 flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setSelectedRes(res)}
                    icon={<Eye size={14} />}
                    className="flex-1 text-xs"
                  >
                    Detalles
                  </Button>

                  {isConfirmed && onCompleteOrder && (
                    <Button
                      variant="mint"
                      size="sm"
                      onClick={() => onCompleteOrder(res.id)}
                      isLoading={isProcessing}
                      icon={<ShieldCheck size={14} />}
                      className="flex-1 text-xs"
                    >
                      Servir & Cobrar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Detail Modal */}
      <ReservationDetailModal
        isOpen={Boolean(selectedRes)}
        onClose={() => setSelectedRes(null)}
        reservation={selectedRes}
        onComplete={(id) => {
          if (onCompleteOrder) onCompleteOrder(id);
          setSelectedRes(null);
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}
