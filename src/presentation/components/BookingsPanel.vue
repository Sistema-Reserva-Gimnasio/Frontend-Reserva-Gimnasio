<script setup lang="ts">
import { onMounted } from 'vue';
import { useBookingStore } from '../stores/bookingStore';

const props = defineProps<{
  userId: string;
}>();

const bookingStore = useBookingStore();

function fmt(d?: Date) {
  if (!d) return '—';
  return d.toLocaleString('es-ES');
}

onMounted(() => {
  bookingStore.fetchUserBookings(props.userId);
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Mis reservas</h2>
        <p class="text-xs text-gray-500">Usuario: {{ userId }}</p>
      </div>

      <button
        class="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-50 border border-gray-200 hover:bg-gray-100"
        :disabled="bookingStore.loading"
        @click="bookingStore.fetchUserBookings(userId)"
      >
        Recargar
      </button>
    </div>

    <div v-if="bookingStore.error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ bookingStore.error.message }}
    </div>

    <div class="divide-y">
      <div v-if="bookingStore.loading" class="py-6 text-sm text-gray-500">Cargando…</div>
      <div v-else-if="bookingStore.bookings.length === 0" class="py-6 text-sm text-gray-500">Aún no tienes reservas.</div>

      <div v-for="b in bookingStore.bookings" :key="b.id" class="py-4 flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-800">Reserva {{ b.id }}</p>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold border"
              :class="b.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-primary-50 text-primary-700 border-primary-200'">
              {{ b.status }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Espacio: {{ b.scheduleId }}</p>
          <p class="text-xs text-gray-500 mt-1">Inicio: {{ fmt(b.startDateTime) }}</p>
          <p class="text-xs text-gray-500">Fin: {{ fmt(b.endDateTime) }}</p>
          <p v-if="b.notes" class="text-xs text-gray-500 mt-1">Notas: {{ b.notes }}</p>
        </div>

        <button
          class="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-60"
          :disabled="bookingStore.loading || b.status === 'CANCELLED' || b.status === 'COMPLETED'"
          @click="bookingStore.cancelBooking(b.id)"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>
