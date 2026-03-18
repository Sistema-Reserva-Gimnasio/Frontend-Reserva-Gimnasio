/**
 * PRESENTATION LAYER - PINIA STORE FOR HEALTH
 * ==========================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HealthResponse } from '@domain/models';
import { HealthService } from '@application/services/HealthService';
import { HttpHealthRepository } from '@infrastructure/repositories/HttpHealthRepository';
import { ApiError } from '@infrastructure/http/apiClient';

export const useHealthStore = defineStore('health', () => {
    const health = ref<HealthResponse | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const healthService = new HealthService(new HttpHealthRepository());

    async function checkHealth() {
        loading.value = true;
        error.value = null;
        try {
            health.value = await healthService.check();
        } catch (err) {
            if (err instanceof ApiError) error.value = err.message;
            else if (err instanceof Error) error.value = err.message;
            else error.value = 'Error desconocido';
        } finally {
            loading.value = false;
        }
    }

    return { health, loading, error, checkHealth };
});
