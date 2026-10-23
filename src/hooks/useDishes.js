import { useState, useEffect, useCallback } from 'react';
import { dishService } from '../services/dishService';

export function useDishes({
  userLocation,
  radius = 500,
  category = 'Todos',
  maxPrice = null,
  sortBy = 'proximity',
  mode = 'dish', // 'dish' | 'restaurant'
}) {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'dish') {
        const data = await dishService.getDishes({
          userLocation,
          maxDistance: radius,
          category,
          maxPrice,
          sortBy,
          availableOnly: true,
        });
        setDishes(data);
      } else {
        const data = await dishService.getRestaurants({
          userLocation,
          maxDistance: radius,
        });
        setRestaurants(data);
      }
    } catch (err) {
      console.error('Error fetching discovery data:', err);
      setError(err.message || 'Error al cargar los platos disponibles');
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius, category, maxPrice, sortBy, mode]);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('platematch_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('platematch_data_updated', handleUpdate);
    };
  }, [loadData]);

  const resetStock = useCallback(() => {
    dishService.resetDemoData();
    loadData();
  }, [loadData]);

  return {
    dishes,
    restaurants,
    loading,
    error,
    refresh: loadData,
    resetStock,
  };
}
