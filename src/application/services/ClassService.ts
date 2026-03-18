/**
 * APPLICATION LAYER - CLASS SERVICE
 * ==================================
 * Servicio para gestionar clases y horarios
 */

import type { IClassRepository, IScheduleRepository } from '@domain/repositories';
import type { GymClass, ClassSchedule, DateRange } from '@domain/models';

/**
 * Servicio de aplicación para gestionar clases
 */
export class ClassService {
    constructor(
        private readonly classRepository: IClassRepository,
        private readonly scheduleRepository: IScheduleRepository
    ) { }

    /**
     * CASO DE USO: Obtener todas las clases disponibles
     */
    async getAllClasses(): Promise<GymClass[]> {
        return this.classRepository.getAll();
    }

    /**
     * CASO DE USO: Obtener horarios disponibles en un rango de fechas
     */
    async getAvailableSchedules(range: DateRange): Promise<ClassSchedule[]> {
        const schedules = await this.scheduleRepository.getAvailableSchedules(range);
        // Mantener visibles los horarios aunque queden sin cupos (se deshabilitan en UI)
        return schedules.filter(s => s.status === 'AVAILABLE');
    }

    /**
     * CASO DE USO: Buscar clases por etiquetas
     */
    async searchClassesByTags(tags: string[]): Promise<GymClass[]> {
        return this.classRepository.searchByTags(tags);
    }

    /**
     * CASO DE USO: Obtener detalles de una clase específica
     */
    async getClassById(classId: string): Promise<GymClass | null> {
        return this.classRepository.getById(classId);
    }
}
