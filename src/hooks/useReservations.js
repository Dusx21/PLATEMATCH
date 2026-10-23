import { useState, useCallback, useEffect } from 'react';
import { reservationService } from '../services/reservationService';

export function useReservations(reservationId = null) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(Boolean(reservationId));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReservation = useCallback(async (id) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getReservationById(id);
      setReservation(data);
      return data;
    } catch (err) {
      setError(err.message || 'No se pudo cargar la reserva');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reservationId) {
      fetchReservation(reservationId);
      const unsubscribe = reservationService.subscribeToReservation(reservationId, (updated) => {
        setReservation((prev) => ({ ...prev, ...updated }));
      });
      return () => unsubscribe();
    }
  }, [reservationId, fetchReservation]);

  const createReservation = useCallback(async (params) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await reservationService.createReservation(params);
      setReservation(created);
      return created;
    } catch (err) {
      setError(err.message || 'Error al procesar la reserva');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const completeReservation = useCallback(async (id) => {
    setIsSubmitting(true);
    try {
      const completed = await reservationService.completeReservation(id);
      setReservation(completed);
      return completed;
    } catch (err) {
      setError(err.message || 'Error al completar la reserva');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    reservation,
    loading,
    error,
    isSubmitting,
    fetchReservation,
    createReservation,
    completeReservation,
  };
}
