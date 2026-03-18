/**
 * INFRASTRUCTURE LAYER - DATA MAPPERS (ACTUALIZADO PARA BACKEND .NET)
 * ====================================================================
 * Los MAPPERS convierten entre DTOs del backend .NET y modelos del dominio.
 */

import type { Booking, ClassSchedule, GymClass, Space } from '@domain/models';

/**
 * DTO del backend .NET para una reserva
 */
export interface BookingDTO {
    id: string;
    spaceId: string;
    spaceName?: string;
    userId: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    notes?: string;
    createdAt: string;
}

/**
 * DTO para crear una reserva (payload al backend)
 */
export interface CreateBookingDTO {
    spaceId: string;
    userId: string;
    startDateTime: string;
    endDateTime: string;
    notes?: string;
}

/**
 * DTO del backend .NET para un espacio
 */
export interface SpaceDTO {
    id: string;
    name: string;
    description: string;
    capacity: number;
    type: string; // "GYM", "POOL", "STUDIO", etc.
    isActive: boolean;
}

/**
 * Mapper para Reservas (Booking)
 */
export class BookingMapper {
    /**
     * Convierte un BookingDTO del backend .NET a un modelo de dominio
     */
    static toDomain(dto: BookingDTO): Booking {
        return {
            id: dto.id,
            userId: dto.userId,
            scheduleId: dto.spaceId, // En el backend es "space", lo mapeamos a schedule
            status: dto.status as Booking['status'],
            startDateTime: new Date(dto.startDateTime),
            endDateTime: new Date(dto.endDateTime),
            createdAt: new Date(dto.createdAt),
            updatedAt: new Date(dto.createdAt),
            notes: dto.notes,
        };
    }

    /**
     * Convierte un array de DTOs a modelos de dominio
     */
    static toDomainList(dtos: BookingDTO[]): Booking[] {
        return dtos.map(dto => this.toDomain(dto));
    }
}

/**
 * Mapper para Espacios (Space -> GymClass)
 * El backend usa "Space", el frontend lo llama "GymClass"
 */
export class SpaceMapper {
    static toSpace(dto: SpaceDTO): Space {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            capacity: dto.capacity,
            type: dto.type,
            isActive: dto.isActive,
        };
    }

    static toSpaceList(dtos: SpaceDTO[]): Space[] {
        return dtos.map(dto => this.toSpace(dto));
    }

    /**
     * Convierte un SpaceDTO a ClassSchedule
     * (adaptando la estructura del backend a nuestro dominio)
     */
    static toClassSchedule(dto: SpaceDTO, startTime: Date, endTime: Date): ClassSchedule {
        return {
            // Identificador compuesto para distinguir el mismo espacio en distintos horarios
            id: `${dto.id}|${startTime.toISOString()}|${endTime.toISOString()}`,
            classId: dto.id,
            spaceName: dto.name,
            startTime: startTime,
            endTime: endTime,
            availableSpots: dto.capacity,
            status: dto.isActive ? 'AVAILABLE' : 'CANCELLED',
        };
    }

    /**
     * Convierte un SpaceDTO a GymClass
     */
    static toGymClass(dto: SpaceDTO): GymClass {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            instructor: 'Por definir', // El backend no tiene este campo
            duration: 60, // Valor por defecto
            capacity: dto.capacity,
            difficulty: 'INTERMEDIATE', // Valor por defecto
            tags: [dto.type.toLowerCase()],
        };
    }

    static toGymClassList(dtos: SpaceDTO[]): GymClass[] {
        return dtos.map(dto => this.toGymClass(dto));
    }
}
