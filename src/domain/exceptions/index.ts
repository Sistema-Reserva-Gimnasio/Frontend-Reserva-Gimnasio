/**
 * DOMAIN LAYER - EXCEPTIONS
 * ==========================
 * Excepciones personalizadas del dominio.
 * Representan errores de negocio específicos.
 */

/**
 * Error base del dominio
 */
export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

/**
 * Error cuando no hay cupos disponibles para una clase
 */
export class NoAvailableSpotsError extends DomainError {
    constructor(scheduleId: string) {
        super(`No hay cupos disponibles para el horario ${scheduleId}`);
        this.name = 'NoAvailableSpotsError';
    }
}

/**
 * Error cuando se intenta reservar fuera del horario válido
 */
export class InvalidBookingTimeError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidBookingTimeError';
    }
}

/**
 * Error cuando la reserva no se encuentra
 */
export class BookingNotFoundError extends DomainError {
    constructor(bookingId: string) {
        super(`Reserva ${bookingId} no encontrada`);
        this.name = 'BookingNotFoundError';
    }
}
