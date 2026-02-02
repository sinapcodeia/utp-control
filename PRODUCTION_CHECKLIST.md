# ✅ Checklist de Producción - UTP CONTROL

**Fecha**: 2026-01-29  
**Versión**: 1.0.0  
**Estado**: 🚀 **Listo para Deploy**

---

## 📋 Pre-Deploy Checklist

### **1. Build & Compilación** ✅
- [x] Build de producción exitoso
- [x] Sin errores de TypeScript
- [x] Sin errores de lint críticos
- [x] PWA configurada correctamente
- [x] Service Worker generado

### **2. Variables de Entorno** ⚠️
- [ ] `NEXT_PUBLIC_API_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` configurada (para push notifications)
- [ ] Backend: `DATABASE_URL` configurada
- [ ] Backend: `SUPABASE_URL` configurada
- [ ] Backend: `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Backend: `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` (para push notifications)

### **3. Base de Datos** ⚠️
- [x] Schema de Prisma actualizado
- [ ] Migraciones ejecutadas en producción
- [ ] Datos de prueba eliminados (si aplica)
- [ ] Índices optimizados
- [ ] Backup configurado

### **4. Seguridad** ⚠️
- [x] HTTPS configurado (requerido para PWA)
- [x] CORS configurado correctamente
- [x] Helmet headers habilitados
- [x] JWT con validación multi-algoritmo
- [ ] Rate limiting configurado
- [ ] Variables sensibles en `.env` (no en código)

### **5. PWA** ✅
- [x] Manifest.json configurado
- [x] Iconos generados (192x192, 512x512)
- [x] Service Worker activo
- [x] Metadata completa
- [x] Installable en móviles
- [ ] Testing en dispositivos reales

### **6. Notificaciones Push** 📋
- [x] Código implementado
- [ ] VAPID keys generadas para producción
- [ ] Modelo `PushSubscription` en BD
- [ ] Variables de entorno configuradas
- [ ] Testing end-to-end

### **7. Performance** ⚠️
- [ ] Lighthouse audit > 90
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado
- [ ] Caché configurado
- [ ] CDN para assets estáticos (opcional)

### **8. Monitoreo** 📋
- [ ] Error tracking (Sentry/similar)
- [ ] Analytics configurado
- [ ] Logs centralizados
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## 🚀 Pasos para Deploy

### **Opción A: Vercel (Frontend)**

1. **Conectar Repositorio**
   ```bash
   # Push a GitHub
   git add .
   git commit -m "feat: PWA + Push Notifications ready for production"
   git push origin main
   ```

2. **Configurar en Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Build Command: `pnpm build --webpack`
   - Output Directory: `.next`

3. **Variables de Entorno**
   ```env
   NEXT_PUBLIC_API_URL=https://tu-api.com
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_public_key
   ```

4. **Deploy**
   - Clic en "Deploy"
   - Esperar build
   - ✅ App desplegada

### **Opción B: Railway/Render (Backend)**

1. **Preparar Dockerfile** (ya existe)
   ```dockerfile
   # apps/api/Dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npx prisma generate
   EXPOSE 3001
   CMD ["npm", "run", "start:prod"]
   ```

2. **Configurar en Railway**
   - Conectar repositorio
   - Root Directory: `apps/api`
   - Variables de entorno:
   ```env
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   ```

3. **Deploy**
   - Railway detecta Dockerfile automáticamente
   - Build y deploy automático

### **Opción C: Docker Compose (Self-Hosted)**

1. **Build Images**
   ```bash
   docker compose build
   ```

2. **Configurar `.env`**
   ```env
   # Ver .env.example
   ```

3. **Deploy**
   ```bash
   docker compose up -d
   ```

---

## 🧪 Testing Post-Deploy

### **1. PWA**
- [ ] Abrir app en móvil
- [ ] Verificar prompt de instalación
- [ ] Instalar app
- [ ] Verificar icono en pantalla de inicio
- [ ] Abrir app instalada
- [ ] Verificar pantalla completa
- [ ] Probar offline (modo avión)

### **2. Funcionalidades Core**
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] KPIs se muestran
- [ ] Generación de PDF funciona
- [ ] Mapa de cobertura carga
- [ ] Alertas se muestran

### **3. Roles**
- [ ] ADMIN: Dashboard CEO funciona
- [ ] COORDINATOR: Dashboard operativo funciona
- [ ] GESTOR: Vista de campo funciona
- [ ] Permisos territoriales funcionan

### **4. Performance**
- [ ] Tiempo de carga < 3s
- [ ] Lighthouse PWA score > 90
- [ ] Sin errores en consola
- [ ] Sin warnings críticos

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Lighthouse Performance | > 90 | - |
| Lighthouse PWA | > 90 | - |
| Tiempo de carga (3G) | < 5s | - |
| Tiempo de carga (4G) | < 3s | - |
| Instalaciones PWA | > 50% usuarios móviles | - |
| Tasa de error | < 1% | - |
| Uptime | > 99.9% | - |

---

## 🔧 Configuración Recomendada

### **Vercel (Frontend)**
```json
{
  "buildCommand": "pnpm build --webpack",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@production-api-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### **Railway (Backend)**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🐛 Troubleshooting

### **Build falla en Vercel**
- Verificar que `pnpm build --webpack` funciona localmente
- Revisar logs de build en Vercel
- Verificar que todas las dependencias están en `package.json`

### **PWA no se instala**
- Verificar que el sitio está en HTTPS
- Verificar que `manifest.json` es accesible
- Revisar consola del navegador
- Verificar que Service Worker está activo

### **API no conecta**
- Verificar `NEXT_PUBLIC_API_URL` en frontend
- Verificar CORS en backend
- Verificar que API está desplegada y accesible
- Revisar logs del backend

### **Notificaciones no funcionan**
- Verificar VAPID keys configuradas
- Verificar permisos del navegador
- Verificar que `web-push` está instalado en backend
- Revisar logs de errores

---

## 📚 Documentación para el Equipo

### **Para Desarrolladores**
- `README.md` - Guía de inicio
- `DOCUMENTATION_INDEX.md` - Índice de toda la documentación
- `PROJECT_SUMMARY.md` - Resumen ejecutivo
- `PWA_README.md` - Documentación técnica PWA
- `PUSH_NOTIFICATIONS_README.md` - Documentación técnica Push

### **Para Usuarios**
- `PWA_INSTALLATION_GUIDE.md` - Cómo instalar la app
- Tutoriales en video (recomendado)
- FAQ en la app

### **Para Stakeholders**
- `CEO_DASHBOARD_IMPLEMENTATION.md` - Dashboard ejecutivo
- `NORTH_STAR_KPI_IMPLEMENTATION.md` - KPIs y métricas
- `ROADMAP_ADVANCED_FEATURES.md` - Funcionalidades futuras

---

## ✅ Checklist Final

### **Antes de Deploy**
- [x] Build exitoso
- [x] Código en repositorio
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD ejecutadas
- [ ] Testing local completo
- [ ] Documentación actualizada

### **Durante Deploy**
- [ ] Frontend desplegado
- [ ] Backend desplegado
- [ ] BD configurada
- [ ] Variables de entorno verificadas
- [ ] Health check OK

### **Después de Deploy**
- [ ] Testing en producción
- [ ] PWA instalable
- [ ] Todas las funcionalidades funcionan
- [ ] Performance aceptable
- [ ] Monitoreo activo
- [ ] Equipo notificado

---

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos:

1. ✅ **Frontend**: Desplegado en Vercel
2. ✅ **Backend**: Desplegado en Railway/Render
3. ✅ **BD**: Migraciones ejecutadas
4. ✅ **PWA**: Instalable en móviles
5. ✅ **Monitoreo**: Activo
6. ✅ **Documentación**: Completa

**URL de Producción**: `https://tu-dominio.vercel.app`

---

**Versión**: 1.0.0  
**Última actualización**: 2026-01-29  
**Estado**: 🚀 **Ready to Deploy**
