import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../lib/money';
import { RESERVATION_STATUS_MAP } from '../../lib/validators';
import { Search, Filter, Calendar, Utensils, User, Clock, CheckCircle2, Eye, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReservationDetailModal } from '../orders/ReservationDetailModal';

export function ReservationHistory({ reservations = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRes, setSelectedRes] = useState(null);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          r.user_name?.toLowerCase().includes(term) ||
          r.dish?.title?.toLowerCase().includes(term) ||
          r.reservationCode?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [reservations, statusFilter, searchTerm]);

  // Aggregate stats
  const totalCompleted = reservations.filter((r) => r.status === 'completed').length;
  const totalPortionsServed = reservations
    .filter((r) => r.status === 'completed')
    .reduce((acc, r) => acc + (r.quantity || 1), 0);
  const totalIncome = reservations
    .filter((r) => r.status === 'completed')
    .reduce((acc, r) => acc + (Number(r.totalPrice) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Comensales Atendidos
          </span>
          <span className="font-outfit font-black text-2xl text-aubergine mt-1 block">
            {totalPortionsServed}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Porciones entregadas</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Comandas Cerradas
          </span>
          <span className="font-outfit font-black text-2xl text-mint mt-1 block">
            {totalCompleted}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Validadas por QR</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aubergine/60 block">
            Total Facturado (Simulado)
          </span>
          <span className="font-outfit font-black text-2xl text-chili mt-1 block">
            {formatCurrency(totalIncome)}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">Adelantos + Saldos en local</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-aubergine/10 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aubergine/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el historial por comensal o plato..."
            className="w-full pl-9 pr-4 py-2 text-xs font-sans rounded-xl border border-aubergine/15 focus:outline-none focus:ring-2 focus:ring-chili bg-cream-50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'completed', label: 'Completados' },
            { id: 'confirmed', label: 'En Cocina' },
            { id: 'expired', label: 'Expirados' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-bold transition-all shrink-0 ${
                statusFilter === s.id
                  ? 'bg-aubergine text-cream shadow-xs'
                  : 'bg-cream-100 hover:bg-cream-200 text-aubergine/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-aubergine/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-cream-200 text-aubergine/70 font-outfit font-bold text-[11px] uppercase tracking-wider border-b border-aubergine/10">
              <tr>
                <th className="py-3 px-4">Código / Fecha</th>
                <th className="py-3 px-4">Comensal</th>
                <th className="py-3 px-4">Plato & Cantidad</th>
                <th className="py-3 px-4">Adelanto (Simulado)</th>
                <th className="py-3 px-4">Saldo Local</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aubergine/8">
              {filtered.map((r) => {
                const statusMeta = RESERVATION_STATUS_MAP[r.status] || RESERVATION_STATUS_MAP.confirmed;
                const dateFormatted = new Date(r.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={r.id} className="hover:bg-cream-100/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-outfit font-extrabold text-aubergine block">
                        {r.reservationCode || r.id}
                      </span>
                      <span className="text-[11px] text-aubergine/50">{dateFormatted}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-aubergine">
                      {r.user_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-aubergine block truncate max-w-[200px]">
                        {r.dish?.title}
                      </span>
                      <span className="text-[11px] text-aubergine/60">{r.quantity} porción(es)</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-mint">
                      {formatCurrency(r.advanceAmount)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-aubergine">
                      {formatCurrency(r.remainingAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border ${statusMeta.badgeClass}`}>
                        {statusMeta.label.split('·')[0].trim()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRes(r)}
                        className="p-1.5 text-aubergine/60 hover:text-aubergine rounded-lg hover:bg-cream-200"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReservationDetailModal
        isOpen={Boolean(selectedRes)}
        onClose={() => setSelectedRes(null)}
        reservation={selectedRes}
      />
    </div>
  );
}
