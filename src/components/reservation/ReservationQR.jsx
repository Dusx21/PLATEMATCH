import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';

export function ReservationQR({ reservation, className = '' }) {
  if (!reservation) return null;

  // Validation payload without leaking sensitive personal info
  const qrPayload = JSON.stringify({
    resId: reservation.id,
    code: reservation.reservationCode,
    dish: reservation.dish?.title,
    ts: reservation.created_at,
    v: 'v2',
  });

  return (
    <div className={`p-4 bg-white rounded-2xl border border-aubergine/10 shadow-sm flex flex-col items-center ${className}`}>
      {/* QR Code Container */}
      <div className="p-3 bg-cream-100 rounded-xl border border-aubergine/10 relative">
        <QRCodeSVG
          value={qrPayload}
          size={160}
          level="H"
          fgColor="#2A1455"
          bgColor="#FFF8F0"
          includeMargin={false}
        />
      </div>

      {/* Reservation Code */}
      <div className="mt-3 text-center">
        <span className="text-[10px] font-sans uppercase font-bold text-aubergine/50 tracking-wider block">
          Código de Reserva
        </span>
        <span className="font-outfit font-black text-lg text-aubergine tracking-wider">
          {reservation.reservationCode}
        </span>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-sans text-aubergine/60 mt-1">
        <ShieldCheck size={13} className="text-mint" />
        <span>Presenta este QR al llegar a la barra</span>
      </div>
    </div>
  );
}
