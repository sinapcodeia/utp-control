# Guía de Despliegue en la Nube (Vercel + Railway)

Esta guía detalla los pasos para desplegar UTP CONTROL en la nube usando el enfoque de microservicios.

## 1. Backend (Railway.app)

Railway es ideal para NestJS porque soporta Dockerfiles y bases de datos.

### Pasos:
1.  Inicia sesión en [Railway.app](https://railway.app/) y crea un **New Project**.
2.  Selecciona **Deploy from GitHub repo** y elige `utp-control`.
3.  **Configuración del Servicio (API):**
    -   Ve a **Settings** -> **General** -> **Root Directory**: Pon `/`. 
    -   Bajo **Build**, Railway detectará el Dockerfile. Como tenemos varios, ve a **Settings** -> **Build** -> **Docker** y asegúrate de que use `apps/api/Dockerfile.prod`.
    -   **Variables de Entorno (IMPORTANTE):** Agrega todas las variables de `apps/api/.env.production`.
        -   `DATABASE_URL` (Usa tu cadena de Supabase).
        -   `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, etc.
        -   `PORT`: `3001` (o lo que Railway asigne, usualmente el puerto interno es 3001).
4.  Railway te dará una URL (ejemplo: `api-production.up.railway.app`). **Cópiala**, la necesitaremos para el frontend.

## 2. Frontend (Vercel.com)

Vercel es el hogar natural de Next.js.

### Pasos:
1.  Inicia sesión en [Vercel.com](https://vercel.com/) y haz clic en **Add New** -> **Project**.
2.  Importa el repositorio `utp-control`.
3.  **Configuración del Proyecto:**
    -   **Framework Preset:** Next.js.
    -   **Root Directory:** Haz clic en Edit y selecciona `apps/web`.
4.  **Variables de Entorno:** Agrega las de `apps/web/.env.production`:
    -   `NEXT_PUBLIC_API_URL`: **Pega aquí la URL que te dio Railway** (ASEGÚRATE de que no termine en `/`).
    -   `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase.
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave anon de Supabase.
    -   `NEXT_PUBLIC_VAPID_KEY`: Tu clave VAPID pública.
5.  Haz clic en **Deploy**.

## 🔄 Flujo de Actualización
A partir de ahora, cada vez que hagas:
```bash
git add .
git commit -m "un cambio"
git push origin main
```
Tanto Vercel como Railway detectarán el cambio y se actualizarán automáticamente. 🚀
