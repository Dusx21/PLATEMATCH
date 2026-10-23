import { useState, useEffect, useCallback, useMemo } from 'react';
import { reservationService } from '../services/reservationService';
import { dishService } from '../services/dishService';
import { isSupabaseConfigured } from '../services/supabase';

export function useRestaurantDashboard(restaurantId = 'rest-dona-rosa') {
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [restData, dishesData, resData] = await Promise.all([
        dishService.getRestaurantProfile(restaurantId),
        dishService.getDishesByRestaurant(restaurantId),
        reservationService.getReservationsByRestaurant(restaurantId),
      ]);
      setRestaurant(restData);
      setDishes(dishesData);
      setReservations(resData);
    } catch (err) {
      console.error('Error loading restaurant dashboard data:', err);
      setError(err.message || 'Error al cargar los datos del restaurante');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadDashboardData();

    // Subscribe to incoming reservations in Realtime
    const unsubscribeOrders = reservationService.subscribeToRestaurantReservations(
      restaurantId,
      (newRes) => {
        setReservations((prev) => {
          const exists = prev.some((r) => r.id === newRes.id);
          if (exists) return prev;
          return [newRes, ...prev];
        });
        setNewOrderAlert(newRes);
        // Also refresh dishes to reflect decremented stock
        dishService.getDishesByRestaurant(restaurantId).then(setDishes);
      },
      (updatedRes) => {
        setReservations((prev) =>
          prev.map((r) => (r.id === updatedRes.id ? { ...r, ...updatedRes } : r))
        );
      }
    );

    // Listen to inventory updates
    const handleDataUpdate = () => {
      dishService.getDishesByRestaurant(restaurantId).then(setDishes);
    };
    window.addEventListener('platematch_data_updated', handleDataUpdate);

    return () => {
      unsubscribeOrders();
      window.removeEventListener('platematch_data_updated', handleDataUpdate);
    };
  }, [restaurantId, loadDashboardData]);

  // Adjust dish stock (+1, -1, or set value)
  const updateStock = useCallback(
    async (dishId, deltaOrValue, isAbsolute = false) => {
      try {
        const updated = await dishService.updateDishStock(dishId, restaurantId, deltaOrValue, isAbsolute);
        setDishes((prev) => prev.map((d) => (d.id === dishId ? { ...d, ...updated } : d)));
        return updated;
      } catch (err) {
        console.error('Error updating stock:', err);
        throw err;
      }
    },
    [restaurantId]
  );

  // Validate QR and complete reservation
  const validateReservation = useCallback(
    async (qrOrCode) => {
      try {
        const completed = await reservationService.validateAndCompleteReservation({
          qrOrCode,
          restaurantId,
        });
        setReservations((prev) =>
          prev.map((r) => (r.id === completed.id ? { ...r, ...completed } : r))
        );
        return completed;
      } catch (err) {
        console.error('Validation error:', err);
        throw err;
      }
    },
    [restaurantId]
  );

  // Update restaurant profile (name, open status, hours)
  const updateProfile = useCallback(
    async (updates) => {
      try {
        const updated = await dishService.updateRestaurantProfile(restaurantId, updates);
        setRestaurant(updated);
        return updated;
      } catch (err) {
        console.error('Profile update error:', err);
        throw err;
      }
    },
    [restaurantId]
  );

  // Computed Operational Metrics
  const stats = useMemo(() => {
    const totalReservations = reservations.length;
    const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
    const completedCount = reservations.filter((r) => r.status === 'completed').length;
    const expiredCount = reservations.filter((r) => r.status === 'expired').length;
    const pendingCount = reservations.filter((r) => r.status === 'pending').length;

    const totalAvailablePortions = dishes.reduce((acc, d) => acc + (d.stock_available || 0), 0);
    const soldOutDishes = dishes.filter((d) => (d.stock_available || 0) <= 0).length;

    const totalAdvances = reservations.reduce((acc, r) => acc + (Number(r.advanceAmount) || 0), 0);
    const totalRevenue = reservations
      .filter((r) => r.status === 'completed' || r.status === 'confirmed')
      .reduce((acc, r) => acc + (Number(r.totalPrice) || 0), 0);

    const dinersServed = reservations
      .filter((r) => r.status === 'completed')
      .reduce((acc, r) => acc + (r.quantity || 1), 0);

    return {
      totalReservations,
      confirmedCount,
      completedCount,
      expiredCount,
      pendingCount,
      totalAvailablePortions,
      soldOutDishes,
      totalAdvances,
      totalRevenue,
      dinersServed,
    };
  }, [reservations, dishes]);

  return {
    restaurant,
    dishes,
    reservations,
    stats,
    loading,
    error,
    newOrderAlert,
    dismissOrderAlert: () => setNewOrderAlert(null),
    refresh: loadDashboardData,
    updateStock,
    validateReservation,
    updateProfile,
    isConnected: isSupabaseConfigured(),
  };
}
