/**
 * APPLICATION LAYER - HEALTH SERVICE
 * =================================
 */

import type { IHealthRepository } from '@domain/repositories';
import type { HealthResponse } from '@domain/models';

export class HealthService {
    constructor(private readonly healthRepository: IHealthRepository) { }

    check(): Promise<HealthResponse> {
        return this.healthRepository.check();
    }
}
