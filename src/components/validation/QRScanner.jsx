import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, User, Utensils, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/money';
import { reservationService } from '../../services/reservationService';

export function QRScanner({
  onValidateReservation,
  isProcessing = false,
  confirmedOrders = [],
}) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  // Stop scanner when component unmounts
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    setScannerError(null);
    setErrorMessage(null);
    setValidationResult(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Pause/stop scanner on decode
          try {
            await html5QrCodeRef.current.stop();
            setIsScanning(false);
          } catch (e) {}

          handleProcessCode(decodedText);
        },
        (errorMessage) => {
          // ignore frame errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn('Error starting camera scanner:', err);
      setScannerError('No se pudo acceder a la cámara o se denegaron los permisos.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
    }
    setIsScanning(false);
  };

  const handleProcessCode = async (codeToValidate) => {
    const raw = codeToValidate || manualCode;
    if (!raw.trim()) {
      setErrorMessage('Por favor ingresa un código o escanea un QR.');
      return;
    }

    setErrorMessage(null);
    setValidationResult(null);

    try {
      const result = await onValidateReservation(raw.trim());
      setValidationResult(result);
      setManualCode('');
    } catch (err) {
      setErrorMessage(err.message || 'Error al validar la reserva.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleProcessCode(manualCode);
  };

  // Quick Demo Tester: Picks an active confirmed order from Doña Rosa
  const handleTestActiveOrder = () => {
    const active = confirmedOrders.find((o) => o.status === 'confirmed');
    if (active) {
      setManualCode(active.reservationCode || active.id);
      handleProcessCode(active.reservationCode || active.id);
    } else {
      setManualCode('PM-CUS-3156');
      handleProcessCode('PM-CUS-3156');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-aubergine/10 shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-cream mx-auto flex items-center justify-center text-aubergine mb-3">
          <QrCode size={28} className="text-chili" />
        </div>
        <h2 className="text-xl font-outfit font-black text-aubergine">
          Validación de Comensal en Barra
        </h2>
        <p className="text-xs text-aubergine/60 font-sans mt-1 max-w-md mx-auto">
          Escanea el código QR del ticket digital del comensal o ingresa su identificador para verificar y entregar su porción.
        </p>
      </div>

      {/* Validation Result Box (Success Confirmation in Mint) */}
      {validationResult && (
        <div className="p-6 rounded-2xl bg-mint-surface border-2 border-mint text-aubergine shadow-card animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-mint text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-mint-dark">
                Validación Exitosa · Comanda Cerrada
              </span>
              <h3 className="text-xl font-outfit font-black text-aubergine mt-0.5">
                ¡Reserva validada correctamente!
              </h3>
              <p className="text-xs text-aubergine/70 font-sans mt-1">
                El comensal ha sido atendido y el inventario ha sido cuadrado.
              </p>

              {/* Order breakdown snapshot */}
              <div className="mt-4 p-3.5 bg-white/80 rounded-xl border border-mint/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-outfit font-extrabold text-sm text-aubergine">
                    {validationResult.dish?.title || validationResult.dish_title || 'Plato reservado'}
                  </h4>
                  <p className="text-aubergine/60 font-sans">
                    Comensal: <strong>{validationResult.user_name}</strong> · {validationResult.quantity} porción(es)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-aubergine/50 block">
                    Saldo cobrado en barra
                  </span>
                  <span className="font-outfit font-black text-base text-chili">
                    {formatCurrency(validationResult.remainingAmount || validationResult.remaining_amount || 8.00)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-chili-surface border-2 border-chili text-aubergine flex items-start gap-3">
          <AlertCircle size={20} className="text-chili shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <strong className="font-bold text-chili block">No se pudo validar la reserva:</strong>
            <p className="mt-0.5 text-aubergine/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Camera QR Scanner Box */}
      <div className="bg-white p-6 rounded-2xl border border-aubergine/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-outfit font-bold text-sm text-aubergine">
              Escáner de Cámara en Vivo
            </h3>
            <p className="text-xs text-aubergine/60">
              Usa la cámara del dispositivo para leer el QR al paso
            </p>
          </div>

          <Button
            variant={isScanning ? 'primary' : 'outline'}
            size="sm"
            onClick={isScanning ? stopScanner : startScanner}
            icon={isScanning ? <CameraOff size={15} /> : <Camera size={15} />}
            className="text-xs h-9"
          >
            {isScanning ? 'Detener Cámara' : 'Activar Cámara'}
          </Button>
        </div>

        {/* Video stream container */}
        <div
          id={scannerContainerId}
          className={`w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-dashed ${
            isScanning ? 'border-chili bg-black min-h-[260px]' : 'border-aubergine/20 bg-cream-100 py-10 text-center'
          }`}
        >
          {!isScanning && (
            <div className="text-aubergine/50 flex flex-col items-center">
              <Camera size={32} className="mb-2 opacity-60" />
              <span className="text-xs font-sans">Presiona "Activar Cámara" para iniciar</span>
            </div>
          )}
        </div>

        {scannerError && (
          <p className="text-xs text-chili text-center font-medium">{scannerError}</p>
        )}
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-2xl border border-aubergine/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-outfit font-bold uppercase tracking-wider text-aubergine/70">
            Ingreso Manual de Código
          </label>
          <button
            type="button"
            onClick={handleTestActiveOrder}
            className="text-xs font-outfit font-bold text-chili hover:underline flex items-center gap-1"
          >
            <Sparkles size={12} />
            [Demo Jurado] Probar reserva activa
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Ejemplo: PM-CUS-1042 o código de 6 dígitos"
            className="flex-1 px-4 py-2.5 text-xs font-sans rounded-xl border border-aubergine/20 focus:outline-none focus:ring-2 focus:ring-chili focus:border-transparent bg-cream-50 font-mono tracking-wider"
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isProcessing}
            icon={<ShieldCheck size={16} />}
            className="text-xs px-5"
          >
            Validar
          </Button>
        </div>
      </form>
    </div>
  );
}
