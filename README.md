# 🏥 Obra Social Almedin — Frontend

SPA completa para un sistema de gestión de obra social médica, desarrollada con **React 18 + TypeScript + Vite**. Implementa tres portales diferenciados por rol (Administrador, Afiliado, Especialista) con sistema de diseño propio, modo oscuro/claro, y notificaciones en tiempo real vía SSE.

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen?logo=vercel)](https://obra-social-almedin-v2-frontend.vercel.app)
[![Backend](https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger&logoColor=black)](https://obra-social-almedin-v2-backend-latest.onrender.com/q/swagger-ui)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Demo](#-demo)
- [Descripción](#-descripción)
- [Tech Stack](#-tech-stack)
- [Arquitectura y estructura](#-arquitectura-y-estructura)
- [Sistema de diseño](#-sistema-de-diseño)
- [Portales por rol](#-portales-por-rol)
- [Autenticación y sesión](#-autenticación-y-sesión)
- [Notificaciones en tiempo real](#-notificaciones-en-tiempo-real)
- [Responsive](#-responsive)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Variables de entorno](#-variables-de-entorno)
- [Decisiones técnicas](#-decisiones-técnicas)

---

## 🌐 Demo

**[→ Ver demo en vivo](https://obra-social-almedin-v2-frontend.vercel.app)**

Credenciales de prueba:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@almedin.com | Admin1234! |
| Afiliado | johndoe@mail.com | password1234 |
| Especialista | ana@email.com | password1234 |

---

## 📌 Descripción

Portal web completo para una obra social médica con tres roles diferenciados:

- **Admin**: gestión completa de afiliados, especialistas, turnos, horarios y penalidades
- **Afiliado**: reserva de turnos con validación de disponibilidad, historial y perfil
- **Especialista**: agenda diaria, gestión de pacientes, horarios y notificaciones en tiempo real

El proyecto fue desarrollado con foco en **experiencia de usuario real**: validaciones de negocio en el frontend (no solo en el backend), feedback inmediato con toasts, estados de carga, manejo de errores y una interfaz consistente en todos los flujos.

---

## 💻 Tech Stack

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 18 |
| Lenguaje | TypeScript 5 |
| Build tool | Vite 6 |
| Estilos | CSS custom con design tokens |
| Estado global | Zustand + persist middleware |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Routing | React Router v6 |
| Formularios | Estado controlado con validación custom |
| Calendario | React Day Picker |
| Notificaciones RT | EventSource (SSE) nativo |
| Sesión | Cookie HttpOnly + Zustand persist |
| Deploy | Vercel |

---

## 🏛️ Arquitectura y estructura

El proyecto sigue una **arquitectura por features**, donde cada módulo agrupa sus páginas, componentes específicos y lógica relacionada. Los componentes compartidos y el sistema de diseño viven en capas separadas.

---

### Flujo de datos

```
Usuario → Componente → TanStack Query (cache + loading/error) → Axios (JWT header) → API
```

---

## 🎨 Sistema de diseño

El proyecto implementa un **sistema de diseño propio** basado en CSS custom properties, sin librerías de componentes UI como MUI o Ant Design. 

### Tipografía

- **Display**: Playfair Display — headings y métricas
- **Body**: Inter — texto general

### Modo oscuro / claro

Implementado via atributo `data-theme` en el `<html>` con CSS custom properties. El toggle persiste en `localStorage` y aplica sin flash al cargar la página.

---

## 👥 Portales por rol

### 🛡️ Admin

| Página | Funcionalidades |
|--------|----------------|
| Dashboard | Métricas globales: afiliados activos, especialistas, turnos del día/semana/mes, estadísticas por estado |
| Afiliados | CRUD completo, paginación, búsqueda, filtro includeInactive, soft delete |
| Especialistas | CRUD completo, filtro por especialidad, paginación |
| Turnos | Listado global con filtros por estado, cancelación con motivo |
| Horarios | Gestión de horarios semanales por especialista, períodos de no disponibilidad |
| Penalidades | Listado, filtros, desactivación manual |

### 🧑 Afiliado

| Página | Funcionalidades |
|--------|----------------|
| Dashboard | Próximos turnos, métricas personales, alerta de penalidad activa |
| Mis turnos | Historial completo, filtros por estado, panel de detalle con notas clínicas |
| Reservar turno | Stepper de 3 pasos: especialista → fecha/horario con validación → confirmación |
| Mi perfil | Datos personales editables, cambio de contraseña |

#### Flujo de reserva de turno

El stepper valida en tiempo real contra el backend:
1. Deshabilita días sin horario configurado por el especialista
2. Deshabilita días marcados como no disponibles
3. Deshabilita fechas pasadas
4. Solo muestra slots libres (excluye los ya ocupados)

### 🩺 Especialista

| Página | Funcionalidades |
|--------|----------------|
| Dashboard | Agenda del día, próximos turnos, métricas |
| Agenda | Filtros por estado y búsqueda, acciones: completar con notas + prescripción, marcar ausente, cancelar, derivar |
| Pacientes | Agrupados por afiliado con historial de visitas, notas clínicas y prescripciones |
| Horarios | CRUD de horarios semanales y períodos de no disponibilidad |
| Perfil | Datos editables, cambio de contraseña |

---

## 🔒 Autenticación y sesión

- Al hacer login el backend retorna el JWT y setea una **cookie HttpOnly** 
- **Zustand persist** guarda en `localStorage` para mantener la sesión entre recargas
- Al entrar a `/` el usuario logueado ve su panel en lugar del botón de login
- Entrar a `/login` estando autenticado redirige automáticamente al dashboard correspondiente
- El logout limpia el store y la cookie
- Los **ProtectedRoutes** verifican token y rol antes de renderizar cualquier página privada
- El interceptor de Axios captura el 401 automáticamente: limpia la sesión y redirige a login

---

## 🔔 Notificaciones en tiempo real

Los especialistas reciben notificaciones instantáneas cuando un afiliado reserva o cancela un turno.

**Implementación**: La autenticación viaja via cookie HttpOnly. `EventSource` no soporta headers `Authorization`, por lo que se usa la cookie en lugar de Bearer token.

```
Afiliado reserva turno
       ↓
Backend persiste + NotificationService.notify()
       ↓
BroadcastProcessor (Mutiny) → SSE stream abierto
       ↓
useNotifications hook → setNotifications + setUnread
       ↓
NotificationBell: badge con contador + dropdown historial
```

---

## 📱 Responsive

Todos los layouts tienen diseño responsive con breakpoint en 768px:

- **Desktop** (≥769px): sidebar/nav visible, contenido completo
- **Mobile** (≤768px): hamburger menu, drawer lateral con overlay

Los tres layouts comparten el componente `MobileMenu` con animación slide-in, overlay, cierre con ESC o click fuera, y bloqueo de scroll del body.

---

## 🚀 Cómo correr el proyecto

### Requisitos

- Node.js 18+
- Backend corriendo (ver [repositorio del backend](https://github.com/nicolasjitorres/obra-social-almedin-v2-backend))

### Instalación

```bash
git clone https://github.com/nicolasjitorres/obra-social-almedin-v2-frontend.git
cd obra-social-almedin-v2-frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`. El proxy de Vite redirige `/api` a `http://localhost:8080` automáticamente, no hay CORS en desarrollo.

### Build de producción

```bash
npm run build
npm run preview   # previsualizar el build localmente con variables de producción
```

---

## 🔧 Variables de entorno

| Variable | Dev | Prod |
|----------|-----|------|
| `VITE_API_URL` | `/api` (proxy Vite) | URL completa del backend en Render |

Crear `.env.production.local` para probar el build de producción localmente:

```env
VITE_API_URL= *url de la API*
```

---

## 🧠 Decisiones técnicas

### ¿Por qué CSS custom en lugar de Tailwind o MUI?

Tailwind y MUI aceleran el desarrollo pero producen interfaces que se parecen entre sí. El objetivo fue construir un sistema de diseño propio: tokens semánticos, paleta coherente, tipografía display + body, y un dark mode real.

### ¿Por qué TanStack Query?

`useEffect` para fetching produce race conditions, loading states manuales y lógica de cache duplicada. TanStack Query resuelve todo esto de forma declarativa — cuando se crea o cancela un turno, las queries relacionadas se invalidan y refrescan automáticamente sin código adicional.

### ¿Por qué Zustand?

Redux tiene demasiado boilerplate para un estado tan simple como `{ user, token }`. Context API re-renderiza todo el árbol en cada cambio. Zustand es minimalista, tiene `persist` middleware integrado y permite leer el estado **fuera de componentes**, necesario en los interceptors de Axios donde no hay hooks disponibles.

### Cookie HttpOnly para SSE

`EventSource` no soporta el header `Authorization`, lo que hace imposible enviar el Bearer token de la forma habitual. Elegí la cookie porque es la opción segura ya que el token no es accesible desde JavaScript y no aparece en logs de acceso.

---

## 📄 Licencia

MIT © [nicolasjitorres](https://github.com/nicolasjitorres)