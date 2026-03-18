<!--
  APP.VUE - MAIN APPLICATION COMPONENT
  =====================================
  
  ARQUITECTURA DDD/CLEAN ARCHITECTURE:
  
  📁 src/domain/
     └── models/          -> Entidades de negocio puras (User, Booking, GymClass, ClassSchedule)
     └── repositories/    -> Interfaces (contratos) de repositorios
     └── exceptions/      -> Excepciones del dominio
     
  📁 src/application/
     └── services/        -> Lógica de orquestación (BookingService, ClassService)
                           -> Coordina dominio + infraestructura
                           -> SIN detalles de implementación
  
  📁 src/infrastructure/
     └── http/           -> Cliente HTTP (Axios) con manejo de errores
     └── mappers/        -> Conversión DTO ↔ Modelos de dominio
     └── repositories/   -> Implementaciones concretas (HTTP) de interfaces del dominio
  
  📁 src/presentation/
     └── components/     -> Componentes Vue reutilizables
     └── views/          -> Páginas/vistas
     └── stores/         -> Stores de Pinia (estado global reactivo)
     └── composables/    -> Composables (lógica reutilizable de UI)
  
  SEPARACIÓN DE RESPONSABILIDADES:
  
  ✅ DOMINIO (domain/):
     - Define QUÉ es el negocio
     - Modelos puros sin dependencias
     - Interfaces de repositorios (qué se necesita, no cómo se hace)
  
  ✅ APLICACIÓN (application/):
     - Define CÓMO se orquestan las operaciones
     - Casos de uso (crear reserva, cancelar, etc.)
     - Coordina dominio + infraestructura
  
  ✅ INFRAESTRUCTURA (infrastructure/):
     - Define DETALLES de implementación
     - Cómo se comunica con el backend (HTTP, GraphQL, etc.)
     - Cómo se transforman los datos (mappers)
  
  ✅ PRESENTACIÓN (presentation/):
     - Define la INTERFAZ de usuario
     - Components: elementos visuales reutilizables
     - Composables: lógica reactiva de UI (NO lógica de negocio)
     - Stores: estado global reactivo
  
  FLUJO DE DATOS (ejemplo: crear una reserva):
  
  1. Usuario interacta con BookingForm.vue (PRESENTATION)
  2. BookingForm usa composable useBooking() (PRESENTATION)
  3. useBooking() llama al BookingStore (PRESENTATION/STATE)
  4. BookingStore llama a BookingService (APPLICATION)
  5. BookingService ejecuta lógica de negocio y validaciones
  6. BookingService usa IBookingRepository (DOMAIN interface)
  7. HttpBookingRepository implementa la interface (INFRASTRUCTURE)
  8. HttpBookingRepository usa apiClient (INFRASTRUCTURE)
  9. apiClient hace la petición HTTP al backend .NET
  10. La respuesta regresa por las capas hasta el componente
  
  MANEJO DE ERRORES DEL BACKEND .NET:
  
  - apiClient intercepta errores HTTP
  - Convierte ValidationProblemDetails de .NET a ApiError
  - BookingService convierte a BookingResult
  - useBooking() expone errores de forma reactiva
  - BookingForm muestra errores específicos por campo
-->

<script setup lang="ts">
import HomePage from './presentation/views/HomePage.vue';
</script>

<template>
  <div id="app">
    <!-- 
      COMPONENTE PRINCIPAL
      ====================
      En una aplicación real, aquí usarías Vue Router
      para manejar múltiples vistas/páginas.
    -->
    <HomePage />
  </div>
</template>

<style>
/* 
  Los estilos globales están en src/assets/main.css
  usando Tailwind CSS para diseño moderno
*/
</style>

