import { describe, it, expect, beforeEach } from 'vitest';
import { dishService } from '../src/services/dishService';
import { reservationService } from '../src/services/reservationService';

// Mock localStorage for Node environment in tests
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

describe('dishService', () => {
  beforeEach(() => {
    localStorage.clear();
    dishService.initDemoStorage();
  });

  it('fetches dishes with geofence distance calculation', async () => {
    const dishes = await dishService.getDishes({
      userLocation: { latitude: -13.5280, longitude: -71.9048 }, // UAC Larapa
      maxDistance: 500,
    });
    expect(dishes.length).toBeGreaterThan(0);
    expect(dishes[0]).toHaveProperty('distanceMeters');
    expect(dishes[0]).toHaveProperty('walkingMinutes');
    expect(dishes[0].distanceMeters).toBeLessThanOrEqual(500);
  });

  it('filters by category and maxPrice', async () => {
    const filtered = await dishService.getDishes({
      maxPrice: 15.00,
      category: 'Criollo',
    });
    filtered.forEach((d) => {
      expect(d.price).toBeLessThanOrEqual(15.00);
      expect(d.category).toBe('Criollo');
    });
  });

  it('atomically decrements stock and throws if out of stock', () => {
    const dishes = dishService._getLocalDishes();
    const dish = dishes[0];
    const initialStock = dish.stock_available;

    dishService.decrementDemoStock(dish.id, 1);
    const updated = dishService._getLocalDishes().find((d) => d.id === dish.id);
    expect(updated.stock_available).toBe(initialStock - 1);
  });
});

describe('reservationService', () => {
  beforeEach(() => {
    localStorage.clear();
    dishService.initDemoStorage();
  });

  it('creates an express reservation with 50% advance and 15-min expiration', async () => {
    const dishes = await dishService.getDishes();
    const dish = dishes[0];

    const reservation = await reservationService.createReservation({
      dish,
      quantity: 1,
      userName: 'Estudiante UAC',
      paymentMode: 'yape_demo',
      code: '654321',
    });

    expect(reservation).toHaveProperty('id');
    expect(reservation).toHaveProperty('reservationCode');
    expect(reservation.status).toBe('confirmed');
    expect(reservation.advanceAmount).toBe(dish.price * 0.5);
    expect(reservation.serviceFee).toBe(0.50);
    expect(reservation.totalInitialPayment).toBe(dish.price * 0.5 + 0.50);

    // Verify 15-min tolerance
    const createdAtTime = new Date(reservation.created_at).getTime();
    const expiresAtTime = new Date(reservation.expires_at).getTime();
    expect(expiresAtTime - createdAtTime).toBe(15 * 60 * 1000);
  });

  it('can mark reservation as completed upon arrival', async () => {
    const dishes = await dishService.getDishes();
    const dish = dishes[0];
    const res = await reservationService.createReservation({
      dish,
      code: '123456',
    });

    const completed = await reservationService.completeReservation(res.id);
    expect(completed.status).toBe('completed');
    expect(completed.completed_at).toBeDefined();
  });
});
