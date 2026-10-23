import React, { useState } from 'react';
import { Menu, Volume2, VolumeX, Database, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { audioService } from '../../services/audioService';

export function DashboardHeader({
  onToggleSidebar,
  restaurantName = 'Picantería Doña Rosa',
  isOpen = true,
  isConnected = false,
  onRefresh,
  onSimulateOrder,
}) {
  const [soundEnabled, setSoundEnabled] = useState(() => audioService.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    audioService.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      audioService.playNewOrderChime();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-aubergine/10 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Restaurant name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-aubergine rounded-xl hover:bg-cream-100"
          aria-label="Abrir navegación"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-outfit font-extrabold text-aubergine leading-tight">
              {restaurantName}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOpen
                  ? 'bg-mint-surface text-mint-dark border border-mint/20'
                  : 'bg-chili-surface text-chili border border-chili/20'
              }`}
            >
              {isOpen ? 'Abierto hoy' : 'Cerrado'}
            </span>
          </div>
          <p className="text-[11px] font-sans text-aubergine/60 hidden sm:block">
            Panel de Cocina & Gestión de Reservas Hiperlocales
          </p>
        </div>
      </div>

      {/* Right: Controls & Badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend mode indicator */}
        <div
          title={isConnected ? 'Conectado a PostgreSQL y Realtime' : 'Modo Demostración Local con persistencia de inventario'}
          className={`flex items-center gap-1.5 text-xs font-sans font-semibold px-2.5 py-1 rounded-full border ${
            isConnected
              ? 'bg-mint-surface text-mint-dark border-mint/30'
              : 'bg-mango-surface text-mango-dark border-mango/30'
          }`}
        >
          <Database size={12} />
          <span className="hidden md:inline">{isConnected ? 'Supabase Conectado' : 'Modo Demo ExpoAndina'}</span>
          <span className="md:hidden">{isConnected ? 'Online' : 'Demo'}</span>
        </div>

        {/* Audio notification toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Notificaciones sonoras activadas' : 'Silenciado'}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'bg-cream text-aubergine border-aubergine/15 hover:bg-cream-300'
              : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}
          aria-label="Alternar sonido"
        >
          {soundEnabled ? <Volume2 size={17} className="text-chili" /> : <VolumeX size={17} />}
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refrescar datos"
            className="p-2 text-aubergine/70 hover:text-aubergine rounded-xl hover:bg-cream-200 border border-aubergine/10 transition-all"
            aria-label="Refrescar datos"
          >
            <RefreshCw size={17} />
          </button>
        )}

        {/* Demo Fast Simulator Button for Judges */}
        {onSimulateOrder && (
          <button
            onClick={onSimulateOrder}
            title="Simula la llegada de un pedido desde la app del comensal"
            className="hidden sm:flex items-center gap-1.5 bg-aubergine text-cream hover:bg-aubergine-900 px-3 py-1.5 rounded-xl font-outfit text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Sparkles size={13} className="text-mango" />
            <span>[Demo] Simular Pedido</span>
          </button>
        )}
      </div>
    </header>
  );
}
