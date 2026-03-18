# Sistema de Reservas (Frontend) — Vue 3 + Vite

Este proyecto es el **frontend** del sistema de reservas: una interfaz para consultar horarios, crear reservas y revisar información de espacios, consumiendo la API del backend.

## Stack

- Vue 3
- Vite
- Pinia
- Axios
- Tailwind CSS

## Requisitos

- Node.js (según `package.json`): `^20.19.0 || >=22.12.0`
- npm

## Configuración de la API

El cliente HTTP usa la variable de entorno:

- `VITE_API_BASE_URL`

Si no la defines, el proyecto usa por defecto: `http://localhost:5000/api`.

Recomendado: crea un archivo `.env.local` en la raíz del proyecto:

```bash
VITE_API_BASE_URL=http://localhost:5204/api
```

Si levantas el backend por HTTPS:

```bash
VITE_API_BASE_URL=https://localhost:7288/api
```

## Ejecutar en local

```bash
npm install
npm run dev
```

## Scripts disponibles

- `npm run dev` — desarrollo (hot reload)
- `npm run build` — build de producción
- `npm run preview` — levantar una previsualización del build

## Qué valida la pantalla principal

La UI muestra un indicador “API: OK/Error” consultando `GET /health` del backend (a partir de la URL base configurada).

## Estructura del código

Dentro de `src/`:

- `domain/` — modelos y contratos
- `application/` — casos de uso / lógica de aplicación
- `infrastructure/` — adaptadores (Axios, repositorios HTTP)
- `presentation/` — vistas, componentes y stores
