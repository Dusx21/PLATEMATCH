import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CUSCO_DEMO_LOCATIONS } from '../../lib/geo';
import { Navigation, MapPin, Check, Radio } from 'lucide-react';

export function LocationSelectorModal({
  isOpen,
  onClose,
  currentLocation,
  currentRadius,
  onSelectLocation,
  onSelectRadius,
  onRequestGps,
  isLocating,
}) {
  const [gpsError, setGpsError] = useState(null);

  const handleGpsClick = async () => {
    setGpsError(null);
    try {
      await onRequestGps();
      onClose();
    } catch (err) {
      setGpsError(err.message || 'No se pudo acceder a la ubicación.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubicación y Geocerca"
      subtitle="Elige tu punto de referencia en Cusco o usa tu GPS"
    >
      <div className="space-y-6">
        {/* Geofence radius selector */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-2">
            Radio de Búsqueda Hiperlocal
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[300, 500].map((rad) => {
              const active = currentRadius === rad;
              return (
                <button
                  key={rad}
                  type="button"
                  onClick={() => onSelectRadius(rad)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    active
                      ? 'border-chili bg-chili-surface text-aubergine font-bold shadow-sm'
                      : 'border-aubergine/10 bg-white hover:bg-cream-100 text-aubergine/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-outfit text-base font-bold">{rad} metros</span>
                    {active && <Check size={16} className="text-chili" />}
                  </div>
                  <span className="text-[11px] font-sans text-aubergine/60 block">
                    {rad === 300 ? 'Máx. 3-4 min a pie' : 'Máx. 5-6 min a pie'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GPS Option */}
        <div>
          <Button
            variant="outline"
            className="w-full justify-between h-12"
            isLoading={isLocating}
            onClick={handleGpsClick}
            icon={<Navigation size={16} className="text-chili" />}
          >
            <span>Usar mi GPS Real</span>
          </Button>
          {gpsError && (
            <p className="text-xs text-chili mt-1.5 font-medium">{gpsError}</p>
          )}
        </div>

        {/* Cusco Demo Landmarks */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-2.5">
            Puntos Clave en Cusco (Demo ExpoAndina)
          </label>
          <div className="space-y-2">
            {CUSCO_DEMO_LOCATIONS.map((loc) => {
              const isSelected = currentLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-aubergine bg-aubergine text-cream shadow-md'
                      : 'border-aubergine/10 bg-white hover:bg-cream-100 text-aubergine'
                  }`}
                >
                  <MapPin
                    size={18}
                    className={`mt-0.5 shrink-0 ${isSelected ? 'text-chili' : 'text-aubergine/40'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-outfit font-bold text-sm truncate">
                        {loc.name}
                      </span>
                      {loc.isDefault && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isSelected ? 'bg-cream/20 text-cream' : 'bg-mango/20 text-mango-dark'
                          }`}
                        >
                          Sede UAC
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-sans mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-cream/70' : 'text-aubergine/60'
                      }`}
                    >
                      {loc.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
