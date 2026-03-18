/**
 * PRESENTATION LAYER - PINIA STORE FOR SPACES
 * ==========================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CreateSpaceInput, DateRange, Space, SpaceType } from '@domain/models';
import { SpaceService } from '@application/services/SpaceService';
import { HttpSpaceRepository } from '@infrastructure/repositories/HttpSpaceRepository';
import { ApiError } from '@infrastructure/http/apiClient';

export const useSpaceStore = defineStore('space', () => {
    const spaces = ref<Space[]>([]);
    const availableSpaces = ref<Space[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const spaceService = new SpaceService(new HttpSpaceRepository());

    async function fetchSpaces() {
        loading.value = true;
        error.value = null;
        try {
            spaces.value = await spaceService.getAllSpaces();
        } catch (err) {
            handleError(err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchSpaceById(id: string): Promise<Space | null> {
        loading.value = true;
        error.value = null;
        try {
            return await spaceService.getSpaceById(id);
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function createSpace(input: CreateSpaceInput): Promise<Space | null> {
        loading.value = true;
        error.value = null;
        try {
            const created = await spaceService.createSpace(input);
            spaces.value.unshift(created);
            return created;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function deleteSpace(id: string): Promise<boolean> {
        loading.value = true;
        error.value = null;
        try {
            await spaceService.deleteSpace(id);
            spaces.value = spaces.value.filter(s => s.id !== id);
            availableSpaces.value = availableSpaces.value.filter(s => s.id !== id);
            return true;
        } catch (err) {
            handleError(err);
            return false;
        } finally {
            loading.value = false;
        }
    }

    async function fetchAvailableSpaces(range: DateRange, type?: SpaceType) {
        loading.value = true;
        error.value = null;
        try {
            availableSpaces.value = await spaceService.getAvailableSpaces(range, type);
        } catch (err) {
            handleError(err);
        } finally {
            loading.value = false;
        }
    }

    function handleError(err: unknown) {
        if (err instanceof ApiError) {
            error.value = err.message;
        } else if (err instanceof Error) {
            error.value = err.message;
        } else {
            error.value = 'Error desconocido';
        }
    }

    return {
        spaces,
        availableSpaces,
        loading,
        error,
        fetchSpaces,
        fetchSpaceById,
        createSpace,
        deleteSpace,
        fetchAvailableSpaces,
    };
});
