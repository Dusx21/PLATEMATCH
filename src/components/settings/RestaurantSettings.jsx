import React, { useState } from 'react';
import { Store, Clock, MapPin, CheckCircle2, Volume2, Database, Shield, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { audioService } from '../../services/audioService';

export function RestaurantSettings({
  restaurant,
  onUpdateProfile,
  isConnected = false,
}) {
  const [name, setName] = useState(restaurant?.name || 'Picantería Doña Rosa');
  const [address, setAddress] = useState(restaurant?.address || 'Av. La Cultura 1420, San Jerónimo (frente a UAC)');
  const [openingHours, setOpeningHours] = useState(restaurant?.opening_hours || '11:30 AM - 4:00 PM');
  const [isOpen, setIsOpen] = useState(restaurant?.is_open ?? true);
  const [soundEnabled, setSoundEnabled] = useState(() => audioService.isSoundEnabled());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      audioService.setSoundEnabled(soundEnabled);
      if (onUpdateProfile) {
        await onUpdateProfile({
          name,
          address,
          opening_hours: openingHours,
          is_open: isOpen,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-aubergine/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-aubergine text-cream flex items-center justify-center font-outfit font-black text-lg">
            DR
          </div>
          <div>
            <h2 className="text-xl font-outfit font-extrabold text-aubergine">
              Configuración de Doña Rosa
            </h2>
            <p className="text-xs font-sans text-aubergine/60 mt-0.5">
              Administra la disponibilidad de tu local y tus preferencias operativas
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-mint-surface border border-mint text-aubergine flex items-center gap-2 text-xs font-sans">
          <CheckCircle2 size={16} className="text-mint shrink-0" />
          <span>¡Configuración del restaurante guardada correctamente!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-aubergine/10 shadow-xs space-y-5">
        {/* Open / Closed Toggle */}
        <div className="p-4 rounded-xl bg-cream-100 border border-aubergine/10 flex items-center justify-between">
          <div>
            <h4 className="font-outfit font-bold text-sm text-aubergine">
              Estado de Atención al Comensal
            </h4>
            <p className="text-xs font-sans text-aubergine/60">
              {isOpen
                ? 'El restaurante aparece en el feed de comensales'
                : 'Pausado: no se recibirán reservas temporales'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isOpen ? 'bg-mint' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                isOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-1">
            Nombre del Establecimiento
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border border-aubergine/15 focus:outline-none focus:ring-2 focus:ring-chili bg-white"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-1">
            Dirección en Cusco
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border border-aubergine/15 focus:outline-none focus:ring-2 focus:ring-chili bg-white"
          />
        </div>

        {/* Hours */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-1">
            Horario de Almuerzo
          </label>
          <input
            type="text"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border border-aubergine/15 focus:outline-none focus:ring-2 focus:ring-chili bg-white"
          />
        </div>

        {/* Audio Preferences */}
        <div className="p-4 rounded-xl bg-cream-100 border border-aubergine/10 flex items-center justify-between">
          <div>
            <h4 className="font-outfit font-bold text-sm text-aubergine flex items-center gap-1.5">
              <Volume2 size={16} className="text-chili" />
              Notificaciones Sonoras en Cocina
            </h4>
            <p className="text-xs font-sans text-aubergine/60">
              Emite un timbre sonoro agradable al ingresar un pedido nuevo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
              soundEnabled ? 'bg-chili' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Architecture & Backend Info */}
        <div className="p-4 rounded-xl bg-aubergine-50 border border-aubergine/15 text-xs font-sans space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-aubergine">
            <Database size={15} />
            <span>Infraestructura Backend</span>
          </div>
          <p className="text-aubergine/70">
            {isConnected
              ? 'Conectado a PostgreSQL en Supabase con suscripción Realtime activa.'
              : 'Modo Autónomo ExpoAndina: Sincronización entre pestañas activa mediante eventos y almacenamiento seguro.'}
          </p>
          <p className="text-aubergine/50 text-[11px]">
            Restaurante ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-aubergine/10">rest-dona-rosa</code>
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSaving}
          icon={<Save size={16} />}
          className="w-full h-11 text-sm"
        >
          Guardar Cambios
        </Button>
      </form>
    </div>
  );
}
