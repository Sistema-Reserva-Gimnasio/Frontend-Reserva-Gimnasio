/**
 * DOMAIN LAYER - MODELS
 * =====================
 * Este directorio contiene las entidades de negocio puras.
 * NO tienen dependencias con frameworks externos.
 * Representan los conceptos fundamentales del dominio de reservas de gimnasio.
 */

/**
 * Modelo de dominio: Usuario
 * Representa un usuario del sistema (cliente que hace reservas)
 */
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    membershipType: 'BASIC' | 'PREMIUM' | 'VIP';
    createdAt: Date;
}

/**
 * Modelo de dominio: Clase de Gimnasio
 * Representa una clase/actividad ofrecida por el gimnasio
 */
export interface GymClass {
    id: string;
    name: string;
    description: string;
    instructor: string;
    duration: number; // en minutos
    capacity: number;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    tags: string[]; // ej: ['cardio', 'strength', 'yoga']
}

/**
 * Modelo de dominio: Horario de Clase
 * Representa una instancia específica de una clase en un momento determinado
 */
export interface ClassSchedule {
    id: string;
    classId: string;
    spaceName?: string;
    startTime: Date;
    endTime: Date;
    availableSpots: number;
    status: 'AVAILABLE' | 'FULL' | 'CANCELLED';
}

/**
 * Modelo de dominio: Reserva
 * Representa una reserva hecha por un usuario para una clase específica
 */
export interface Booking {
    id: string;
    userId: string;
    scheduleId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    startDateTime?: Date;
    endDateTime?: Date;
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
}

/**
 * Tipos de valor: Rango de fechas para consultas
 */
export interface DateRange {
    startDate: Date;
    endDate: Date;
}

/**
 * Modelo de dominio: Space (recurso del backend /Spaces)
 */
export interface Space {
    id: string;
    name: string;
    description: string;
    capacity: number;
    type: string;
    isActive: boolean;
}

/**
 * Backend espera SpaceType como int (enum)
 * 1 Desk, 2 MeetingRoom, 3 GymArea, 4 TrainingZone, 5 PrivateOffice, 6 Locker
 */
export type SpaceType = 1 | 2 | 3 | 4 | 5 | 6;

export interface CreateSpaceInput {
    name: string;
    description: string;
    capacity: number;
    type: SpaceType;
}

export interface HealthResponse {
    status: string;
    timestamp: Date;
}
