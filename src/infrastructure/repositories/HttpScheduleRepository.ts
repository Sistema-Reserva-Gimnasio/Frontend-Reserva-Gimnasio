/**
 * INFRASTRUCTURE LAYER - SCHEDULE REPOSITORY (ADAPTA SPACES A SCHEDULES)
 * =======================================================================
 */

import type { IScheduleRepository } from '@domain/repositories';
import type { ClassSchedule, DateRange } from '@domain/models';
import { apiClient, ApiError } from '../http/apiClient';
import { SpaceMapper, type SpaceDTO } from '../mappers';

export class HttpScheduleRepository implements IScheduleRepository {
    private readonly basePath = '/Spaces';

    async getAvailableSchedules(range: DateRange): Promise<ClassSchedule[]> {
        try {
            // IMPORTANTE: el endpoint /Spaces/available valida disponibilidad en un período.
            // Si consultamos una semana completa, una sola reserva dejaría el espacio “no disponible” para TODO el rango.
            // Por eso consultamos disponibilidad POR FRANJA (ej. 9-10) y armamos el calendario con esos resultados.
            const now = new Date();
            const minFuture = new Date(now.getTime() + 60_000); // evitar 400 por diferencias de milisegundos

            const startDay = new Date(range.startDate);
            startDay.setHours(0, 0, 0, 0);
            const endDay = new Date(range.endDate);
            endDay.setHours(0, 0, 0, 0);

            const hours = [9, 11, 14, 16, 18, 20];
            const schedules: ClassSchedule[] = [];

            const tasks: Array<() => Promise<void>> = [];

            for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
                for (const hour of hours) {
                    const startTime = new Date(d);
                    startTime.setHours(hour, 0, 0, 0);

                    const endTime = new Date(startTime);
                    endTime.setHours(hour + 1, 0, 0, 0);

                    // Backend exige start en el futuro
                    if (startTime < minFuture) continue;

                    tasks.push(async () => {
                        const response = await apiClient.get<SpaceDTO[]>(`${this.basePath}/available`, {
                            params: {
                                startDateTime: startTime.toISOString(),
                                endDateTime: endTime.toISOString(),
                            },
                        });

                        for (const space of response.data) {
                            schedules.push(SpaceMapper.toClassSchedule(space, startTime, endTime));
                        }
                    });
                }
            }

            // Pool de concurrencia para no disparar demasiadas requests a la vez
            const limit = 6;
            let i = 0;
            const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
                while (i < tasks.length) {
                    const task = tasks[i++];
                    await task();
                }
            });
            await Promise.all(workers);

            return schedules;
        } catch (error) {
            throw error;
        }
    }

    async getById(id: string): Promise<ClassSchedule | null> {
        try {
            // Soportar id compuesto: {spaceId}|{startIso}|{endIso}
            const [spaceId, startIso, endIso] = id.split('|');

            // Obtener el espacio por ID
            const response = await apiClient.get<SpaceDTO>(`${this.basePath}/${spaceId}`);

            const start = startIso ? new Date(startIso) : new Date();
            const end = endIso ? new Date(endIso) : new Date(start.getTime() + 3600000); // +1 hora

            return SpaceMapper.toClassSchedule(response.data, start, end);
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async updateAvailability(scheduleId: string, availableSpots: number): Promise<ClassSchedule> {
        try {
            // El backend no tiene este endpoint, por ahora solo devolvemos el schedule
            const schedule = await this.getById(scheduleId);
            if (!schedule) {
                throw new Error('Schedule not found');
            }
            return schedule;
        } catch (error) {
            throw error;
        }
    }
}
