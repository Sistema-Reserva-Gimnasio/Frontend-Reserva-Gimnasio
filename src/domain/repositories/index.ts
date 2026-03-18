/**
 * DOMAIN LAYER - REPOSITORY INTERFACES
 * =====================================
 * Define contratos (interfaces) para acceder a datos.
 * La implementación real está en la capa de infraestructura.
 * Esto permite invertir la dependencia: el dominio define qué necesita,
 * la infraestructura provee la implementación.
 */

import type { Booking, ClassSchedule, GymClass, DateRange, Space, CreateSpaceInput, SpaceType, HealthResponse } from '../models';

/**
 * Contrato para el repositorio de reservas
 * Define todas las operaciones de persistencia relacionadas con reservas
 */
export interface IBookingRepository {
    /**
     * Crea una nueva reserva
     * @param booking - Datos de la reserva a crear
     * @param startDateTime - Fecha/hora de inicio (opcional)
     * @param endDateTime - Fecha/hora de fin (opcional)
     * @returns Promesa con la reserva creada
     */
    create(
        booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
        startDateTime?: Date,
        endDateTime?: Date
    ): Promise<Booking>;

    /**
     * Obtiene una reserva por su ID
     * @param id - ID de la reserva
     */
    getById(id: string): Promise<Booking | null>;

    /**
     * Obtiene todas las reservas de un usuario
     * @param userId - ID del usuario
     */
    getByUserId(userId: string): Promise<Booking[]>;

    /**
     * Cancela una reserva existente
     * @param bookingId - ID de la reserva a cancelar
     */
    cancel(bookingId: string): Promise<Booking>;

    /**
     * Actualiza una reserva
     */
    update(id: string, booking: Partial<Booking>): Promise<Booking>;
}

/**
 * Contrato para el repositorio de horarios de clases
 */
export interface IScheduleRepository {
    /**
     * Obtiene horarios disponibles en un rango de fechas
     * @param range - Rango de fechas a consultar
     */
    getAvailableSchedules(range: DateRange): Promise<ClassSchedule[]>;

    /**
     * Obtiene un horario específico por ID
     */
    getById(id: string): Promise<ClassSchedule | null>;

    /**
     * Actualiza la disponibilidad de un horario
     */
    updateAvailability(scheduleId: string, availableSpots: number): Promise<ClassSchedule>;
}

/**
 * Contrato para el repositorio de clases de gimnasio
 */
export interface IClassRepository {
    /**
     * Obtiene todas las clases disponibles
     */
    getAll(): Promise<GymClass[]>;

    /**
     * Obtiene una clase por su ID
     */
    getById(id: string): Promise<GymClass | null>;

    /**
     * Busca clases por etiquetas (tags)
     */
    searchByTags(tags: string[]): Promise<GymClass[]>;
}

/**
 * Contrato para el repositorio de Spaces (recurso backend)
 */
export interface ISpaceRepository {
    getAll(): Promise<Space[]>;
    getById(id: string): Promise<Space | null>;
    create(input: CreateSpaceInput): Promise<Space>;
    delete(id: string): Promise<void>;

    /**
     * GET /Spaces/available
     */
    getAvailable(range: DateRange, type?: SpaceType): Promise<Space[]>;
}

export interface IHealthRepository {
    check(): Promise<HealthResponse>;
}
