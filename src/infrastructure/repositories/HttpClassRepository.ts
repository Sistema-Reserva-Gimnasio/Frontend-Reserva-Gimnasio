/**
 * INFRASTRUCTURE LAYER - CLASS REPOSITORY (USA SPACES DEL BACKEND)
 * =================================================================
 */

import type { IClassRepository } from '@domain/repositories';
import type { GymClass } from '@domain/models';
import { apiClient, ApiError } from '../http/apiClient';
import { SpaceMapper, type SpaceDTO } from '../mappers';

export class HttpClassRepository implements IClassRepository {
    private readonly basePath = '/Spaces';

    async getAll(): Promise<GymClass[]> {
        try {
            const response = await apiClient.get<SpaceDTO[]>(this.basePath);
            return SpaceMapper.toGymClassList(response.data);
        } catch (error) {
            throw error;
        }
    }

    async getById(id: string): Promise<GymClass | null> {
        try {
            const response = await apiClient.get<SpaceDTO>(`${this.basePath}/${id}`);
            return SpaceMapper.toGymClass(response.data);
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async searchByTags(tags: string[]): Promise<GymClass[]> {
        try {
            // El backend no tiene búsqueda por tags, traemos todos y filtramos
            const allClasses = await this.getAll();
            return allClasses.filter(gymClass =>
                gymClass.tags.some(tag => tags.includes(tag))
            );
        } catch (error) {
            throw error;
        }
    }
}
