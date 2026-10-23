import React from 'react';
import { formatCurrency } from '../../lib/money';
import { RESERVATION_STATUS_MAP } from '../../lib/validators';
import { Utensils, Clock, User, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecentReservations({
  reservations = [],
  onSelectReservation,
}) {
  const recent = reservations.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-aubergine/10">
        <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-aubergine/40 mb-3">
          <Utensils size={22} />
        </div>
        <h4 className="font-outfit font-bold text-sm text-aubergine">
          No hay reservas registradas hoy
        </h4>
        <p className="text-xs text-aubergine/60 font-sans mt-1">
          Las comandas generadas por comensales aparecerán aquí en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-aubergine/10 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-aubergine/10 flex items-center justify-between">
        <div>
          <h3 className="font-outfit font-extrabold text-base text-aubergine">
            Comandas Recientes
          </h3>
          <p className="text-xs font-sans text-aubergine/60">
            Actualizaciones en tiempo real desde comensales hiperlocales
          </p>
        </div>

        <Link
          to="/dashboard/orders"
          className="text-xs font-outfit font-bold text-chili hover:underline flex items-center gap-1"
        >
          <span>Ver todas</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="divide-y divide-aubergine/8">
        {recent.map((res) => {
          const statusMeta = RESERVATION_STATUS_MAP[res.status] || RESERVATION_STATUS_MAP.confirmed;
          const timeFormatted = new Date(res.created_at).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={res.id}
              onClick={() => onSelectReservation && onSelectReservation(res)}
              className="p-4 hover:bg-cream-100 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Dish info & User */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={res.dish?.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80'}
                  alt={res.dish?.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-outfit font-extrabold text-sm text-aubergine truncate group-hover:text-chili transition-colors">
                      {res.dish?.title || 'Plato reservado'}
                    </h4>
                    <span className="text-[11px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-aubergine/10 text-aubergine shrink-0">
                      x{res.quantity || 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-sans text-aubergine/60 mt-0.5">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {res.user_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {timeFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Amounts */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-outfit font-extrabold text-sm text-aubergine">
                    {formatCurrency(res.totalPrice)}
                  </div>
                  <div className="text-[10px] font-sans text-mint font-semibold">
                    Adelanto: {formatCurrency(res.advanceAmount)} <span className="opacity-70">(simulado)</span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full border ${statusMeta.badgeClass}`}
                >
                  {statusMeta.label.split('·')[0].trim()}
                </span>

                <ChevronRight size={16} className="text-aubergine/30 group-hover:text-chili group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
