/**
 * INFRASTRUCTURE LAYER - BOOKING REPOSITORY IMPLEMENTATION (AJUSTADO PARA .NET BACKEND)
 * ======================================================================================
 */

import type { IBookingRepository } from '@domain/repositories';
import type { Booking } from '@domain/models';
import { apiClient, ApiError } from '../http/apiClient';
import { BookingMapper, type BookingDTO, type CreateBookingDTO } from '../mappers';

export class HttpBookingRepository implements IBookingRepository {
    private readonly basePath = '/Bookings'; // Cambiado para coincidir con el backend

    async create(
        booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
        startDateTime?: Date,
        endDateTime?: Date
    ): Promise<Booking> {
        try {
            const spaceId = booking.scheduleId.split('|')[0];

            const createDTO: CreateBookingDTO = {
                spaceId, // scheduleId -> spaceId en el backend
                userId: booking.userId,
                startDateTime: (startDateTime || new Date()).toISOString(),
                endDateTime: (endDateTime || new Date(Date.now() + 3600000)).toISOString(),
                notes: booking.notes,
            };

            const response = await apiClient.post<BookingDTO>(this.basePath, createDTO);
            return BookingMapper.toDomain(response.data);

        } catch (error) {
            throw error;
        }
    }


    async getById(id: string): Promise<Booking | null> {
        try {
            const response = await apiClient.get<BookingDTO>(`${this.basePath}/${id}`);
            return BookingMapper.toDomain(response.data);
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<Booking[]> {
        try {
            const response = await apiClient.get<BookingDTO[]>(`${this.basePath}/user/${userId}`);
            return BookingMapper.toDomainList(response.data);
        } catch (error) {
            throw error;
        }
    }

    async cancel(bookingId: string): Promise<Booking> {
        try {
            // El backend usa DELETE para cancelar
            await apiClient.delete(`${this.basePath}/${bookingId}`);
            // Devolver la reserva actualizada
            const updated = await this.getById(bookingId);
            return updated!;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, booking: Partial<Booking>): Promise<Booking> {
        try {
            const response = await apiClient.put<BookingDTO>(`${this.basePath}/${id}`, booking);
            return BookingMapper.toDomain(response.data);
        } catch (error) {
            throw error;
        }
    }
}
