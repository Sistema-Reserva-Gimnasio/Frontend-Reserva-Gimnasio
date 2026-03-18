/**
 * PRESENTATION LAYER - CALENDAR COMPONENT
 * ========================================
 * Componente reactivo para mostrar disponibilidad de clases.
 * Usa Tailwind CSS para diseño moderno.
 */

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClassStore } from '../stores/classStore';
import type { ClassSchedule } from '@domain/models';

const slotHours = [9, 11, 14, 16, 18, 20];

// Props
const props = defineProps<{
  selectedDate?: Date;
}>();

// Emits
const emit = defineEmits<{
  scheduleSelected: [schedule: ClassSchedule];
}>();

// Store
const classStore = useClassStore();

// Estado local
const currentDate = ref(props.selectedDate || new Date());
const selectedSchedule = ref<ClassSchedule | null>(null);
const openGroups = ref<Record<string, boolean>>({});

// Computed: días de la semana actual
const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });
});

// Computed: horarios agrupados por día
const schedulesByDay = computed(() => {
  const grouped: Record<string, ClassSchedule[]> = {};
  
  classStore.schedules.forEach(schedule => {
    const dateKey = schedule.startTime.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(schedule);
  });
  
  return grouped;
});

// Métodos
function getSchedulesForDate(date: Date): ClassSchedule[] {
  const dateKey = date.toISOString().split('T')[0];
  return schedulesByDay.value[dateKey] || [];
}

function getSlotGroupsForDate(date: Date) {
  const dateKey = date.toISOString().split('T')[0];
  const list = [...getSchedulesForDate(date)];

  return slotHours.map(hour => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);

    const label = `${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    const key = `${dateKey}|${hour}`;
    const schedules = list
      .filter(s => s.startTime.getHours() === hour)
      .sort((a, b) => (a.spaceName || '').localeCompare(b.spaceName || ''));

    return { key, label, schedules };
  });
}

function toggleGroup(key: string) {
  openGroups.value[key] = !openGroups.value[key];
}

function selectSchedule(schedule: ClassSchedule) {
  selectedSchedule.value = schedule;
  emit('scheduleSelected', schedule);
}

function previousWeek() {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7));
  loadSchedules();
}

function nextWeek() {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7));
  loadSchedules();
}

function loadSchedules() {
  const weekStart = weekDays.value[0];
  const weekEnd = weekDays.value[6];
  
  classStore.fetchAvailableSchedules({
    startDate: weekStart,
    endDate: weekEnd,
  });
}

// Lifecycle
onMounted(() => {
  loadSchedules();
});
</script>

<template>
  <div class="calendar-container bg-white rounded-xl shadow-lg p-6">
    <!-- Header con navegación -->
    <div class="flex items-center justify-between mb-6">
      <button 
        @click="previousWeek"
        class="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
      >
        ← Semana Anterior
      </button>
      
      <h2 class="text-2xl font-bold text-gray-800">
        {{ currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) }}
      </h2>
      
      <button 
        @click="nextWeek"
        class="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
      >
        Siguiente Semana →
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="classStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="classStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-semibold">Error al cargar horarios</p>
      <p class="text-sm">{{ classStore.error }}</p>
    </div>

    <!-- Calendario de la semana -->
    <div v-else class="grid grid-cols-7 gap-4">
      <div 
        v-for="day in weekDays" 
        :key="day.toISOString()"
        class="rounded-xl border border-gray-200 bg-white p-4 min-h-[220px] shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Encabezado del día -->
        <div class="text-center mb-3">
          <p class="text-sm font-semibold text-gray-600">
            {{ day.toLocaleDateString('es-ES', { weekday: 'short' }) }}
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ day.getDate() }}
          </p>
        </div>

        <!-- Horarios del día (acordeón por franja) -->
        <div class="space-y-2">
          <div
            v-for="group in getSlotGroupsForDate(day)"
            :key="group.key"
            class="rounded-lg border border-gray-200 bg-white/60"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
              @click="toggleGroup(group.key)"
            >
              <span class="text-xs font-bold text-gray-700">
                {{ group.label }}
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full border"
                :class="group.schedules.length > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'">
                {{ group.schedules.length }} espacios
              </span>
            </button>

            <div v-show="openGroups[group.key]" class="px-3 pb-3">
              <div v-if="group.schedules.length === 0" class="text-xs text-gray-500 py-2">
                No hay espacios disponibles.
              </div>

              <div v-else class="space-y-2">
                <button
                  v-for="schedule in group.schedules"
                  :key="schedule.id"
                  @click="selectSchedule(schedule)"
                  :class="[
                    'w-full text-left p-3 rounded-lg transition-all',
                    'bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-400',
                    selectedSchedule?.id === schedule.id && 'ring-2 ring-primary-500'
                  ]"
                >
                  <p class="text-sm font-semibold text-gray-800">
                    {{ schedule.spaceName || 'Espacio' }}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    Capacidad: {{ schedule.availableSpots }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
.calendar-container {
  /* Glassmorphism effect - diseño moderno */
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}
</style>
