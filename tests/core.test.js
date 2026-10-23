import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateReservationBreakdown, round2 } from '../src/lib/money';
import { haversineDistance, calculateWalkingTimeMinutes, formatDistanceAndWalk } from '../src/lib/geo';
import { isValidSixDigitCode, cleanSixDigitCode, isValidReservationStatus } from '../src/lib/validators';

describe('Money calculations (money.js)', () => {
  it('formats Peruvian Soles correctly', () => {
    expect(formatCurrency(14)).toBe('S/ 14.00');
    expect(formatCurrency(14.5)).toBe('S/ 14.50');
    expect(formatCurrency('16.90')).toBe('S/ 16.90');
    expect(formatCurrency(0)).toBe('S/ 0.00');
  });

  it('calculates 50% advance and S/ 0.50 fee breakdown without float drift', () => {
    // S/ 14.00 dish:
    // advance: S/ 7.00
    // fee: S/ 0.50
    // total initial payment: S/ 7.50
    // remaining on site: S/ 7.00
    const result = calculateReservationBreakdown(14.00);
    expect(result.totalPrice).toBe(14.00);
    expect(result.advanceAmount).toBe(7.00);
    expect(result.serviceFee).toBe(0.50);
    expect(result.totalInitialPayment).toBe(7.50);
    expect(result.remainingAmount).toBe(7.00);
    expect(result.advanceAmount + result.remainingAmount).toBe(result.totalPrice);
  });

  it('handles odd prices correctly', () => {
    // S/ 13.50 dish:
    // advance 50%: 6.75
    // remaining: 6.75
    // initial payment: 6.75 + 0.50 = 7.25
    const result = calculateReservationBreakdown(13.50);
    expect(result.totalPrice).toBe(13.50);
    expect(result.advanceAmount).toBe(6.75);
    expect(result.remainingAmount).toBe(6.75);
    expect(result.totalInitialPayment).toBe(7.25);
  });
});

describe('Geographical calculations (geo.js)', () => {
  it('calculates Haversine distance between UAC Larapa and Doña Rosa in meters', () => {
    // Larapa ~ -13.5280, -71.9048 to -13.5284, -71.9056
    const dist = haversineDistance(-13.5280, -71.9048, -13.5284, -71.9056);
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(200);
  });

  it('calculates walking time estimate correctly', () => {
    // 240 meters / 80 m/min = 3 minutes
    expect(calculateWalkingTimeMinutes(240)).toBe(3);
    // 50 meters -> minimum 1 minute
    expect(calculateWalkingTimeMinutes(50)).toBe(1);
    // 800 meters -> 10 minutes
    expect(calculateWalkingTimeMinutes(800)).toBe(10);
  });

  it('formats distance and walk text', () => {
    const formatted = formatDistanceAndWalk(280);
    expect(formatted.distanceText).toBe('280 m');
    expect(formatted.walkText).toBe('4 min a pie');
    expect(formatted.fullText).toBe('280 m · 4 min a pie');
  });
});

describe('Input validators (validators.js)', () => {
  it('validates 6-digit codes correctly', () => {
    expect(isValidSixDigitCode('123456')).toBe(true);
    expect(isValidSixDigitCode('000000')).toBe(true);
    expect(isValidSixDigitCode('12345')).toBe(false);
    expect(isValidSixDigitCode('1234567')).toBe(false);
    expect(isValidSixDigitCode('12345a')).toBe(false);
    expect(isValidSixDigitCode('')).toBe(false);
  });

  it('cleans numeric code properly', () => {
    expect(cleanSixDigitCode('12-34-56')).toBe('123456');
    expect(cleanSixDigitCode('abc 987654321')).toBe('987654');
  });

  it('validates reservation statuses', () => {
    expect(isValidReservationStatus('confirmed')).toBe(true);
    expect(isValidReservationStatus('pending')).toBe(true);
    expect(isValidReservationStatus('completed')).toBe(true);
    expect(isValidReservationStatus('unknown_status')).toBe(false);
  });
});
