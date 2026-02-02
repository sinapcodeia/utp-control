# 🔔 Notificaciones Push - UTP CONTROL

## ✅ Implementación Completa

Las **notificaciones push** permiten enviar alertas en tiempo real a los usuarios, incluso cuando la app está cerrada.

---

## 🚀 Componentes Implementados

### **Frontend** (`apps/web`)

1. **`NotificationPermission.tsx`**
   - Componente para solicitar permisos
   - Gestión de suscripciones push
   - UI premium con gradiente ámbar
   - Persistencia de estado

2. **Integración en Layout**
   - Componente agregado al layout principal
   - Se muestra automáticamente si no hay permisos

### **Backend** (`apps/api`)

1. **`notifications.controller.ts`**
   - `POST /notifications/subscribe` - Guardar suscripción
   - `POST /notifications/unsubscribe` - Eliminar suscripción
   - `POST /notifications/send-test` - Enviar notificación de prueba

2. **`notifications.service.ts`**
   - Gestión de suscripciones en BD
   - Envío de notificaciones con `web-push`
   - Métodos para enviar a usuario específico o por rol

3. **`notifications.module.ts`**
   - Módulo NestJS completo
   - Exporta `NotificationsService` para uso en otros módulos

---

## 📦 Dependencias Necesarias

### **Backend**
```bash
cd apps/api
pnpm add web-push
pnpm add -D @types/web-push
```

### **Base de Datos**
Agregar modelo a `schema.prisma`:
```prisma
model PushSubscription {
  id             String   @id @default(uuid())
  userId         String   @unique @map("user_id")
  endpoint       String
  p256dh         String
  auth           String
  expirationTime DateTime? @map("expiration_time")
  createdAt      DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("push_subscriptions")
}
```

Luego ejecutar:
```bash
npx prisma migrate dev --name add_push_subscriptions
```

---

## 🔑 VAPID Keys (Importante)

### **Generar Keys de Producción**

```bash
cd apps/api
npx web-push generate-vapid-keys
```

**Output**:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xYjEB6hvqRxYmjfIAjXbLNilO5Oy4Fj3qvnB2hhEAJmRYjqXhqE8s
Private Key: UUxI4O8TWsK7eoZd-5Kz7neSt3KBH7NOX8mYTc8VfiY
```

### **Configurar Variables de Entorno**

**`apps/api/.env`**:
```env
VAPID_PUBLIC_KEY=tu_public_key_aqui
VAPID_PRIVATE_KEY=tu_private_key_aqui
```

**`apps/web/.env.local`**:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_public_key_aqui
```

⚠️ **IMPORTANTE**: Las keys del ejemplo son solo para desarrollo. **Genera nuevas keys para producción**.

---

## 🎯 Casos de Uso

### **1. Enviar Notificación a Usuario Específico**

```typescript
// Desde cualquier servicio
constructor(private notificationsService: NotificationsService) {}

async sendAlert(userId: string) {
  await this.notificationsService.sendNotificationToUser(
    userId,
    '🔴 Alerta Crítica',
    'Se detectó una alerta en tu región',
    '/dashboard/news'
  );
}
```

### **2. Enviar Notificación a Todos los Gestores**

```typescript
await this.notificationsService.sendNotificationToRole(
  'GESTOR',
  '📋 Nueva Visita Asignada',
  'Tienes 3 visitas pendientes para hoy',
  '/dashboard?view=agenda'
);
```

### **3. Enviar Notificación a Coordinadores**

```typescript
await this.notificationsService.sendNotificationToRole(
  'COORDINATOR',
  '📊 Informe Mensual Disponible',
  'El informe de enero ya está listo',
  '/dashboard/reports'
);
```

---

## 🔔 Tipos de Notificaciones Recomendadas

### **Para Gestores**
- ✅ Nueva visita asignada
- ✅ Recordatorio de visita pendiente
- ✅ Alerta crítica en su zona
- ✅ Cambio en programación

### **Para Coordinadores**
- ✅ Alerta crítica territorial
- ✅ Informe mensual disponible
- ✅ Gestor inactivo detectado
- ✅ Riesgo territorial alto

### **Para CEO/Admin**
- ✅ ICOE por debajo del umbral
- ✅ Región en riesgo crítico
- ✅ Alerta de seguridad nacional
- ✅ Informe ejecutivo listo

---

## 🎨 Personalización de Notificaciones

### **Estructura del Payload**

```typescript
{
  title: 'UTP CONTROL',
  body: 'Mensaje de la notificación',
  icon: '/icon-192x192.png',
  badge: '/icon-192x192.png',
  data: {
    url: '/dashboard/news',
    alertId: '123',
    priority: 'HIGH'
  },
  actions: [
    {
      action: 'view',
      title: 'Ver Detalles'
    },
    {
      action: 'dismiss',
      title: 'Cerrar'
    }
  ]
}
```

### **Manejar Clicks en Notificaciones**

Agregar en `public/sw.js` (generado automáticamente por PWA):
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url || '/dashboard';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

---

## 📊 Monitoreo y Métricas

### **Verificar Suscripciones Activas**

```sql
SELECT 
  u.full_name,
  u.role,
  ps.created_at,
  ps.expiration_time
FROM push_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.expiration_time IS NULL OR ps.expiration_time > NOW()
ORDER BY ps.created_at DESC;
```

### **Estadísticas de Envío**

```typescript
// En el servicio
async getNotificationStats() {
  const total = await this.prisma.pushSubscription.count();
  const byRole = await this.prisma.pushSubscription.groupBy({
    by: ['user.role'],
    _count: true
  });
  
  return { total, byRole };
}
```

---

## 🧪 Testing

### **1. Probar Permisos**
1. Abrir la app
2. Esperar el prompt de notificaciones
3. Clic en "Activar Notificaciones"
4. Permitir en el navegador

### **2. Enviar Notificación de Prueba**
```bash
curl -X POST http://localhost:3001/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Verificar en DevTools**
1. F12 → Application → Service Workers
2. Verificar que el SW está activo
3. Application → Push Messaging
4. Verificar suscripción

---

## 🔐 Seguridad

### **Buenas Prácticas**

✅ **VAPID Keys únicas** por entorno (dev/staging/prod)
✅ **Validar usuario** antes de enviar notificación
✅ **Rate limiting** para evitar spam
✅ **Expiración de suscripciones** (renovar cada 30 días)
✅ **Logs de envío** para auditoría

### **Prevenir Abusos**

```typescript
// Rate limiting en el controller
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 por minuto
@Post('send-test')
async sendTest(@Request() req) {
  // ...
}
```

---

## 🌐 Compatibilidad

| Navegador | Desktop | Mobile | Notas |
|-----------|---------|--------|-------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ✅ | ⚠️ | iOS 16.4+ |
| Edge | ✅ | ✅ | Full support |
| Opera | ✅ | ✅ | Full support |

⚠️ **iOS Safari**: Requiere iOS 16.4+ y la app debe estar instalada como PWA.

---

## 🐛 Troubleshooting

### **Las notificaciones no llegan**
- Verificar que el Service Worker está activo
- Revisar que la suscripción está guardada en BD
- Verificar VAPID keys en backend
- Revisar logs del servidor

### **Error "Subscription expired"**
- La suscripción expiró
- Solicitar nuevos permisos
- Actualizar suscripción en BD

### **Notificaciones bloqueadas**
- Usuario bloqueó permisos manualmente
- Mostrar instrucciones para desbloquear en configuración del navegador

---

## 📚 Recursos Adicionales

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push library](https://github.com/web-push-libs/web-push)

---

## ✅ Checklist de Implementación

- [x] Instalar `web-push` en backend
- [x] Crear modelo `PushSubscription` en Prisma
- [x] Ejecutar migración de BD (tabla creada manualmente en Supabase)
- [x] Generar VAPID keys de producción
- [x] Configurar variables de entorno (backend y frontend)
- [x] Crear `NotificationsService`
- [x] Crear `NotificationsController`
- [x] Crear componente `NotificationPermission`
- [x] Agregar `NotificationsModule` a `app.module.ts`
- [x] Generar cliente de Prisma actualizado
- [ ] Testing en producción
- [ ] Documentar para usuarios finales

---

**Versión**: 1.0.0  
**Última actualización**: 2026-01-31  
**Estado**: ✅ **Implementación Completa - Lista para Testing**
