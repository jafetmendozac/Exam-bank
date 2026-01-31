# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:
# Exam Bank

Aplicación web para gestionar y compartir exámenes (banco de exámenes), desarrollada con React + Vite y Firebase.

## Descripción

Exam Bank permite a usuarios subir, listar y gestionar exámenes. Incluye autenticación, roles (administrador/usuario), páginas para administración y funcionalidades serverless en `functions/`.

## Tecnologías principales

- TypeScript
- React (Vite)
- Firebase (Auth, Firestore, Storage, Functions)
- Node.js (para `functions/`)

## Requisitos

- Node.js (recomendado ≥ 16)
- npm o pnpm/yarn
- Cuenta y proyecto de Firebase

## Instalación

1. Clona el repositorio:

```bash
git clone <tu-repo-url>
cd Exam-bank
```

2. Instala dependencias:

```bash
npm install
# o
# pnpm install
# yarn install
```

3. Configura Firebase: añade credenciales / variables de entorno necesarias y revisa `src/app/firebase.ts`.

## Desarrollo (frontend)

Inicia la app en modo desarrollo con Vite:

```bash
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`).

## Cloud Functions (backend)

Las funciones están en `functions/`. Pasos básicos:

```bash
cd functions
npm install
# Si hay compilación TS:
npm run build
# Emular funciones localmente:
firebase emulators:start --only functions
```

Recuerda instalar y configurar el Firebase CLI (`firebase login`) y seleccionar tu proyecto (`firebase use --add`).

## Scripts útiles

- `npm run dev` — Inicia el servidor de desarrollo (Vite)
- `npm run build` — Genera la versión de producción
- `npm run preview` — Sirve la build localmente
- En `functions/`: scripts para compilar y desplegar funciones (revisa `functions/package.json`).

## Estructura del proyecto (resumen)

- `src/` — Código frontend (React + TSX)
  - `src/app/firebase.ts` — Inicialización de Firebase
  - `src/app/router.tsx` — Rutas de la aplicación
  - `auth/` — Páginas y lógica de autenticación
  - `exams/` — Componentes, servicios y páginas relacionadas con exámenes
  - `shared/` — Componentes y utilidades reutilizables
- `functions/` — Cloud Functions en TypeScript
- `public/` — Archivos estáticos

## Despliegue

1. Genera la build del frontend:

```bash
npm run build
```

2. Despliega con Firebase (hosting y functions):

```bash
firebase deploy
```

Consulta la guía de Firebase para opciones avanzadas y entornos.

## Contribuir

1. Abre un issue describiendo la mejora o bug.
2. Crea una rama `feature/descripcion`.
3. Envía un pull request con una descripción clara.

## Contacto / Ajustes

Si quieres que adapte este README (añadir badges, screenshots, comandos exactos para `functions`, CI o instrucciones de despliegue más detalladas), dime qué prefieres y lo actualizo.

---

_(Generado y personalizado para este repositorio.)_
