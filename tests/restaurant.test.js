import { describe, it, expect, beforeEach } from 'vitest';
import { reservationService } from '../src/services/reservationService';
import { dishService } from '../src/services/dishService';
import { audioService } from '../src/services/audioService';

// Mock localStorage and window for Node environment in tests
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

describe('Restaurant Dashboard Services (restaurant.test.js)', () => {
  beforeEach(() => {
    localStorage.clear();
    dishService.initDemoStorage();
    reservationService.initDemoStorage();
  });

  it('retrieves reservations for Doña Rosa', async () => {
    const list = await reservationService.getReservationsByRestaurant('rest-dona-rosa');
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('status');
    expect(list[0]).toHaveProperty('dish');
  });

  it('validates and completes a confirmed reservation with valid QR/code', async () => {
    const list = await reservationService.getReservationsByRestaurant('rest-dona-rosa');
    const confirmedRes = list.find((r) => r.status === 'confirmed');
    expect(confirmedRes).toBeDefined();

    const validated = await reservationService.validateAndCompleteReservation({
      qrOrCode: confirmedRes.reservationCode,
      restaurantId: 'rest-dona-rosa',
    });

    expect(validated.status).toBe('completed');
    expect(validated.completed_at).toBeDefined();
  });

  it('rejects double validation of an already completed reservation', async () => {
    const list = await reservationService.getReservationsByRestaurant('rest-dona-rosa');
    const completedRes = list.find((r) => r.status === 'completed');
    expect(completedRes).toBeDefined();

    await expect(
      reservationService.validateAndCompleteReservation({
        qrOrCode: completedRes.id,
        restaurantId: 'rest-dona-rosa',
      })
    ).rejects.toThrow('Esta reserva ya fue completada');
  });

  it('rejects validation if the reservation belongs to another restaurant', async () => {
    const allDishes = dishService._getLocalDishes();
    const otherDish = allDishes.find((d) => d.restaurant_id === 'rest-sazon-andino');

    const otherRes = await reservationService.createReservation({
      dish: otherDish,
      code: '888999',
    });

    // Try validating at Doña Rosa with other restaurant ID
    await expect(
      reservationService.validateAndCompleteReservation({
        qrOrCode: otherRes.reservationCode,
        restaurantId: 'rest-dona-rosa-other',
      })
    ).rejects.toThrow('Esta reserva pertenece a otro restaurante');
  });

  it('updates dish stock without going negative', async () => {
    const dishes = await dishService.getDishesByRestaurant('rest-dona-rosa');
    const dish = dishes[0];
    const initial = dish.stock_available;

    // +2 portions
    const increased = await dishService.updateDishStock(dish.id, 'rest-dona-rosa', 2);
    expect(increased.stock_available).toBe(initial + 2);

    // -100 portions (should floor at 0)
    const floored = await dishService.updateDishStock(dish.id, 'rest-dona-rosa', -100);
    expect(floored.stock_available).toBe(0);
    expect(floored.is_available).toBe(false);
  });

  it('manages audio service toggle state', () => {
    audioService.setSoundEnabled(false);
    expect(audioService.isSoundEnabled()).toBe(false);

    audioService.setSoundEnabled(true);
    expect(audioService.isSoundEnabled()).toBe(true);
  });
});
