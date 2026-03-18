/**
 * MAIN ENTRY POINT
 * =================
 * Punto de entrada de la aplicación Vue.
 * Aquí se inicializa Vue, Pinia y otros plugins.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css'; // Importar Tailwind CSS

const app = createApp(App);

// Configurar Pinia (gestión de estado)
const pinia = createPinia();
app.use(pinia);

// Montar la aplicación
app.mount('#app');
