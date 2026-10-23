import React from 'react';
import { MetricCard } from './MetricCard';
import { RecentReservations } from './RecentReservations';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  QrCode,
  Sparkles,
  Leaf,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../lib/money';
import { Link } from 'react-router-dom';

export function OperationalSummary({
  stats,
  reservations,
  onSelectReservation,
  onSimulateOrder,
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-aubergine text-cream shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-outfit font-extrabold uppercase tracking-wider text-mango">
            Turno de Almuerzo · ExpoAndina 2026
          </span>
          <h2 className="text-2xl font-outfit font-black text-white mt-0.5">
            Panel de Operaciones en Vivo
          </h2>
          <p className="text-xs text-cream/70 font-sans mt-1 max-w-xl">
            Gestiona la llegada de comensales desde la app móvil, monitorea las porciones preparadas y asegura cero merma de comida casera.
          </p>
        </div>

        {/* Quick actions row */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            to="/dashboard/validate"
            className="flex items-center gap-2 bg-chili text-white hover:bg-chili-dark px-4 py-2.5 rounded-xl font-outfit text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <QrCode size={16} />
            <span>Validar QR</span>
          </Link>

          <Link
            to="/dashboard/inventory"
            className="flex items-center gap-2 bg-white/10 text-cream hover:bg-white/20 border border-cream/15 px-4 py-2.5 rounded-xl font-outfit text-xs font-bold transition-all"
          >
            <Package size={16} />
            <span>Ajustar Stock</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Reservas de Hoy"
          value={stats.totalReservations}
          subtext="Comandas generadas"
          icon={<UtensilsCrossed size={19} />}
          badgeText="Total"
          variant="default"
        />

        <MetricCard
          title="En Cocina (Esperando)"
          value={stats.confirmedCount}
          subtext="Comensales en camino"
          icon={<Clock size={19} />}
          badgeText="Tolerancia 15m"
          variant="chili"
        />

        <MetricCard
          title="Comensales Atendidos"
          value={stats.dinersServed}
          subtext="Platos servidos y cobrados"
          icon={<CheckCircle2 size={19} />}
          badgeText="Completados"
          variant="mint"
        />

        <MetricCard
          title="Porciones Disponibles"
          value={stats.totalAvailablePortions}
          subtext="En vitrina para reservar"
          icon={<Package size={19} />}
          badgeText="Stock Vivo"
          variant="mango"
        />
      </div>

      {/* Financial & Waste Reduction Secondary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aubergine/60">
              Adelantos Registrados
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cream-300 text-aubergine">
              Simulado
            </span>
          </div>
          <span className="font-outfit font-black text-2xl text-mint mt-1 block">
            {formatCurrency(stats.totalAdvances)}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">
            50% de garantía por reserva
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aubergine/60">
              Mermas Evitadas
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-mint-surface text-mint-dark">
              FoodTech
            </span>
          </div>
          <span className="font-outfit font-black text-2xl text-aubergine mt-1 block">
            ~85%
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">
            Comida asignada antes de enfriar
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aubergine/60">
              Platos Agotados
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-aubergine/10 text-aubergine">
              Carta
            </span>
          </div>
          <span className={`font-outfit font-black text-2xl mt-1 block ${stats.soldOutDishes > 0 ? 'text-chili' : 'text-mint'}`}>
            {stats.soldOutDishes}
          </span>
          <span className="text-[11px] font-sans text-aubergine/50">
            {stats.soldOutDishes === 0 ? 'Toda la carta disponible' : 'Requiere preparación'}
          </span>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <RecentReservations
        reservations={reservations}
        onSelectReservation={onSelectReservation}
      />
    </div>
  );
}
