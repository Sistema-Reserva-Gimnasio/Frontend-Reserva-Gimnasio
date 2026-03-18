/**
 * PRESENTATION LAYER - PINIA STORE FOR BOOKINGS
 * ==============================================
 * Estado global reactivo para gestionar reservas.
 * Pinia se integra con la capa de aplicación (services).
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Booking } from '@domain/models';
import { BookingService } from '@application/services/BookingService';
import { HttpBookingRepository } from '@infrastructure/repositories/HttpBookingRepository';
import { HttpScheduleRepository } from '@infrastructure/repositories/HttpScheduleRepository';
import { ApiError } from '@infrastructure/http/apiClient';

/**
 * Store de Pinia para gestión de reservas
 * 
 * Separación de responsabilidades:
 * - Store: gestiona el ESTADO reactivo (las reservas en memoria)
 * - Service: ejecuta la LÓGICA DE NEGOCIO (crear, validar, etc.)
 * - Repository: ejecuta las LLAMADAS HTTP
 */
export const useBookingStore = defineStore('booking', () => {
    // === ESTADO REACTIVO ===
    const bookings = ref<Booking[]>([]);
    const currentBooking = ref<Booking | null>(null);
    const loading = ref(false);
    const error = ref<{
        message: string;
        validationErrors?: Record<string, string[]>;
    } | null>(null);

    // === DEPENDENCIAS (Inyección manual) ===
    const bookingService = new BookingService(
        new HttpBookingRepository(),
        new HttpScheduleRepository()
    );

    // === COMPUTED (Estado derivado) ===
    const upcomingBookings = computed(() => {
        return bookings.value.filter(
            b => b.status === 'PENDING' || b.status === 'CONFIRMED'
        );
    });

    const completedBookings = computed(() => {
        return bookings.value.filter(b => b.status === 'COMPLETED');
    });

    // === ACTIONS ===

    /**
     * Obtiene todas las reservas del usuario actual
     */
    async function fetchUserBookings(userId: string) {
        loading.value = true;
        error.value = null;

        try {
            bookings.value = await bookingService.getUserBookings(userId);
        } catch (err) {
            handleError(err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Obtiene una reserva por ID (GET /api/Bookings/{id})
     */
    async function fetchBookingById(bookingId: string) {
        loading.value = true;
        error.value = null;

        try {
            const booking = await bookingService.getBookingById(bookingId);
            currentBooking.value = booking;
            return booking;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Crea una nueva reserva
     */
    async function createBooking(userId: string, scheduleId: string, notes?: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await bookingService.createBooking({
                userId,
                scheduleId,
                notes,
            });

            if (result.success && result.booking) {
                bookings.value.push(result.booking);
                currentBooking.value = result.booking;
                return result.booking;
            } else if (result.error) {
                error.value = {
                    message: result.error.message,
                    validationErrors: result.error.validationErrors,
                };
                return null;
            }
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Cancela una reserva existente
     */
    async function cancelBooking(bookingId: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await bookingService.cancelBooking(bookingId);

            if (result.success && result.booking) {
                // Actualizar en el array local
                const index = bookings.value.findIndex(b => b.id === bookingId);
                if (index !== -1) {
                    bookings.value[index] = result.booking;
                }
                return result.booking;
            } else if (result.error) {
                error.value = {
                    message: result.error.message,
                    validationErrors: result.error.validationErrors,
                };
                return null;
            }
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Limpia los errores
     */
    function clearError() {
        error.value = null;
    }

    /**
     * Manejo centralizado de errores
     */
    function handleError(err: unknown) {
        if (err instanceof ApiError) {
            error.value = {
                message: err.message,
                validationErrors: err.validationErrors,
            };
        } else if (err instanceof Error) {
            error.value = {
                message: err.message,
            };
        } else {
            error.value = {
                message: 'Error desconocido',
            };
        }
    }

    return {
        // Estado
        bookings,
        currentBooking,
        loading,
        error,
        // Computed
        upcomingBookings,
        completedBookings,
        // Actions
        fetchUserBookings,
        fetchBookingById,
        createBooking,
        cancelBooking,
        clearError,
    };
});
