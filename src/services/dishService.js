import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_DISHES, DEMO_RESTAURANTS } from '../data/demoData';
import { haversineDistance, calculateWalkingTimeMinutes } from '../lib/geo';

// Warn once in dev when Supabase is not configured
if (import.meta.env.DEV && !isSupabaseConfigured()) {
  console.info(
    '[platematch] Supabase no configurado. La app corre en Modo Demo offline.\n' +
    'Para conectar Supabase, crea un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}

const STORAGE_KEY_DISHES = 'platematch_dishes_cache_v2';
const STORAGE_KEY_RESTS = 'platematch_restaurants_cache_v2';

export const dishService = {
  /**
   * Initializes local demo storage if not already present
   */
  initDemoStorage() {
    try {
      if (!localStorage.getItem(STORAGE_KEY_DISHES)) {
        localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(DEMO_DISHES));
      }
      if (!localStorage.getItem(STORAGE_KEY_RESTS)) {
        localStorage.setItem(STORAGE_KEY_RESTS, JSON.stringify(DEMO_RESTAURANTS));
      }
    } catch (e) {
      console.warn('Storage init failed:', e);
    }
  },

  /**
   * Resets local demo data to initial pristine state
   */
  resetDemoData() {
    try {
      localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(DEMO_DISHES));
      localStorage.setItem(STORAGE_KEY_RESTS, JSON.stringify(DEMO_RESTAURANTS));
      window.dispatchEvent(new CustomEvent('platematch_data_updated'));
      return true;
    } catch (e) {
      console.error('Failed to reset demo data', e);
      return false;
    }
  },

  /**
   * Fetches dishes, applying hyperlocal distance calculation and filters
   */
  async getDishes(options = {}) {
    const {
      userLocation,
      maxDistance = 500,
      maxPrice = null,
      category = 'Todos',
      availableOnly = true,
      sortBy = 'proximity',
    } = options;

    let dishes = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select(`
            id,
            title,
            description,
            price,
            stock_available,
            image_url,
            category,
            is_available,
            tags,
            preparation_time_mins,
            restaurants (
              id,
              name,
              address,
              latitude,
              longitude,
              is_open,
              rating
            )
          `)
          .eq('is_available', true);

        if (error) throw error;

        dishes = (data || []).map((d) => ({
          id: d.id,
          restaurant_id: d.restaurants?.id,
          restaurant_name: d.restaurants?.name || 'Restaurante Local',
          restaurant_address: d.restaurants?.address || '',
          restaurant_lat: d.restaurants?.latitude,
          restaurant_lng: d.restaurants?.longitude,
          title: d.title,
          description: d.description,
          price: Number(d.price),
          stock_available: d.stock_available,
          image_url: d.image_url,
          category: d.category,
          is_available: d.is_available,
          tags: d.tags || [],
          preparation_time_mins: d.preparation_time_mins || 8,
        }));
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local demo storage:', err.message);
        dishes = this._getLocalDishes();
      }
    } else {
      dishes = this._getLocalDishes();
    }

    const enrichedDishes = dishes.map((dish) => {
      let distanceMeters = null;
      let walkingMinutes = null;

      if (userLocation?.latitude && userLocation?.longitude && dish.restaurant_lat && dish.restaurant_lng) {
        distanceMeters = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          dish.restaurant_lat,
          dish.restaurant_lng
        );
        walkingMinutes = calculateWalkingTimeMinutes(distanceMeters);
      } else {
        distanceMeters = 280;
        walkingMinutes = 4;
      }

      return {
        ...dish,
        distanceMeters,
        walkingMinutes,
      };
    });

    let filtered = enrichedDishes.filter((dish) => {
      if (availableOnly && dish.stock_available <= 0) return false;
      if (maxDistance && dish.distanceMeters !== null && dish.distanceMeters > maxDistance) return false;
      if (maxPrice && dish.price > maxPrice) return false;
      if (category && category !== 'Todos' && dish.category !== category) return false;
      return true;
    });

    if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else {
      filtered.sort((a, b) => (a.distanceMeters || 9999) - (b.distanceMeters || 9999));
    }

    return filtered;
  },

  /**
   * Fetches restaurants with their associated dishes for "Match por Restaurante"
   * Uses Supabase when configured, falls back to local demo data.
   */
  async getRestaurants(options = {}) {
    const { userLocation, maxDistance = 500 } = options;

    let rawRestaurants = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            address,
            latitude,
            longitude,
            image_url,
            is_open,
            rating,
            review_count,
            distance_meters
          `)
          .eq('is_open', true);

        if (error) throw error;
        rawRestaurants = data || [];
      } catch (err) {
        console.warn('Supabase restaurants fetch failed, using local demo:', err.message);
        rawRestaurants = this._getLocalRestaurants();
      }
    } else {
      rawRestaurants = this._getLocalRestaurants();
    }

    // Also load dishes (all, to compute per-restaurant availability)
    const allDishes = await this.getDishes({ userLocation, maxDistance: 1000, availableOnly: false });

    return rawRestaurants
      .map((rest) => {
        let distanceMeters = null;
        let walkingMinutes = null;

        if (userLocation?.latitude && userLocation?.longitude && rest.latitude && rest.longitude) {
          distanceMeters = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            rest.latitude,
            rest.longitude
          );
          walkingMinutes = calculateWalkingTimeMinutes(distanceMeters);
        } else {
          distanceMeters = rest.distance_meters || 300;
          walkingMinutes = calculateWalkingTimeMinutes(distanceMeters);
        }

        const restDishes = allDishes.filter(
          (d) => d.restaurant_id === rest.id || d.restaurant_name === rest.name
        );
        const totalAvailablePortions = restDishes.reduce(
          (acc, d) => acc + (d.stock_available || 0),
          0
        );

        return {
          ...rest,
          distanceMeters,
          walkingMinutes,
          dishes: restDishes,
          totalAvailablePortions,
        };
      })
      .filter((r) => !maxDistance || (r.distanceMeters !== null && r.distanceMeters <= maxDistance));
  },

  /**
   * Get single dish by ID
   */
  async getDishById(id, userLocation = null) {
    const all = await this.getDishes({ userLocation, maxDistance: null, availableOnly: false });
    return all.find((d) => d.id === id) || null;
  },

  /**
   * Get all dishes belonging to a specific restaurant (e.g. Doña Rosa)
   * Used by the restaurant dashboard
   */
  async getDishesByRestaurant(restaurantId) {
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch dishes by restaurant error:', err);
      }
    }

    // Local demo storage fallback
    const allDishes = this._getLocalDishes();
    return allDishes.filter(
      (d) => d.restaurant_id === restaurantId || d.restaurant_id === 'rest-dona-rosa' || d.restaurant_name?.includes('Doña Rosa')
    );
  },

  /**
   * Adjust dish stock from the dashboard (+1, -1, or set value)
   * Broadcasts update to sync with Diner App immediately
   */
  async updateDishStock(dishId, restaurantId, value, isAbsolute = false) {
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        if (!isAbsolute) {
          const { data, error } = await supabase.rpc('update_dish_stock_atomic', {
            p_dish_id: dishId,
            p_restaurant_id: restaurantId,
            p_stock_delta: value,
          });
          if (error) throw error;
          return data;
        } else {
          const newStock = Math.max(0, parseInt(value, 10));
          const { data, error } = await supabase
            .from('dishes')
            .update({
              stock_available: newStock,
              is_available: newStock > 0,
            })
            .eq('id', dishId)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.warn('Supabase stock update error, falling back to local demo:', err);
      }
    }

    // Local Demo update
    const dishes = this._getLocalDishes();
    const index = dishes.findIndex((d) => d.id === dishId);
    if (index === -1) throw new Error('Plato no encontrado');

    let newStock = 0;
    if (isAbsolute) {
      newStock = Math.max(0, parseInt(value, 10));
    } else {
      newStock = Math.max(0, dishes[index].stock_available + value);
    }

    dishes[index].stock_available = newStock;
    dishes[index].is_available = newStock > 0;

    localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));
    window.dispatchEvent(new CustomEvent('platematch_data_updated', { detail: dishes[index] }));
    return dishes[index];
  },

  /**
   * Decrements dish stock in demo storage atomically (from diner checkout)
   */
  decrementDemoStock(dishId, quantity = 1) {
    try {
      const dishes = this._getLocalDishes();
      const index = dishes.findIndex((d) => d.id === dishId);
      if (index === -1) return false;

      if (dishes[index].stock_available < quantity) {
        throw new Error('Stock insuficiente');
      }

      dishes[index].stock_available -= quantity;
      if (dishes[index].stock_available <= 0) {
        dishes[index].is_available = false;
      }

      localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));
      window.dispatchEvent(new CustomEvent('platematch_data_updated', { detail: dishes[index] }));
      return dishes[index];
    } catch (e) {
      console.error('Error decrementing stock:', e);
      throw e;
    }
  },

  /**
   * Retrieves restaurant profile (e.g. Doña Rosa)
   */
  async getRestaurantProfile(restaurantId = 'rest-dona-rosa') {
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase restaurant fetch error:', err);
      }
    }

    const rests = this._getLocalRestaurants();
    return rests.find((r) => r.id === restaurantId || r.name?.includes('Doña Rosa')) || rests[0];
  },

  /**
   * Updates restaurant profile info (name, hours, is_open, address)
   */
  async updateRestaurantProfile(restaurantId, updates) {
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .update(updates)
          .eq('id', restaurantId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase restaurant update error:', err);
      }
    }

    const rests = this._getLocalRestaurants();
    const idx = rests.findIndex((r) => r.id === restaurantId || r.name?.includes('Doña Rosa'));
    if (idx !== -1) {
      rests[idx] = { ...rests[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_RESTS, JSON.stringify(rests));
      window.dispatchEvent(new CustomEvent('platematch_restaurant_updated', { detail: rests[idx] }));
      return rests[idx];
    }
    return null;
  },

  _getLocalDishes() {
    this.initDemoStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_DISHES);
      return data ? JSON.parse(data) : DEMO_DISHES;
    } catch (e) {
      return DEMO_DISHES;
    }
  },

  _getLocalRestaurants() {
    this.initDemoStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY_RESTS);
      return data ? JSON.parse(data) : DEMO_RESTAURANTS;
    } catch (e) {
      return DEMO_RESTAURANTS;
    }
  },
};
