/**
 * PRESENTATION LAYER - MAIN PAGE
 * ===============================
 * Vista principal que integra los componentes
 */

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Calendar from '../components/Calendar.vue';
import BookingForm from '../components/BookingForm.vue';
import SpacesPanel from '../components/SpacesPanel.vue';
import BookingsPanel from '../components/BookingsPanel.vue';
import { useClassStore } from '../stores/classStore';
import { useHealthStore } from '../stores/healthStore';
import type { ClassSchedule } from '@domain/models';

const classStore = useClassStore();
const healthStore = useHealthStore();

const selectedSchedule = ref<ClassSchedule | null>(null);
const showBookingForm = ref(false);
const activeTab = ref<'reservar' | 'bookings' | 'spaces'>('reservar');

const healthPill = computed(() => {
  if (healthStore.loading) {
    return { text: 'API: comprobando…', cls: 'bg-gray-100 text-gray-700 border border-gray-200' };
  }

  if (healthStore.error) {
    return { text: 'API: error', cls: 'bg-red-50 text-red-700 border border-red-200' };
  }

  if (healthStore.health?.status === 'healthy') {
    return { text: 'API: OK', cls: 'bg-green-50 text-green-700 border border-green-200' };
  }

  return { text: 'API: desconocido', cls: 'bg-yellow-50 text-yellow-800 border border-yellow-200' };
});

function refreshHealth() {
  healthStore.checkHealth();
}

// ID del usuario actual (en producción vendría de autenticación)
// El backend .NET espera un GUID válido.
const currentUserId = ref('00000000-0000-0000-0000-000000000001');

function handleScheduleSelected(schedule: ClassSchedule) {
  selectedSchedule.value = schedule;
  showBookingForm.value = true;
}

function handleBookingCreated() {
  // Quitar el espacio reservado de esa franja horaria (el backend maneja disponibilidad por solapamiento)
  if (selectedSchedule.value) {
    classStore.removeSchedule(selectedSchedule.value.id);
  }

  showBookingForm.value = false;
  selectedSchedule.value = null;
}

function handleCancel() {
  showBookingForm.value = false;
  selectedSchedule.value = null;
}

onMounted(() => {
  classStore.fetchAllClasses();
  healthStore.checkHealth();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col items-center text-center gap-3">
          <h1 class="text-4xl font-bold text-gray-800">
            Sistema de Reservas de Gimnasio
          </h1>
          <p class="text-gray-600">
            Selecciona un horario para reservar tu clase
          </p>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="healthPill.cls">
              {{ healthPill.text }}
            </span>

            <button
              type="button"
              class="px-3 py-1 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              :disabled="healthStore.loading"
              @click="refreshHealth"
            >
              Actualizar
            </button>
          </div>

          <p v-if="healthStore.error" class="text-xs text-red-600">
            {{ healthStore.error }}
          </p>
        </div>
      </header>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold border"
          :class="activeTab === 'reservar' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
          @click="activeTab = 'reservar'"
        >
          Reservar
        </button>
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold border"
          :class="activeTab === 'bookings' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
          @click="activeTab = 'bookings'"
        >
          Mis reservas
        </button>
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold border"
          :class="activeTab === 'spaces' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
          @click="activeTab = 'spaces'"
        >
          Espacios
        </button>
      </div>

      <!-- Main Content -->
      <div v-if="activeTab === 'reservar'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendario (columnas principales) -->
        <div class="lg:col-span-2">
          <Calendar @schedule-selected="handleScheduleSelected" />
        </div>

        <!-- Sidebar: Formulario de reserva o información -->
        <div class="lg:col-span-1">
          <BookingForm
            v-if="showBookingForm && selectedSchedule"
            :schedule="selectedSchedule"
            :user-id="currentUserId"
            @booking-created="handleBookingCreated"
            @cancel="handleCancel"
          />

          <div v-else class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              ¿Cómo reservar?
            </h3>
            <ol class="space-y-3 text-gray-700">
              <li class="flex items-start">
                <span class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                <span>Selecciona un horario disponible en el calendario</span>
              </li>
              <li class="flex items-start">
                <span class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                <span>Revisa los detalles y agrega notas si lo deseas</span>
              </li>
              <li class="flex items-start">
                <span class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                <span>Confirma tu reserva y ¡listo!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'bookings'" class="max-w-4xl mx-auto">
        <BookingsPanel :user-id="currentUserId" />
      </div>

      <div v-else class="max-w-5xl mx-auto">
        <SpacesPanel />
      </div>
    </div>
  </div>
</template>
