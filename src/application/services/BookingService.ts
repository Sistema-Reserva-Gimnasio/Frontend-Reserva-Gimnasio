/**
 * APPLICATION LAYER - BOOKING SERVICE
 * ====================================
 * Capa de aplicación: contiene la LÓGICA DE ORQUESTACIÓN.
 * Coordina las operaciones entre el dominio y la infraestructura.
 * No contiene lógica de negocio pura (eso va en domain), ni detalles de implementación (eso va en infrastructure).
 */

import type {
    IBookingRepository,
    IScheduleRepository
} from '@domain/repositories';
import type { Booking } from '@domain/models';
import {
    NoAvailableSpotsError,
    InvalidBookingTimeError
} from '@domain/exceptions';

/**
 * DTO (Data Transfer Object) para crear una reserva
 * Se usa para transferir datos desde la capa de presentación
 */
export interface CreateBookingDTO {
    userId: string;
    scheduleId: string;
    notes?: string;
}

/**
 * Resultado de la operación de reserva
 */
export interface BookingResult {
    success: boolean;
    booking?: Booking;
    error?: {
        message: string;
        code: string;
        validationErrors?: Record<string, string[]>;
    };
}

/**
 * Servicio de aplicación para gestionar reservas
 * Orquesta las operaciones de negocio
 */
export class BookingService {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly scheduleRepository: IScheduleRepository
    ) { }

    /**
     * CASO DE USO: Crear una reserva
     * 
     * Flujo:
     * 1. Verificar que el horario existe y tiene cupos disponibles
     * 2. Validar reglas de negocio (horario válido, etc.)
     * 3. Crear la reserva
     * 4. Actualizar la disponibilidad del horario
     * 
     * @param dto - Datos para crear la reserva
     * @returns Resultado de la operación
     */
    async createBooking(dto: CreateBookingDTO): Promise<BookingResult> {
        try {
            // 1. Obtener el horario
            const schedule = await this.scheduleRepository.getById(dto.scheduleId);

            if (!schedule) {
                throw new InvalidBookingTimeError('Horario no encontrado');
            }

            // 2. Validar disponibilidad
            if (schedule.availableSpots <= 0 || schedule.status !== 'AVAILABLE') {
                throw new NoAvailableSpotsError(dto.scheduleId);
            }

            // 3. Validar que el horario es en el futuro
            if (schedule.startTime <= new Date()) {
                throw new InvalidBookingTimeError('No se puede reservar para horarios pasados');
            }

            // 4. Crear la reserva con las fechas del horario seleccionado
            const booking = await this.bookingRepository.create({
                userId: dto.userId,
                scheduleId: dto.scheduleId,
                status: 'PENDING',
                notes: dto.notes
            }, schedule.startTime, schedule.endTime); // Pasar las fechas del schedule

            // 5. Actualizar disponibilidad
            await this.scheduleRepository.updateAvailability(
                dto.scheduleId,
                schedule.availableSpots - 1
            );

            return {
                success: true,
                booking
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * CASO DE USO: Cancelar una reserva
     */
    async cancelBooking(bookingId: string): Promise<BookingResult> {
        try {
            const booking = await this.bookingRepository.getById(bookingId);

            if (!booking) {
                throw new Error('Reserva no encontrada');
            }

            if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
                throw new Error('No se puede cancelar esta reserva');
            }

            const cancelledBooking = await this.bookingRepository.cancel(bookingId);

            // Liberar el cupo
            const schedule = await this.scheduleRepository.getById(booking.scheduleId);
            if (schedule) {
                await this.scheduleRepository.updateAvailability(
                    booking.scheduleId,
                    schedule.availableSpots + 1
                );
            }

            return {
                success: true,
                booking: cancelledBooking
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * CASO DE USO: Obtener una reserva por ID
     */
    async getBookingById(bookingId: string): Promise<Booking | null> {
        return this.bookingRepository.getById(bookingId);
    }

    /**
     * CASO DE USO: Obtener reservas de un usuario
     */
    async getUserBookings(userId: string): Promise<Booking[]> {
        return this.bookingRepository.getByUserId(userId);
    }

    /**
     * Manejo centralizado de errores
     * Convierte errores del dominio en resultados estructurados
     */
    private handleError(error: unknown): BookingResult {
        if (error instanceof NoAvailableSpotsError) {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: 'NO_AVAILABLE_SPOTS'
                }
            };
        }

        if (error instanceof InvalidBookingTimeError) {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: 'INVALID_BOOKING_TIME'
                }
            };
        }

        // Error genérico
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Error desconocido',
                code: 'UNKNOWN_ERROR'
            }
        };
    }
}
