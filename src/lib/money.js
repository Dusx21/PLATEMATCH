/**
 * Safe decimal money utilities for platematch Brand v2
 * Currency: Peruvian Soles (S/)
 */

/**
 * Format a number to Peruvian Soles string e.g. "S/ 14.00"
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return 'S/ 0.00';
  return `S/ ${num.toFixed(2)}`;
}

/**
 * Safe rounding to 2 decimal places to prevent floating-point artifacts
 * @param {number} value
 * @returns {number}
 */
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate accurate reservation breakdown:
 * - 50% advance
 * - S/ 0.50 platform service fee
 * - 50% remaining balance to be paid on-site at the restaurant
 *
 * @param {number} unitPrice - Dish unit price
 * @param {number} quantity - Quantity of portions (default 1)
 * @param {number} advancePercent - e.g. 50%
 * @param {number} serviceFee - Platform fee (default S/ 0.50)
 * @returns {Object}
 */
export function calculateReservationBreakdown(
  unitPrice,
  quantity = 1,
  advancePercent = 50,
  serviceFee = 0.50
) {
  const cleanPrice = Math.max(0, Number(unitPrice) || 0);
  const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);
  const cleanFee = Math.max(0, Number(serviceFee) || 0);

  const totalPrice = round2(cleanPrice * cleanQty);
  const advanceAmount = round2(totalPrice * (advancePercent / 100));
  const remainingAmount = round2(totalPrice - advanceAmount);
  const totalInitialPayment = round2(advanceAmount + cleanFee);

  return {
    unitPrice: round2(cleanPrice),
    quantity: cleanQty,
    totalPrice,
    advanceAmount,
    serviceFee: round2(cleanFee),
    remainingAmount,
    totalInitialPayment,
  };
}
