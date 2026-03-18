/**
 * INFRASTRUCTURE LAYER - HEALTH REPOSITORY (/health)
 * ==================================================
 */

import axios from 'axios';
import type { IHealthRepository } from '@domain/repositories';
import type { HealthResponse } from '@domain/models';
import { apiClient, ApiError } from '../http/apiClient';

type HealthDTO = {
    status: string;
    timestamp: string;
};

export class HttpHealthRepository implements IHealthRepository {
    async check(): Promise<HealthResponse> {
        const base = String(apiClient.defaults.baseURL || '');
        const rootBase = base.replace(/\/api\/?$/, '');

        try {
            const response = await axios.get<HealthDTO>(`${rootBase}/health`, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' },
            });

            return {
                status: response.data.status,
                timestamp: new Date(response.data.timestamp),
            };
        } catch (error: any) {
            // Normalizar como ApiError para reutilizar manejo existente
            const status = error?.response?.status || 0;
            const message = error?.response?.data?.message || error?.message || 'Error desconocido';
            throw new ApiError(message, status, undefined, error);
        }
    }
}
