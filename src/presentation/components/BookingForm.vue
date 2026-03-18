/**
 * PRESENTATION LAYER - BOOKING FORM COMPONENT
 * ============================================
 * Formulario para crear una reserva.
 * Demuestra el manejo de errores de validación del backend .NET.
 */

<script setup lang="ts">
import { ref } from 'vue';
import { useBooking } from '../composables/useBooking';
import type { ClassSchedule } from '@domain/models';

// Props
const props = defineProps<{
  schedule: ClassSchedule;
  userId: string;
}>();

// Emits
const emit = defineEmits<{
  bookingCreated: [];
  cancel: [];
}>();

// Composable - ENCAPSULA la lógica de reservas
const {
  createNewBooking,
  isSubmitting,
  errorMessage,
  successMessage,
  getFieldErrors,
  hasFieldError,
  clearMessages
} = useBooking();

// Estado del formulario
const notes = ref('');

// Manejo del submit
async function handleSubmit() {
  const booking = await createNewBooking(
    props.userId,
    props.schedule.id,
    notes.value
  );

  if (booking) {
    emit('bookingCreated');
    notes.value = '';
  }
}

function handleCancel() {
  clearMessages();
  emit('cancel');
}
</script>

<template>
  <div class="booking-form bg-white rounded-xl shadow-xl p-6 max-w-md">
    <h3 class="text-2xl font-bold text-gray-800 mb-6">Confirmar Reserva</h3>

    <!-- Información del horario -->
    <div class="bg-primary-50 rounded-lg p-4 mb-6">
      <p class="text-sm text-gray-600 mb-1">Horario seleccionado</p>
      <p class="text-lg font-semibold text-gray-800">
        {{ schedule.startTime.toLocaleDateString('es-ES') }}
      </p>
      <p class="text-gray-700">
        {{ schedule.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }} -
        {{ schedule.endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}
      </p>
      <p v-if="schedule.spaceName" class="text-sm text-gray-700 mt-1">
        Espacio: <span class="font-semibold">{{ schedule.spaceName }}</span>
      </p>
      <p class="text-sm text-primary-600 mt-2">
        {{ schedule.availableSpots }} cupos disponibles
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit">
      <!-- Campo de notas -->
      <div class="mb-4">
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          v-model="notes"
          rows="3"
          :class="[
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition',
            hasFieldError('notes') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300'
          ]"
          placeholder="Agrega notas sobre tu reserva..."
        />
        
        <!-- MANEJO DE ERRORES DE VALIDACIÓN DEL BACKEND .NET -->
        <!-- Errores específicos del campo 'notes' -->
        <div v-if="hasFieldError('notes')" class="mt-1">
          <p 
            v-for="error in getFieldErrors('notes')" 
            :key="error"
            class="text-sm text-red-600"
          >
            {{ error }}
          </p>
        </div>
      </div>

      <!-- MENSAJE DE ERROR GENERAL -->
      <!-- Se muestra cuando hay errores que no están asociados a un campo específico -->
      <div 
        v-if="errorMessage && !hasFieldError('notes')" 
        class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">
              {{ errorMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- MENSAJE DE ÉXITO -->
      <div 
        v-if="successMessage" 
        class="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="handleCancel"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="[
            'flex-1 px-4 py-2 rounded-lg font-semibold transition',
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </span>
          <span v-else>Confirmar Reserva</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Animaciones sutiles */
.booking-form {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
