/**
 * APPLICATION LAYER - SPACE SERVICE
 * ================================
 */

import type { ISpaceRepository } from '@domain/repositories';
import type { CreateSpaceInput, DateRange, Space, SpaceType } from '@domain/models';

export class SpaceService {
    constructor(private readonly spaceRepository: ISpaceRepository) { }

    getAllSpaces(): Promise<Space[]> {
        return this.spaceRepository.getAll();
    }

    getSpaceById(id: string): Promise<Space | null> {
        return this.spaceRepository.getById(id);
    }

    createSpace(input: CreateSpaceInput): Promise<Space> {
        return this.spaceRepository.create(input);
    }

    deleteSpace(id: string): Promise<void> {
        return this.spaceRepository.delete(id);
    }

    getAvailableSpaces(range: DateRange, type?: SpaceType): Promise<Space[]> {
        return this.spaceRepository.getAvailable(range, type);
    }
}
