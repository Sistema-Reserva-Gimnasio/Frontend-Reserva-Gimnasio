/**
 * INFRASTRUCTURE LAYER - SPACE REPOSITORY (ENDPOINTS /Spaces)
 * ==========================================================
 */

import type { ISpaceRepository } from '@domain/repositories';
import type { CreateSpaceInput, DateRange, Space, SpaceType } from '@domain/models';
import { apiClient, ApiError } from '../http/apiClient';
import { SpaceMapper, type SpaceDTO } from '../mappers';

type CreateSpaceDTO = {
    name: string;
    description: string;
    capacity: number;
    type: number;
};

export class HttpSpaceRepository implements ISpaceRepository {
    private readonly basePath = '/Spaces';

    async getAll(): Promise<Space[]> {
        const response = await apiClient.get<SpaceDTO[]>(this.basePath);
        return SpaceMapper.toSpaceList(response.data);
    }

    async getById(id: string): Promise<Space | null> {
        try {
            const response = await apiClient.get<SpaceDTO>(`${this.basePath}/${id}`);
            return SpaceMapper.toSpace(response.data);
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 404) return null;
            throw error;
        }
    }

    async create(input: CreateSpaceInput): Promise<Space> {
        const payload: CreateSpaceDTO = {
            name: input.name,
            description: input.description,
            capacity: input.capacity,
            type: input.type,
        };

        const response = await apiClient.post<SpaceDTO>(this.basePath, payload);
        return SpaceMapper.toSpace(response.data);
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${this.basePath}/${id}`);
    }

    async getAvailable(range: DateRange, type?: SpaceType): Promise<Space[]> {
        // El backend valida que startDateTime sea futuro (ReservationPeriod.Create)
        const now = new Date();
        const minFuture = new Date(now.getTime() + 60_000);
        let startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        if (endDate <= minFuture) return [];
        if (startDate < minFuture) startDate = minFuture;
        if (startDate >= endDate) return [];

        const params: Record<string, any> = {
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString(),
        };

        if (type) params.type = type;

        const response = await apiClient.get<SpaceDTO[]>(`${this.basePath}/available`, { params });
        return SpaceMapper.toSpaceList(response.data);
    }
}
