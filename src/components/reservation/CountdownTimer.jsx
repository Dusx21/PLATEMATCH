import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function CountdownTimer({
  expiresAt,
  status = 'confirmed',
  onExpire,
  className = '',
}) {
  const {
    formattedTime,
    totalSeconds,
    progressRatio,
    isExpired,
    isWarning,
    isCritical,
    isFrozen,
  } = useCountdown(expiresAt, status, onExpire);

  // Circular SVG dimensions
  const size = 140;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Dynamic color transitions: Mint -> Mango -> Chili
  let ringColor = '#19C37D'; // Mint
  let textColor = 'text-mint';
  let badgeColor = 'bg-mint-surface text-mint-dark';

  if (status === 'completed') {
    ringColor = '#19C37D';
    textColor = 'text-mint';
    badgeColor = 'bg-mint-surface text-mint-dark';
  } else if (isExpired) {
    ringColor = '#FF5A3C'; // Chili
    textColor = 'text-chili';
    badgeColor = 'bg-chili-surface text-chili';
  } else if (isCritical) {
    ringColor = '#FF5A3C'; // Chili
    textColor = 'text-chili';
    badgeColor = 'bg-chili-surface text-chili animate-pulse';
  } else if (isWarning) {
    ringColor = '#FF9F1C'; // Mango
    textColor = 'text-mango-dark';
    badgeColor = 'bg-mango-surface text-mango-dark';
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* SVG Circular Progress Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFF3E4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: isFrozen && status === 'completed' ? 0 : strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          {status === 'completed' ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 size={32} className="text-mint mb-1" />
              <span className="font-outfit font-extrabold text-sm text-mint">
                ¡Servido!
              </span>
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center">
              <AlertTriangle size={28} className="text-chili mb-1" />
              <span className="font-outfit font-extrabold text-sm text-chili">
                Expirado
              </span>
            </div>
          ) : (
            <>
              <Clock size={16} className={`mb-1 ${textColor}`} />
              <span className={`font-outfit font-black text-2xl tracking-tight ${textColor}`}>
                {formattedTime}
              </span>
              <span className="text-[10px] font-sans font-semibold text-aubergine/50 uppercase tracking-wider">
                Tolerancia
              </span>
            </>
          )}
        </div>
      </div>

      {/* Warning Alert Banner below timer */}
      {!isExpired && isWarning && status !== 'completed' && (
        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-sans font-semibold flex items-center gap-1.5 ${badgeColor}`}>
          <AlertTriangle size={13} />
          <span>
            {isCritical
              ? '¡Menos de 1 minuto! Apresúrate al restaurante'
              : 'Quedan pocos minutos para que venza la tolerancia'}
          </span>
        </div>
      )}
    </div>
  );
}
