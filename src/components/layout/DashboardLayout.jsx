import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { NewReservationAlert } from '../orders/NewReservationAlert';
import { OperationalSummary } from '../dashboard/OperationalSummary';
import { ReservationList } from '../orders/ReservationList';
import { InventoryList } from '../inventory/InventoryList';
import { QRScanner } from '../validation/QRScanner';
import { ReservationHistory } from '../history/ReservationHistory';
import { RestaurantSettings } from '../settings/RestaurantSettings';
import { useRestaurantDashboard } from '../../hooks/useRestaurantDashboard';
import { useToast } from '../ui/Toast';
import { dishService } from '../../services/dishService';
import { reservationService } from '../../services/reservationService';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    restaurant,
    dishes,
    reservations,
    stats,
    loading,
    error,
    newOrderAlert,
    dismissOrderAlert,
    refresh,
    updateStock,
    validateReservation,
    updateProfile,
    isConnected,
  } = useRestaurantDashboard('rest-dona-rosa');

  // Handle Order fulfillment
  const handleCompleteOrder = async (orderId) => {
    try {
      await validateReservation(orderId);
      addToast('¡Comanda marcada como servida y cobrada!', 'success');
    } catch (err) {
      addToast(err.message || 'Error al completar la orden', 'error');
    }
  };

  // Handle Demo Live Simulator for ExpoAndina Judges
  const handleSimulateIncomingOrder = async () => {
    try {
      const allDishes = dishes.length > 0 ? dishes : dishService._getLocalDishes();
      const donaDishes = allDishes.filter((d) => d.stock_available > 0);
      const chosenDish = donaDishes[Math.floor(Math.random() * donaDishes.length)] || allDishes[0];

      const names = ['Carlos Mendoza (UAC)', 'Mariana Flores (Ing. Sistemas)', 'Luciana Benavides', 'Diego Huamán (Estudiante)'];
      const randomName = names[Math.floor(Math.random() * names.length)];

      await reservationService.createReservation({
        dish: chosenDish,
        quantity: 1,
        userName: randomName,
        paymentMode: 'yape_demo',
        code: String(Math.floor(100000 + Math.random() * 900000)),
      });

      addToast(`¡Pedido simulado creado para ${chosenDish.title}!`, 'success', 2500);
    } catch (err) {
      addToast(err.message || 'Error al simular pedido', 'error');
    }
  };

  const handleResetStock = async () => {
    dishService.resetDemoData();
    refresh();
    addToast('Stock de vitrina restablecido a valores iniciales', 'success');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar Navigation */}
      <Sidebar
        confirmedOrdersCount={stats.confirmedCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          restaurantName={restaurant?.name || 'Picantería Doña Rosa'}
          isOpen={restaurant?.is_open ?? true}
          isConnected={isConnected}
          onRefresh={refresh}
          onSimulateOrder={handleSimulateIncomingOrder}
        />

        {/* Real-time Order Alert Banner */}
        <NewReservationAlert
          alert={newOrderAlert}
          onDismiss={dismissOrderAlert}
          onViewOrder={(order) => {
            navigate('/dashboard/orders');
          }}
        />

        {/* Route views container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <OperationalSummary
                  stats={stats}
                  reservations={reservations}
                  onSelectReservation={(r) => navigate('/dashboard/orders')}
                  onSimulateOrder={handleSimulateIncomingOrder}
                />
              }
            />
            <Route
              path="/orders"
              element={
                <ReservationList
                  reservations={reservations}
                  onCompleteOrder={handleCompleteOrder}
                />
              }
            />
            <Route
              path="/inventory"
              element={
                <InventoryList
                  dishes={dishes}
                  onUpdateStock={updateStock}
                  onResetStock={handleResetStock}
                />
              }
            />
            <Route
              path="/validate"
              element={
                <QRScanner
                  onValidateReservation={validateReservation}
                  confirmedOrders={reservations}
                />
              }
            />
            <Route
              path="/history"
              element={
                <ReservationHistory
                  reservations={reservations}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <RestaurantSettings
                  restaurant={restaurant}
                  onUpdateProfile={updateProfile}
                  isConnected={isConnected}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
