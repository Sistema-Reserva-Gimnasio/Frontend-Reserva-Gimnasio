<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSpaceStore } from '../stores/spaceStore';
import type { SpaceType } from '@domain/models';

const spaceStore = useSpaceStore();

const name = ref('');
const description = ref('');
const capacity = ref<number>(10);
const type = ref<number>(3);

async function submit() {
  const created = await spaceStore.createSpace({
    name: name.value.trim(),
    description: description.value.trim(),
    capacity: capacity.value,
    type: type.value as SpaceType,
  });

  if (created) {
    name.value = '';
    description.value = '';
    capacity.value = 10;
    type.value = 3;
  }
}

onMounted(() => {
  spaceStore.fetchSpaces();
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-800">Espacios</h2>
      <button
        class="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-50 border border-gray-200 hover:bg-gray-100"
        :disabled="spaceStore.loading"
        @click="spaceStore.fetchSpaces()"
      >
        Recargar
      </button>
    </div>

    <div v-if="spaceStore.error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ spaceStore.error }}
    </div>

    <!-- Crear espacio -->
    <form class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" @submit.prevent="submit">
      <div class="md:col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input v-model="name" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Sala Yoga" required />
      </div>

      <div class="md:col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
        <input v-model.number="capacity" type="number" min="1" class="w-full px-3 py-2 border rounded-lg" required />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input v-model="description" class="w-full px-3 py-2 border rounded-lg" placeholder="Opcional" />
      </div>

      <div class="md:col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select v-model.number="type" class="w-full px-3 py-2 border rounded-lg">
          <option :value="1">Desk (1)</option>
          <option :value="2">MeetingRoom (2)</option>
          <option :value="3">GymArea (3)</option>
          <option :value="4">TrainingZone (4)</option>
          <option :value="5">PrivateOffice (5)</option>
          <option :value="6">Locker (6)</option>
        </select>
      </div>

      <div class="md:col-span-1 flex items-end">
        <button
          type="submit"
          class="w-full px-4 py-2 rounded-lg font-semibold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
          :disabled="spaceStore.loading"
        >
          Crear
        </button>
      </div>
    </form>

    <!-- Lista -->
    <div class="divide-y">
      <div v-if="spaceStore.loading" class="py-6 text-sm text-gray-500">Cargando…</div>
      <div v-else-if="spaceStore.spaces.length === 0" class="py-6 text-sm text-gray-500">No hay espacios.</div>

      <div v-for="s in spaceStore.spaces" :key="s.id" class="py-4 flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-800">{{ s.name }}</p>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="s.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'"
            >
              {{ s.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <p class="text-sm text-gray-600">{{ s.description || '—' }}</p>
          <p class="text-xs text-gray-500 mt-1">Capacidad: {{ s.capacity }} · Tipo: {{ s.type }}</p>
          <p class="text-xs text-gray-400 mt-1">ID: {{ s.id }}</p>
        </div>

        <button
          class="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-60"
          :disabled="spaceStore.loading"
          @click="spaceStore.deleteSpace(s.id)"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
