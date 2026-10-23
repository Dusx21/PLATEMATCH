import { supabase, isSupabaseConfigured } from './supabase';
import { dishService } from './dishService';
import { calculateReservationBreakdown } from '../lib/money';
import { audioService } from './audioService';

const STORAGE_KEY_RESERVATIONS = 'platematch_reservations_v2';

// Seed initial realistic reservations for Doña Rosa demo dashboard
const INITIAL_DEMO_RESERVATIONS = [
  {
    id: 'demo-res-001',
    reservationCode: 'PM-CUS-1042',
    dish_id: 'dish-lomo-saltado',
    restaurant_id: 'rest-dona-rosa',
    dish: {
      title: 'Lomo Saltado al Wok Tradicional',
      price: 16.00,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      restaurant_name: 'Picantería Doña Rosa',
      restaurant_address: 'Av. La Cultura 1420 (frente a UAC)',
      restaurant_lat: -13.5284,
      restaurant_lng: -71.9056,
    },
    user_name: 'Carlos Mendoza (UAC)',
    quantity: 1,
    unitPrice: 16.00,
    totalPrice: 16.00,
    advanceAmount: 8.00,
    serviceFee: 0.50,
    remainingAmount: 8.00,
    totalInitialPayment: 8.50,
    payment_mode: 'yape_demo',
    status: 'completed',
    verification_code: '741852',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    is_demo: true,
  },
  {
    id: 'demo-res-002',
    reservationCode: 'PM-CUS-2089',
    dish_id: 'dish-menu-ejecutivo',
    restaurant_id: 'rest-dona-rosa',
    dish: {
      title: 'Menú Ejecutivo Doña Rosa',
      price: 12.00,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      restaurant_name: 'Picantería Doña Rosa',
      restaurant_address: 'Av. La Cultura 1420 (frente a UAC)',
      restaurant_lat: -13.5284,
      restaurant_lng: -71.9056,
    },
    user_name: 'Valeria Quispe (Docente UAC)',
    quantity: 2,
    unitPrice: 12.00,
    totalPrice: 24.00,
    advanceAmount: 12.00,
    serviceFee: 0.50,
    remainingAmount: 12.00,
    totalInitialPayment: 12.50,
    payment_mode: 'plin_demo',
    status: 'completed',
    verification_code: '963258',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    is_demo: true,
  },
  {
    id: 'demo-res-003',
    reservationCode: 'PM-CUS-3156',
    dish_id: 'dish-rocoto-relleno',
    restaurant_id: 'rest-dona-rosa',
    dish: {
      title: 'Rocoto Relleno Cusqueño',
      price: 17.00,
      image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
      restaurant_name: 'Picantería Doña Rosa',
      restaurant_address: 'Av. La Cultura 1420 (frente a UAC)',
      restaurant_lat: -13.5284,
      restaurant_lng: -71.9056,
    },
    user_name: 'Ing. Rodrigo Huamán',
    quantity: 1,
    unitPrice: 17.00,
    totalPrice: 17.00,
    advanceAmount: 8.50,
    serviceFee: 0.50,
    remainingAmount: 8.50,
    totalInitialPayment: 9.00,
    payment_mode: 'yape_demo',
    status: 'confirmed',
    verification_code: '357159',
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 11 * 60 * 1000).toISOString(),
    completed_at: null,
    is_demo: true,
  },
];

export const reservationService = {
  /**
   * Initializes local demo reservations
   */
  initDemoStorage() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY_RESERVATIONS);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(INITIAL_DEMO_RESERVATIONS));
      }
    } catch (e) {
      console.warn('Storage init failed for reservations:', e);
    }
  },

  /**
   * Creates a new express reservation with 50% advance and 15-min tolerance
   */
  async createReservation({
    dish,
    quantity = 1,
    userName = 'Comensal ExpoAndina',
    paymentMode = 'yape_demo',
    code,
  }) {
    if (!dish) throw new Error('Información de plato requerida');
    if (!code || code.length !== 6) throw new Error('Código de 6 dígitos inválido');

    const breakdown = calculateReservationBreakdown(dish.price, quantity);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins exact tolerance

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reservationCode = `PM-CUS-${randomSuffix}`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_reservation_atomic', {
          p_dish_id: dish.id,
          p_user_name: userName,
          p_quantity: quantity,
          p_payment_mode: paymentMode,
          p_verification_code: code,
        });

        if (error) throw error;

        const newRes = {
          id: data.id,
          reservationCode,
          dish_id: dish.id,
          restaurant_id: dish.restaurant_id || 'rest-dona-rosa',
          dish: {
            title: dish.title,
            price: dish.price,
            image_url: dish.image_url,
            restaurant_name: dish.restaurant_name,
            restaurant_address: dish.restaurant_address,
            restaurant_lat: dish.restaurant_lat,
            restaurant_lng: dish.restaurant_lng,
          },
          user_name: userName,
          quantity,
          ...breakdown,
          payment_mode: paymentMode,
          status: 'confirmed',
          verification_code: code,
          created_at: data.created_at || now.toISOString(),
          expires_at: data.expires_at || expiresAt.toISOString(),
          is_demo: false,
        };

        this._saveToLocalCache(newRes);
        window.dispatchEvent(new CustomEvent('platematch_reservation_created', { detail: newRes }));
        return newRes;
      } catch (err) {
        console.warn('Supabase atomic reservation failed, using fallback demo mode:', err.message);
      }
    }

    // Fallback: Local Demo Mode
    dishService.decrementDemoStock(dish.id, quantity);

    const reservation = {
      id: `demo-${Date.now()}-${randomSuffix}`,
      reservationCode,
      dish_id: dish.id,
      restaurant_id: dish.restaurant_id || 'rest-dona-rosa',
      dish: {
        title: dish.title,
        price: dish.price,
        image_url: dish.image_url,
        restaurant_name: dish.restaurant_name,
        restaurant_address: dish.restaurant_address,
        restaurant_lat: dish.restaurant_lat,
        restaurant_lng: dish.restaurant_lng,
      },
      user_name: userName,
      quantity,
      ...breakdown,
      payment_mode: paymentMode,
      status: 'confirmed',
      verification_code: code,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      is_demo: true,
    };

    this._saveToLocalCache(reservation);
    window.dispatchEvent(new CustomEvent('platematch_reservation_created', { detail: reservation }));
    window.dispatchEvent(new CustomEvent('platematch_reservation_updated', { detail: reservation }));

    return reservation;
  },

  /**
   * Fetches reservation by its unique identifier or reservationCode
   */
  async getReservationById(id) {
    if (!id) return null;

    if (isSupabaseConfigured() && !id.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            dishes (
              id,
              title,
              price,
              image_url,
              restaurant_id,
              restaurants (
                id,
                name,
                address,
                latitude,
                longitude
              )
            )
          `)
          .or(`id.eq.${id},verification_code.eq.${id}`)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            reservationCode: `PM-CUS-${data.id.slice(0, 4).toUpperCase()}`,
            dish_id: data.dish_id,
            restaurant_id: data.dishes?.restaurant_id,
            dish: {
              title: data.dishes?.title,
              price: data.dishes?.price,
              image_url: data.dishes?.image_url,
              restaurant_name: data.dishes?.restaurants?.name,
              restaurant_address: data.dishes?.restaurants?.address,
              restaurant_lat: data.dishes?.restaurants?.latitude,
              restaurant_lng: data.dishes?.restaurants?.longitude,
            },
            user_name: data.user_name,
            quantity: data.quantity,
            totalPrice: Number(data.dish_price) * data.quantity,
            advanceAmount: Number(data.advance_amount),
            serviceFee: Number(data.service_fee),
            remainingAmount: Number(data.remaining_amount),
            totalInitialPayment: Number(data.advance_amount) + Number(data.service_fee),
            payment_mode: data.payment_mode,
            status: data.status,
            verification_code: data.verification_code,
            created_at: data.created_at,
            expires_at: data.expires_at,
            completed_at: data.completed_at,
            is_demo: false,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch failed for reservation, checking local:', err);
      }
    }

    const cached = this._getLocalReservations();
    const cleanId = String(id).trim().toUpperCase();
    return (
      cached.find(
        (r) =>
          r.id === id ||
          r.reservationCode?.toUpperCase() === cleanId ||
          r.verification_code === id
      ) || null
    );
  },

  /**
   * Retrieves all reservations belonging to a restaurant (e.g. Doña Rosa)
   */
  async getReservationsByRestaurant(restaurantId = 'rest-dona-rosa') {
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            dishes!inner (
              id,
              title,
              price,
              image_url,
              restaurant_id,
              restaurants (
                id,
                name,
                address
              )
            )
          `)
          .eq('dishes.restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            reservationCode: `PM-CUS-${d.id.slice(0, 4).toUpperCase()}`,
            dish_id: d.dish_id,
            restaurant_id: d.dishes?.restaurant_id,
            dish: {
              title: d.dishes?.title,
              price: d.dishes?.price,
              image_url: d.dishes?.image_url,
              restaurant_name: d.dishes?.restaurants?.name,
              restaurant_address: d.dishes?.restaurants?.address,
            },
            user_name: d.user_name,
            quantity: d.quantity,
            totalPrice: Number(d.dish_price) * d.quantity,
            advanceAmount: Number(d.advance_amount),
            serviceFee: Number(d.service_fee),
            remainingAmount: Number(d.remaining_amount),
            totalInitialPayment: Number(d.advance_amount) + Number(d.service_fee),
            payment_mode: d.payment_mode,
            status: d.status,
            verification_code: d.verification_code,
            created_at: d.created_at,
            expires_at: d.expires_at,
            completed_at: d.completed_at,
            is_demo: false,
          }));
        }
      } catch (err) {
        console.warn('Supabase getReservationsByRestaurant error, using local:', err);
      }
    }

    const all = this._getLocalReservations();
    return all
      .filter(
        (r) =>
          r.restaurant_id === restaurantId ||
          r.dish?.restaurant_id === restaurantId ||
          r.restaurant_id === 'rest-dona-rosa' ||
          r.dish?.restaurant_name?.includes('Doña Rosa')
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Validates and completes a reservation from QR Scanner or Manual Entry
   * Strictly enforces restaurant ownership and state transition rules
   */
  async validateAndCompleteReservation({ qrOrCode, restaurantId = 'rest-dona-rosa' }) {
    if (!qrOrCode) throw new Error('Código o QR no proporcionado');

    // Parse payload if JSON
    let lookupKey = String(qrOrCode).trim();
    try {
      if (lookupKey.startsWith('{') && lookupKey.endsWith('}')) {
        const parsed = JSON.parse(lookupKey);
        lookupKey = parsed.resId || parsed.code || lookupKey;
      }
    } catch (e) {
      // not json, use as is
    }

    // Supabase Mode
    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        const { data, error } = await supabase.rpc('validate_and_complete_reservation_atomic', {
          p_reservation_id: lookupKey,
          p_restaurant_id: restaurantId,
        });
        if (error) throw error;
        audioService.playSuccessChime();
        return data;
      } catch (err) {
        console.warn('Supabase validation error:', err);
        throw new Error(err.message || 'Error en la validación de Supabase');
      }
    }

    // Local Demo Validation
    const res = await this.getReservationById(lookupKey);
    if (!res) {
      throw new Error(`Reserva no encontrada con el código o QR "${lookupKey}".`);
    }

    // 1. Ownership check: Must belong to this restaurant
    const isOwner =
      res.restaurant_id === restaurantId ||
      res.dish?.restaurant_id === restaurantId ||
      restaurantId === 'rest-dona-rosa';

    if (!isOwner) {
      throw new Error('Esta reserva pertenece a otro restaurante y no puede ser validada aquí.');
    }

    // 2. Status checks
    if (res.status === 'completed') {
      throw new Error('Esta reserva ya fue completada y entregada previamente.');
    }

    if (res.status === 'cancelled') {
      throw new Error('Esta reserva fue cancelada.');
    }

    if (res.status === 'expired') {
      throw new Error('El tiempo de tolerancia (15 min) ha expirado.');
    }

    // 3. Expiration time check
    const expiresAtMs = new Date(res.expires_at).getTime();
    if (Date.now() > expiresAtMs) {
      res.status = 'expired';
      this._saveToLocalCache(res);
      window.dispatchEvent(new CustomEvent('platematch_reservation_updated', { detail: res }));
      throw new Error('El tiempo de tolerancia (15 min) ha expirado.');
    }

    // 4. Mark completed
    const updated = {
      ...res,
      status: 'completed',
      completed_at: new Date().toISOString(),
    };

    this._saveToLocalCache(updated);
    audioService.playSuccessChime();
    window.dispatchEvent(new CustomEvent('platematch_reservation_updated', { detail: updated }));
    return updated;
  },

  /**
   * Alias for backward compatibility with active diner ticket simulation
   */
  async completeReservation(id) {
    return this.validateAndCompleteReservation({ qrOrCode: id, restaurantId: 'rest-dona-rosa' });
  },

  /**
   * Realtime subscription for restaurant dashboard
   * Listens to incoming orders from comensales and state transitions
   */
  subscribeToRestaurantReservations(restaurantId, onNewOrder, onOrderUpdated) {
    let supabaseChannel = null;

    if (isSupabaseConfigured() && !restaurantId.startsWith('rest-')) {
      try {
        supabaseChannel = supabase
          .channel(`restaurant-orders-${restaurantId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'reservations',
            },
            (payload) => {
              if (payload.new && onNewOrder) {
                onNewOrder(payload.new);
                audioService.playNewOrderChime();
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'reservations',
            },
            (payload) => {
              if (payload.new && onOrderUpdated) {
                onOrderUpdated(payload.new);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription failed:', e);
      }
    }

    // Local custom event listener for Demo Mode (same-tab)
    const handleLocalCreate = (e) => {
      if (e.detail && onNewOrder) {
        onNewOrder(e.detail);
        audioService.playNewOrderChime();
      }
    };

    const handleLocalUpdate = (e) => {
      if (e.detail && onOrderUpdated) {
        onOrderUpdated(e.detail);
      }
    };

    // Cross-tab storage event listener (for when Diner App runs in another browser window/tab!)
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_RESERVATIONS && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (list && list.length > 0) {
            const newest = list[0];
            if (newest && onOrderUpdated) {
              onOrderUpdated(newest);
            }
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('platematch_reservation_created', handleLocalCreate);
    window.addEventListener('platematch_reservation_updated', handleLocalUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
      window.removeEventListener('platematch_reservation_created', handleLocalCreate);
      window.removeEventListener('platematch_reservation_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  },

  /**
   * Realtime subscription for a single reservation (used by Diner ActiveTicket)
   */
  subscribeToReservation(id, onUpdate) {
    let supabaseChannel = null;

    if (isSupabaseConfigured() && !id.startsWith('demo-')) {
      try {
        supabaseChannel = supabase
          .channel(`reservation-${id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'reservations',
              filter: `id=eq.${id}`,
            },
            (payload) => {
              if (payload.new) {
                onUpdate(payload.new);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Supabase realtime subscription failed:', e);
      }
    }

    const handleLocalUpdate = (event) => {
      if (event.detail && (event.detail.id === id || event.detail.reservationCode === id)) {
        onUpdate(event.detail);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_RESERVATIONS && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          const found = list.find((r) => r.id === id || r.reservationCode === id);
          if (found) onUpdate(found);
        } catch (err) {}
      }
    };

    window.addEventListener('platematch_reservation_updated', handleLocalUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
      window.removeEventListener('platematch_reservation_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  },

  _saveToLocalCache(reservation) {
    try {
      this.initDemoStorage();
      const list = this._getLocalReservations();
      const existingIdx = list.findIndex((r) => r.id === reservation.id);
      if (existingIdx >= 0) {
        list[existingIdx] = reservation;
      } else {
        list.unshift(reservation);
      }
      localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save reservation to local cache:', e);
    }
  },

  _getLocalReservations() {
    this.initDemoStorage();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESERVATIONS);
      return raw ? JSON.parse(raw) : INITIAL_DEMO_RESERVATIONS;
    } catch (e) {
      return INITIAL_DEMO_RESERVATIONS;
    }
  },

  getAllReservations() {
    return this._getLocalReservations();
  },
};
