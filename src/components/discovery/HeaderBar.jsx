import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, SlidersHorizontal, Sparkles, Database } from 'lucide-react';
import { PlateMatchLogo } from '../brand/PlateMatchLogo';
import { isSupabaseConfigured } from '../../services/supabase';
import { transitions, buttonInteractions } from '../../lib/animations';

export function HeaderBar({
  location,
  radius,
  onOpenLocationModal,
  onOpenFilters,
  onResetStock,
}) {
  const isConnected = isSupabaseConfigured();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
      className="px-5 pt-4 pb-3 flex flex-col gap-3 bg-cream/90 backdrop-blur-md sticky top-0 z-30 border-b border-aubergine/8"
    >
      {/* Top brand & actions row */}
      <div className="flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={transitions.snappy}
        >
          <PlateMatchLogo size="sm" withText={true} />
        </motion.div>

        <div className="flex items-center gap-1.5">
          {/* Mode / Backend indicator badge */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={transitions.snappy}
            onClick={onResetStock}
            title={isConnected ? 'Conectado a Supabase' : 'Modo Demo ExpoAndina (clic para reiniciar stock)'}
            className={`flex items-center gap-1 text-[11px] font-sans font-medium px-2.5 py-1 rounded-full border transition-colors ${
              isConnected
                ? 'bg-mint-surface text-mint-dark border-mint/30'
                : 'bg-mango-surface text-mango-dark border-mango/30 hover:bg-mango/20'
            }`}
          >
            <Database size={11} />
            <span>{isConnected ? 'Supabase' : 'Demo UAC'}</span>
          </motion.button>

          {/* Filter toggle button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={transitions.snappy}
            onClick={onOpenFilters}
            className="p-2 text-aubergine/80 hover:text-aubergine bg-white rounded-full border border-aubergine/10 shadow-xs hover:shadow-card transition-all"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={17} />
          </motion.button>

          {/* Quick link to Restaurant Dashboard for ExpoAndina demo */}
          <motion.a
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={transitions.snappy}
            href="/dashboard"
            title="Ir al Dashboard de Doña Rosa (Restaurante)"
            className="p-2 text-white bg-aubergine hover:bg-aubergine-900 rounded-full shadow-xs hover:shadow-card transition-all"
            aria-label="Ir al Dashboard de Doña Rosa"
          >
            <span className="font-outfit font-black text-xs px-1">DR</span>
          </motion.a>
        </div>
      </div>

      {/* Geofence & Location selector pill */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={transitions.snappy}
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-aubergine/10 text-aubergine shadow-xs hover:bg-white transition-all text-xs font-sans max-w-[280px] truncate"
        >
          <MapPin size={13} className="text-chili shrink-0" />
          <span className="font-semibold truncate">{location?.name || 'Cusco'}</span>
          <span className="text-[10px] bg-aubergine/10 text-aubergine font-bold px-1.5 py-0.5 rounded-md ml-1 shrink-0">
            {radius} m
          </span>
        </motion.button>

        <span className="text-[11px] font-sans font-medium text-aubergine/60 flex items-center gap-1 shrink-0">
          <Sparkles size={12} className="text-mango" />
          &lt; 40s
        </span>
      </div>

      {/* Greeting and call to action headline */}
      <div>
        <h1 className="text-xl font-outfit font-extrabold text-aubergine tracking-tight leading-none">
          ¿Qué se te antoja hoy?
        </h1>
        <p className="text-xs font-sans text-aubergine/70 mt-1">
          Encuentra tu próximo plato favorito a unos pasos de ti.
        </p>
      </div>
    </motion.header>
  );
}
