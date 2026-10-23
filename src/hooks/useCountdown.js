import { useState, useEffect, useRef } from 'react';

/**
 * Robust countdown timer hook calculated from a persistent timestamp
 * Survives page reloads, tab backgrounding and network changes
 *
 * @param {string|Date} expiresAt - Expiration ISO string or Date
 * @param {string} [status='confirmed'] - Current reservation status
 * @param {Function} [onExpire] - Callback invoked when timer hits zero
 * @param {number} [totalDurationSec=900] - Total countdown duration in seconds (15 min = 900s)
 */
export function useCountdown(expiresAt, status = 'confirmed', onExpire = null, totalDurationSec = 900) {
  const calculateRemaining = () => {
    if (!expiresAt) return { totalSeconds: 0, minutes: 0, seconds: 0, progressRatio: 0, isExpired: false };
    const target = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((target - now) / 1000));

    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    const isExpired = diffSeconds <= 0;
    const progressRatio = Math.min(1, Math.max(0, diffSeconds / totalDurationSec));

    return {
      totalSeconds: diffSeconds,
      minutes,
      seconds,
      progressRatio,
      isExpired,
    };
  };

  const [state, setState] = useState(calculateRemaining);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    // If reservation is already completed or cancelled, freeze timer
    if (status === 'completed' || status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      const current = calculateRemaining();
      setState(current);

      if (current.isExpired) {
        clearInterval(interval);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status, totalDurationSec]);

  const formattedTime = `${String(state.minutes).padStart(2, '0')}:${String(state.seconds).padStart(2, '0')}`;
  const isWarning = state.totalSeconds <= 180 && !state.isExpired; // < 3 mins
  const isCritical = state.totalSeconds <= 60 && !state.isExpired; // < 1 min

  return {
    ...state,
    formattedTime,
    isWarning,
    isCritical,
    isFrozen: status === 'completed' || status === 'cancelled',
  };
}
