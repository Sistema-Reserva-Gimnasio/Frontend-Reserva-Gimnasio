/**
 * PRESENTATION LAYER - PINIA STORE FOR CLASSES
 * =============================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GymClass, ClassSchedule, DateRange } from '@domain/models';
import { ClassService } from '@application/services/ClassService';
import { HttpClassRepository } from '@infrastructure/repositories/HttpClassRepository';
import { HttpScheduleRepository } from '@infrastructure/repositories/HttpScheduleRepository';
import { ApiError } from '@infrastructure/http/apiClient';

export const useClassStore = defineStore('class', () => {
    // Estado
    const classes = ref<GymClass[]>([]);
    const schedules = ref<ClassSchedule[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Servicio
    const classService = new ClassService(
        new HttpClassRepository(),
        new HttpScheduleRepository()
    );

    // Actions
    async function fetchAllClasses() {
        loading.value = true;
        error.value = null;

        try {
            classes.value = await classService.getAllClasses();
        } catch (err) {
            handleError(err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchAvailableSchedules(range: DateRange) {
        loading.value = true;
        error.value = null;

        try {
            schedules.value = await classService.getAvailableSchedules(range);
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

    function decrementScheduleSpot(scheduleId: string) {
        const idx = schedules.value.findIndex(s => s.id === scheduleId);
        if (idx === -1) return;
        const current = schedules.value[idx];
        if (current.availableSpots > 0) {
            current.availableSpots -= 1;
            if (current.availableSpots === 0) {
                current.status = 'FULL';
            }
        }
    }

    function removeSchedule(scheduleId: string) {
        schedules.value = schedules.value.filter(s => s.id !== scheduleId);
    }

    return {
        classes,
        schedules,
        loading,
        error,
        fetchAllClasses,
        fetchAvailableSchedules,
        decrementScheduleSpot,
        removeSchedule,
    };
});
