import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function AnimatedCounter({
  value = 0,
  duration = 0.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const startValue = Number(displayValue) || 0;
    const endValue = Number(value) || 0;
    if (startValue === endValue) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    let animationFrameId;

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, shouldReduceMotion]);

  const formatted = decimals > 0 ? Number(displayValue).toFixed(decimals) : Math.round(displayValue);

  return (
    <span className={`inline-block tabular-nums font-outfit ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
