/**
 * Input validators and santizers for platematch Brand v2
 */

/**
 * Validates a 6-digit verification code for simulated Yape/Plin payments
 * @param {string} code
 * @returns {boolean}
 */
export function isValidSixDigitCode(code) {
  if (typeof code !== 'string') return false;
  return /^\d{6}$/.test(code.trim());
}

/**
 * Strips all non-digit characters and caps length to 6
 * @param {string} input
 * @returns {string}
 */
export function cleanSixDigitCode(input) {
  if (!input) return '';
  return String(input).replace(/\D/g, '').slice(0, 6);
}

/**
 * Validates reservation status
 * @param {string} status
 * @returns {boolean}
 */
export function isValidReservationStatus(status) {
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'expired'];
  return allowed.includes(status);
}

/**
 * Human readable status labels in Spanish
 */
export const RESERVATION_STATUS_MAP = {
  pending: {
    label: 'Pendiente de confirmación',
    badgeClass: 'bg-mango-surface text-mango-dark border-mango/20',
    description: 'Verificando con cocina...',
  },
  confirmed: {
    label: 'Mesa reservada · Comanda en cocina',
    badgeClass: 'bg-mint-surface text-mint-dark border-mint/20',
    description: '¡Tu plato te espera! Dirígete al local antes de que venza el tiempo.',
  },
  completed: {
    label: 'Servido y Completado',
    badgeClass: 'bg-aubergine-50 text-aubergine border-aubergine/20',
    description: 'Disfruta tu almuerzo. Gracias por usar platematch.',
  },
  expired: {
    label: 'Tiempo de tolerancia vencido',
    badgeClass: 'bg-chili-surface text-chili border-chili/20',
    description: 'La reserva ha expirado. Por favor genera una nueva.',
  },
  cancelled: {
    label: 'Reserva Cancelada',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    description: 'Esta reserva fue cancelada.',
  },
};
