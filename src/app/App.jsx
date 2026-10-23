import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { DiscoveryFeed } from '../components/discovery/DiscoveryFeed';
import { ActiveTicket } from '../components/reservation/ActiveTicket';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLocation } from '../hooks/useLocation';
import { useDishes } from '../hooks/useDishes';
import { useReservations } from '../hooks/useReservations';
import { useToast } from '../components/ui/Toast';

// Component wrapper for ActiveTicket route `/ticket/:id`
function TicketRouteWrapper({ userLocation, onBackToFeed }) {
  const { id } = useParams();
  const { reservation, loading, completeReservation } = useReservations(id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <p className="font-outfit font-bold text-aubergine">Cargando tu ticket digital...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="font-outfit font-bold text-lg text-aubergine mb-2">
          Ticket no encontrado
        </h3>
        <p className="text-xs text-aubergine/60 mb-4">
          La reserva solicitada no existe o expiró.
        </p>
        <button
          onClick={onBackToFeed}
          className="px-4 py-2 bg-chili text-white font-outfit font-bold text-xs rounded-xl"
        >
          Ir a descubrir comida
        </button>
      </div>
    );
  }

  return (
    <ActiveTicket
      reservation={reservation}
      userLocation={userLocation}
      onBackToFeed={onBackToFeed}
      onSimulateComplete={completeReservation}
    />
  );
}

export function App() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    location,
    radius,
    isLocating,
    changeLocation,
    changeRadius,
    requestGps,
  } = useLocation();

  const [mode, setMode] = useState('dish');
  const [filters, setFilters] = useState({
    category: 'Todos',
    maxPrice: null,
    sortBy: 'proximity',
  });

  const {
    dishes,
    restaurants,
    loading,
    error,
    refresh,
    resetStock,
  } = useDishes({
    userLocation: location,
    radius,
    category: filters.category,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    mode,
  });

  const { createReservation } = useReservations();

  const handleConfirmReservation = async (reservationParams) => {
    try {
      const newReservation = await createReservation(reservationParams);
      addToast('¡Reserva confirmada con éxito!', 'success', 2500);
      navigate(`/ticket/${newReservation.id}`);
    } catch (err) {
      addToast(err.message || 'Error al procesar la reserva', 'error');
      throw err;
    }
  };

  return (
    <Routes>
      {/* Restaurant Dashboard (Doña Rosa) - Full width desktop / tablet view */}
      <Route path="/dashboard/*" element={<DashboardLayout />} />

      {/* Diner Mobile App */}
      <Route
        path="/*"
        element={
          <div className="mobile-app-shell font-sans text-aubergine">
            <Routes>
              <Route
                path="/"
                element={
                  <DiscoveryFeed
                    dishes={dishes}
                    restaurants={restaurants}
                    loading={loading}
                    error={error}
                    location={location}
                    radius={radius}
                    isLocating={isLocating}
                    onChangeLocation={changeLocation}
                    onChangeRadius={changeRadius}
                    onRequestGps={requestGps}
                    onResetStock={resetStock}
                    onRefresh={refresh}
                    activeFilters={filters}
                    onApplyFilters={(f) => setFilters(f)}
                    onResetFilters={() => setFilters({ category: 'Todos', maxPrice: null, sortBy: 'proximity' })}
                    onConfirmReservation={handleConfirmReservation}
                    mode={mode}
                    onChangeMode={setMode}
                  />
                }
              />
              <Route
                path="/ticket/:id"
                element={
                  <TicketRouteWrapper
                    userLocation={location}
                    onBackToFeed={() => navigate('/')}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
