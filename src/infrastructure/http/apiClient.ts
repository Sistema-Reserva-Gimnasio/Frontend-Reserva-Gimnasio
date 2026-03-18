/**
 * INFRASTRUCTURE LAYER - API CLIENT
 * ==================================
 * Configuración del cliente HTTP (Axios) para comunicarse con el backend .NET.
 * Este es un ADAPTADOR que implementa los detalles técnicos de comunicación.
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Configuración del API cliente
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Instancia configurada de Axios
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor para agregar token de autenticación
 */
apiClient.interceptors.request.use(
    (config) => {
        // Aquí puedes agregar el token de autenticación
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Estructura de error de validación del backend .NET
 * Coincide con el formato de ValidationProblemDetails de ASP.NET Core
 */
export interface ValidationError {
    type: string;
    title: string;
    status: number;
    errors: Record<string, string[]>; // Campo -> Array de mensajes de error
    traceId?: string;
}

/**
 * Error de API personalizado
 * Encapsula errores HTTP y de validación
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public validationErrors?: Record<string, string[]>,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Interceptor para manejar respuestas de error
 * Convierte errores de Axios en nuestro formato personalizado
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ValidationError>) => {
        const anyData = error.response?.data as any;

        // Error de validación del backend .NET (400 Bad Request)
        // Soporta:
        // - ValidationProblemDetails: { errors: { field: [messages] } }
        // - Formato custom: { errors: [{ field, message }] }
        if (error.response?.status === 400 && anyData?.errors) {
            const rawErrors = anyData.errors;

            const toCamel = (s: string) => s
                ? s.charAt(0).toLowerCase() + s.slice(1)
                : s;

            let validationErrors: Record<string, string[]> | undefined;

            if (Array.isArray(rawErrors)) {
                validationErrors = {};
                for (const e of rawErrors) {
                    const field = String(e?.field || '');
                    const message = String(e?.message || anyData?.title || 'Error de validación');
                    if (!field) continue;

                    const keys = new Set([field, toCamel(field)]);
                    for (const k of keys) {
                        if (!k) continue;
                        if (!validationErrors[k]) validationErrors[k] = [];
                        validationErrors[k].push(message);
                    }
                }
            } else if (typeof rawErrors === 'object') {
                validationErrors = rawErrors;
            }

            throw new ApiError(
                anyData.title || 'Error de validación',
                400,
                validationErrors,
                error
            );
        }

        // BadRequest con { message } (muchos endpoints devuelven este formato)
        if (error.response?.status === 400 && typeof anyData?.message === 'string') {
            throw new ApiError(anyData.message, 400, undefined, error);
        }

        // Error de autenticación (401)
        if (error.response?.status === 401) {
            // Aquí podrías redirigir al login o refrescar el token
            throw new ApiError('No autorizado', 401, undefined, error);
        }

        // Error de permisos (403)
        if (error.response?.status === 403) {
            throw new ApiError('Acceso denegado', 403, undefined, error);
        }

        // Error de recurso no encontrado (404)
        if (error.response?.status === 404) {
            throw new ApiError('Recurso no encontrado', 404, undefined, error);
        }

        // Conflicto (409) - ej: reserva duplicada
        if (error.response?.status === 409) {
            throw new ApiError(
                error.response.data?.title || 'Conflicto en la operación',
                409,
                undefined,
                error
            );
        }

        // Error del servidor (500+)
        if (error.response?.status && error.response.status >= 500) {
            throw new ApiError(
                'Error interno del servidor',
                error.response.status,
                undefined,
                error
            );
        }

        // Error de red o timeout
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            throw new ApiError(
                'Error de conexión. Verifica tu red.',
                0,
                undefined,
                error
            );
        }

        // Error genérico
        throw new ApiError(
            error.message || 'Error desconocido',
            error.response?.status || 0,
            undefined,
            error
        );
    }
);
