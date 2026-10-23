import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculateReservationBreakdown } from '../../lib/money';
import { cleanSixDigitCode, isValidSixDigitCode } from '../../lib/validators';
import { ShieldCheck, Smartphone, AlertCircle, Info, Sparkles, Check } from 'lucide-react';

export function CheckoutModal({
  isOpen,
  onClose,
  dish,
  onConfirmReservation,
}) {
  if (!dish) return null;

  const [paymentMode, setPaymentMode] = useState('yape_demo'); // 'yape_demo' | 'plin_demo'
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [userName, setUserName] = useState('Comensal ExpoAndina');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const inputRefs = useRef([]);

  const breakdown = calculateReservationBreakdown(dish.price, 1);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setIsProcessing(false);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);
    }
  }, [isOpen]);

  const handleDigitChange = (index, value) => {
    setErrorMessage(null);
    const cleaned = cleanSixDigitCode(value);

    // If pasted multiple digits
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || '';
      }
      setDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      if (inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance to next input
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const fullCode = digits.join('');
  const isCodeValid = isValidSixDigitCode(fullCode);

  const handleFillDemoCode = () => {
    setDigits(['7', '4', '1', '8', '5', '2']);
    setErrorMessage(null);
    if (inputRefs.current[5]) inputRefs.current[5].focus();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!isCodeValid) {
      setErrorMessage('Ingresa un código de aprobación válido de exactamente 6 dígitos.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate payment processing latency (800ms)
      await new Promise((r) => setTimeout(r, 800));

      await onConfirmReservation({
        dish,
        quantity: 1,
        userName: userName.trim() || 'Comensal ExpoAndina',
        paymentMode,
        code: fullCode,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error al procesar la reserva. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout Express"
      subtitle="Asegura tu porción mediante adelanto simulado"
      className="max-w-md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* MVP Simulation Banner */}
        <div className="p-3 bg-cream-200 border border-aubergine/10 rounded-2xl flex items-start gap-2.5 text-xs">
          <Info size={16} className="text-chili shrink-0 mt-0.5" />
          <p className="text-aubergine/80 font-sans leading-snug">
            <strong className="font-semibold text-aubergine">Modo Demostración ExpoAndina:</strong>{' '}
            No se realizarán cobros reales a tu cuenta bancaria. Ingresa cualquier código de 6 dígitos para simular la confirmación de Yape o Plin.
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-white rounded-2xl border border-aubergine/10 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-aubergine/8">
            <div className="min-w-0 pr-2">
              <h4 className="font-outfit font-extrabold text-sm text-aubergine truncate">
                {dish.title}
              </h4>
              <p className="text-xs text-aubergine/60 font-sans truncate">
                {dish.restaurant_name}
              </p>
            </div>
            <span className="font-outfit font-bold text-sm text-aubergine shrink-0">
              {formatCurrency(breakdown.totalPrice)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-aubergine/70">
              <span>Adelanto de garantía (50%)</span>
              <span className="font-semibold text-aubergine">
                {formatCurrency(breakdown.advanceAmount)}
              </span>
            </div>
            <div className="flex justify-between text-aubergine/70">
              <span>Comisión de servicio platematch</span>
              <span className="font-semibold text-aubergine">
                {formatCurrency(breakdown.serviceFee)}
              </span>
            </div>
            <div className="flex justify-between text-aubergine/70">
              <span>Saldo a pagar en el restaurante</span>
              <span className="font-semibold text-aubergine">
                {formatCurrency(breakdown.remainingAmount)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-aubergine/10 flex items-center justify-between">
            <span className="font-outfit font-extrabold text-sm text-aubergine">
              Pago Inicial Simulado
            </span>
            <span className="font-outfit font-extrabold text-xl text-chili">
              {formatCurrency(breakdown.totalInitialPayment)}
            </span>
          </div>
        </div>

        {/* User Name input */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-1">
            Nombre para la Comanda
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Tu nombre o alias"
            className="w-full px-3.5 py-2.5 text-xs font-sans rounded-xl border border-aubergine/20 focus:outline-none focus:ring-2 focus:ring-chili focus:border-transparent bg-white"
            maxLength={40}
          />
        </div>

        {/* Payment mode selector: Yape vs Plin */}
        <div>
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70 block mb-1.5">
            Método de Pago Simulado
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'yape_demo', name: 'Yape (Demo)', color: 'border-purple-600 bg-purple-50 text-purple-900' },
              { id: 'plin_demo', name: 'Plin (Demo)', color: 'border-sky-600 bg-sky-50 text-sky-900' },
            ].map((method) => {
              const isSelected = paymentMode === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMode(method.id)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-outfit font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? method.color + ' shadow-sm'
                      : 'border-aubergine/10 bg-white text-aubergine/70 hover:bg-cream-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone size={14} />
                    {method.name}
                  </span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6-Digit Code Input Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70">
              Código de Aprobación (6 dígitos)
            </label>
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="text-[11px] font-sans font-medium text-chili hover:underline flex items-center gap-1"
            >
              <Sparkles size={11} />
              Autocompletar demo
            </button>
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-between gap-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isProcessing}
                className="w-12 h-13 text-center text-xl font-outfit font-extrabold rounded-xl border-2 border-aubergine/20 focus:border-chili focus:ring-2 focus:ring-chili/20 focus:outline-none bg-white transition-all disabled:opacity-50"
                aria-label={`Dígito ${idx + 1}`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-chili mt-2 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isProcessing}
            disabled={!isCodeValid || isProcessing}
            icon={<ShieldCheck size={18} />}
            className="w-full h-13 text-base"
          >
            Confirmar Reserva Simula ({formatCurrency(breakdown.totalInitialPayment)})
          </Button>
          <p className="text-[10px] text-center text-aubergine/50 mt-2 font-sans">
            Garantía de porción por 15 minutos en el restaurante.
          </p>
        </div>
      </form>
    </Modal>
  );
}
