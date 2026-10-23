import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Utensils, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/money';

export function NewReservationAlert({ alert, onDismiss, onViewOrder }) {
  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="fixed top-20 right-4 lg:right-8 z-50 max-w-md w-full bg-aubergine text-cream rounded-2xl shadow-modal border-2 border-chili p-4 overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-chili text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-sm text-cream tracking-wide uppercase">
                  ¡Nueva reserva recibida!
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-mint text-white">
                  En Cocina
                </span>
              </div>

              <h4 className="font-outfit font-extrabold text-base text-white mt-0.5">
                {alert.dish?.title || 'Plato del menú'} · {alert.quantity || 1} porción
              </h4>

              <div className="flex items-center gap-2 text-xs font-sans text-cream/80 mt-1">
                <span>Comensal: <strong className="text-cream">{alert.user_name}</strong></span>
                <span>•</span>
                <span>Adelanto: <strong className="text-mint">{formatCurrency(alert.advanceAmount || 8)}</strong> <span className="text-[10px] opacity-70">(simulado)</span></span>
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-cream/50 hover:text-cream p-1 -mr-1"
            aria-label="Cerrar notificación"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-aubergine-700 flex items-center justify-between">
          <span className="text-[11px] font-sans text-cream/60">
            Código: <strong className="font-outfit text-mango">{alert.reservationCode || alert.id}</strong>
          </span>

          <button
            onClick={() => {
              if (onViewOrder) onViewOrder(alert);
              onDismiss();
            }}
            className="flex items-center gap-1.5 text-xs font-outfit font-bold text-chili hover:text-chili-light bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-all"
          >
            <span>Ver Comanda</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
