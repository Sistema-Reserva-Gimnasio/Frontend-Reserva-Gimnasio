/**
 * PRESENTATION LAYER - COMPOSABLE: useBooking
 * ============================================
 * Composable de Vue que ENCAPSULA LA LÓGICA de creación de reservas.
 * 
 * Los Composables son funciones reutilizables que:
 * - Usan la Composition API de Vue
 * - Encapsulan lógica reactiva
 * - Pueden ser reutilizados en múltiples componentes
 * 
 * Este composable separa:
 * - LÓGICA DE INTERFAZ (validación de formulario, estado de UI) -> AQUÍ
 * - LÓGICA DE NEGOCIO (reglas de reservas, validaciones del dominio) -> En BookingService
 */

import { ref, computed } from 'vue';
import { useBookingStore } from '../stores/bookingStore';
import type { Booking } from '@domain/models';

/**
 * Composable para manejar la creación de reservas
 * 
 * Uso en componentes:
 * ```vue
 * <script setup>
 * const { createNewBooking, isSubmitting, validationErrors, hasErrors } = useBooking();
 * 
 * const handleSubmit = async () => {
 *   const booking = await createNewBooking('user-123', 'schedule-456', 'Notas opcionales');
 *   if (booking) {
 *     // Reserva exitosa
 *   }
 * }
 * </script>
 * ```
 */
export function useBooking() {
    const bookingStore = useBookingStore();

    // === ESTADO LOCAL DEL COMPOSABLE ===
    // Este estado es específico para el componente que usa el composable
    const isSubmitting = ref(false);
    const successMessage = ref<string | null>(null);

    // === COMPUTED ===
    /**
     * Errores de validación del backend .NET
     * Estructura: { campo: [errores] }
     * Ejemplo: { "scheduleId": ["El horario no existe"], "userId": ["Usuario requerido"] }
     */
    const validationErrors = computed(() => {
        return bookingStore.error?.validationErrors || {};
    });

    /**
     * Mensaje de error general
     */
    const errorMessage = computed(() => {
        return bookingStore.error?.message || null;
    });

    /**
     * Indica si hay errores de validación
     */
    const hasErrors = computed(() => {
        return !!bookingStore.error;
    });

    /**
     * Obtiene los errores de un campo específico
     * Útil para mostrar errores debajo de inputs específicos
     */
    function getFieldErrors(fieldName: string): string[] {
        return validationErrors.value[fieldName] || [];
    }

    /**
     * Verifica si un campo tiene errores
     */
    function hasFieldError(fieldName: string): boolean {
        return getFieldErrors(fieldName).length > 0;
    }

    // === ACTIONS ===

    /**
     * Crea una nueva reserva
     * 
     * SEPARACIÓN DE RESPONSABILIDADES:
     * - Este método maneja el estado de UI (loading, mensajes)
     * - BookingService maneja la lógica de negocio (validaciones, reglas)
     * - Repository maneja la comunicación HTTP
     * 
     * @param userId - ID del usuario que hace la reserva
     * @param scheduleId - ID del horario a reservar
     * @param notes - Notas opcionales
     * @returns La reserva creada o null si hubo error
     */
    async function createNewBooking(
        userId: string,
        scheduleId: string,
        notes?: string
    ): Promise<Booking | null> {
        // Limpiar estado previo
        isSubmitting.value = true;
        successMessage.value = null;
        bookingStore.clearError();

        try {
            const booking = await bookingStore.createBooking(userId, scheduleId, notes);

            if (booking) {
                successMessage.value = '¡Reserva creada exitosamente!';
                return booking;
            }

            return null;
        } finally {
            isSubmitting.value = false;
        }
    }

    /**
     * Cancela una reserva
     */
    async function cancelExistingBooking(bookingId: string): Promise<boolean> {
        isSubmitting.value = true;
        successMessage.value = null;
        bookingStore.clearError();

        try {
            const booking = await bookingStore.cancelBooking(bookingId);

            if (booking) {
                successMessage.value = 'Reserva cancelada exitosamente';
                return true;
            }

            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    /**
     * Limpia todos los mensajes y errores
     */
    function clearMessages() {
        successMessage.value = null;
        bookingStore.clearError();
    }

    return {
        // Estado
        isSubmitting,
        successMessage,
        errorMessage,
        validationErrors,
        hasErrors,

        // Helpers
        getFieldErrors,
        hasFieldError,

        // Actions
        createNewBooking,
        cancelExistingBooking,
        clearMessages,
    };
}

/**
 * EJEMPLO DE USO EN UN COMPONENTE:
 * 
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { useBooking } from '@presentation/composables/useBooking';
 * 
 * const { 
 *   createNewBooking, 
 *   isSubmitting, 
 *   errorMessage, 
 *   validationErrors,
 *   getFieldErrors,
 *   hasFieldError,
 *   successMessage 
 * } = useBooking();
 * 
 * const scheduleId = ref('');
 * const notes = ref('');
 * 
 * async function handleSubmit() {
 *   const booking = await createNewBooking('user-123', scheduleId.value, notes.value);
 *   
 *   if (booking) {
 *     // Éxito: resetear formulario, mostrar mensaje, etc.
 *     scheduleId.value = '';
 *     notes.value = '';
 *   } else {
 *     // Error: los errores ya están disponibles en validationErrors y errorMessage
 *     console.log('Errores de validación:', validationErrors.value);
 *   }
 * }
 * </script>
 * 
 * <template>
 *   <form @submit.prevent="handleSubmit">
 *     <!-- Campo de horario -->
 *     <div>
 *       <input v-model="scheduleId" placeholder="Schedule ID" />
 *       <!-- Mostrar errores específicos del campo -->
 *       <div v-if="hasFieldError('scheduleId')" class="error">
 *         <p v-for="error in getFieldErrors('scheduleId')" :key="error">
 *           {{ error }}
 *         </p>
 *       </div>
 *     </div>
 * 
 *     <!-- Mensaje de error general -->
 *     <div v-if="errorMessage" class="error-general">
 *       {{ errorMessage }}
 *     </div>
 * 
 *     <!-- Mensaje de éxito -->
 *     <div v-if="successMessage" class="success">
 *       {{ successMessage }}
 *     </div>
 * 
 *     <button type="submit" :disabled="isSubmitting">
 *       {{ isSubmitting ? 'Creando...' : 'Crear Reserva' }}
 *     </button>
 *   </form>
 * </template>
 */
