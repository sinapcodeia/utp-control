# 🚀 Roadmap - Funcionalidades Avanzadas de Visitas

## 📋 Resumen Ejecutivo

**Fecha:** 29 de enero de 2026  
**Objetivo:** Implementar funcionalidades avanzadas para el módulo de gestión de visitas  
**Prioridad:** P2 (Mejoras de Producto)  
**Estado:** 📝 PLANIFICACIÓN

---

## 🎯 Funcionalidades Propuestas

### **1. Google Maps Integration - Navegación GPS** 🗺️
**Prioridad:** Alta  
**Tiempo Estimado:** 8 horas  
**Complejidad:** 7/10

#### **Descripción:**
Integrar Google Maps para proporcionar navegación GPS en tiempo real desde la ubicación actual del gestor hasta el punto de visita.

#### **Características:**
- ✅ Mostrar ubicación actual del gestor
- ✅ Trazar ruta óptima al punto de visita
- ✅ Navegación paso a paso
- ✅ Tiempo estimado de llegada (ETA)
- ✅ Distancia al destino
- ✅ Opciones de ruta (más rápida, más corta)

#### **Tecnologías:**
- Google Maps JavaScript API
- Google Directions API
- Geolocation API
- React Google Maps (@react-google-maps/api)

#### **Implementación:**

##### **Backend:**
```typescript
// apps/api/src/visits/visits.service.ts

async getDirections(visitId: string, userLocation: { lat: number, lng: number }) {
    const visit = await this.prisma.visit.findUnique({
        where: { id: visitId }
    });

    if (!visit.latitude || !visit.longitude) {
        throw new Error('Visita sin coordenadas GPS');
    }

    // Llamar a Google Directions API
    const directions = await this.googleMapsService.getDirections({
        origin: userLocation,
        destination: { lat: visit.latitude, lng: visit.longitude },
        mode: 'DRIVING'
    });

    return directions;
}
```

##### **Frontend:**
```tsx
// apps/web/src/components/dashboard/gestor/VisitMap.tsx

import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';

export function VisitMap({ visit }: { visit: Visit }) {
    const [directions, setDirections] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Obtener ubicación actual
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        });
    }, []);

    const handleNavigate = async () => {
        const response = await fetch(`/api/visits/${visit.id}/directions`, {
            method: 'POST',
            body: JSON.stringify({ userLocation })
        });
        const data = await response.json();
        setDirections(data);
    };

    return (
        <GoogleMap
            center={userLocation || { lat: visit.latitude, lng: visit.longitude }}
            zoom={15}
        >
            {directions && <DirectionsRenderer directions={directions} />}
            <Marker position={{ lat: visit.latitude, lng: visit.longitude }} />
        </GoogleMap>
    );
}
```

#### **Variables de Entorno:**
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### **Costos:**
- Google Maps API: ~$7 por 1000 solicitudes
- Estimado mensual: $50-100 (dependiendo del uso)

---

### **2. Push Notifications - Recordatorios de Visitas** 🔔
**Prioridad:** Alta  
**Tiempo Estimado:** 6 horas  
**Complejidad:** 6/10

#### **Descripción:**
Implementar notificaciones push para recordar a los gestores sobre visitas programadas.

#### **Características:**
- ✅ Recordatorio 1 hora antes de la visita
- ✅ Recordatorio el día anterior
- ✅ Notificación de visita reasignada
- ✅ Notificación de nueva visita asignada
- ✅ Configuración de preferencias de notificaciones

#### **Tecnologías:**
- Firebase Cloud Messaging (FCM)
- Web Push API
- Service Workers
- Cron Jobs (node-cron)

#### **Implementación:**

##### **Backend:**
```typescript
// apps/api/src/notifications/notifications.service.ts

import * as admin from 'firebase-admin';
import * as cron from 'node-cron';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {
        // Inicializar Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY
            })
        });

        // Programar verificación cada hora
        cron.schedule('0 * * * *', () => this.checkUpcomingVisits());
    }

    async checkUpcomingVisits() {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

        const upcomingVisits = await this.prisma.visit.findMany({
            where: {
                scheduledAt: {
                    gte: new Date(),
                    lte: oneHourFromNow
                },
                status: 'ASSIGNED'
            },
            include: {
                assignedTo: true
            }
        });

        for (const visit of upcomingVisits) {
            await this.sendNotification(visit.assignedTo.id, {
                title: 'Recordatorio de Visita',
                body: `Visita a ${visit.fullName} en 1 hora`,
                data: {
                    visitId: visit.id,
                    type: 'VISIT_REMINDER'
                }
            });
        }
    }

    async sendNotification(userId: string, notification: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user.fcmToken) return;

        await admin.messaging().send({
            token: user.fcmToken,
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: notification.data
        });
    }
}
```

##### **Frontend:**
```typescript
// apps/web/src/utils/notifications.ts

export async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        // Guardar token en backend
        await fetch('/api/users/fcm-token', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    }
}
```

#### **Variables de Entorno:**
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

---

### **3. Vista de Mapa - Visualizar Todas las Visitas** 🗺️
**Prioridad:** Media  
**Tiempo Estimado:** 6 horas  
**Complejidad:** 5/10

#### **Descripción:**
Vista de mapa que muestra todas las visitas asignadas con marcadores coloreados según estado.

#### **Características:**
- ✅ Mapa con todas las visitas
- ✅ Marcadores coloreados por estado
- ✅ Clustering de marcadores cercanos
- ✅ Info window con detalles al hacer click
- ✅ Filtrado en tiempo real
- ✅ Vista de calor (heatmap)

#### **Implementación:**

```tsx
// apps/web/src/app/dashboard/visits/map/page.tsx

'use client';

import { GoogleMap, Marker, MarkerClusterer, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

export default function VisitsMapPage() {
    const [visits, setVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        const response = await fetch('/api/territory/my-visits');
        const data = await response.json();
        setVisits(data.filter(v => v.latitude && v.longitude));
    };

    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'yellow';
            case 'ASSIGNED': return 'blue';
            case 'IN_PROGRESS': return 'orange';
            case 'COMPLETED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'gray';
        }
    };

    return (
        <div className="h-screen w-full">
            <GoogleMap
                center={{ lat: 6.2442, lng: -75.5812 }} // Medellín
                zoom={12}
                mapContainerStyle={{ width: '100%', height: '100%' }}
            >
                <MarkerClusterer>
                    {(clusterer) =>
                        visits.map((visit) => (
                            <Marker
                                key={visit.id}
                                position={{ lat: visit.latitude, lng: visit.longitude }}
                                clusterer={clusterer}
                                onClick={() => setSelectedVisit(visit)}
                                icon={{
                                    url: `http://maps.google.com/mapfiles/ms/icons/${getMarkerColor(visit.status)}-dot.png`
                                }}
                            />
                        ))
                    }
                </MarkerClusterer>

                {selectedVisit && (
                    <InfoWindow
                        position={{ lat: selectedVisit.latitude, lng: selectedVisit.longitude }}
                        onCloseClick={() => setSelectedVisit(null)}
                    >
                        <div className="p-4">
                            <h3 className="font-bold">{selectedVisit.fullName}</h3>
                            <p className="text-sm">{selectedVisit.addressText}</p>
                            <p className="text-xs text-gray-500">Estado: {selectedVisit.status}</p>
                            <button
                                onClick={() => window.location.href = `/dashboard/visits/${selectedVisit.id}`}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Ver Detalles
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
```

---

### **4. Filtros Avanzados - Por Estado, Prioridad, Región** 🔍
**Prioridad:** Media  
**Tiempo Estimado:** 4 horas  
**Complejidad:** 4/10

#### **Descripción:**
Sistema de filtros avanzados para búsqueda y organización de visitas.

#### **Características:**
- ✅ Filtro por estado (múltiple)
- ✅ Filtro por prioridad
- ✅ Filtro por región/municipio
- ✅ Filtro por rango de fechas
- ✅ Búsqueda por texto
- ✅ Ordenamiento personalizado
- ✅ Guardar filtros favoritos

#### **Implementación:**

```tsx
// apps/web/src/components/dashboard/gestor/VisitFilters.tsx

export function VisitFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [filters, setFilters] = useState({
        status: [],
        priority: [],
        regionId: null,
        dateFrom: null,
        dateTo: null,
        search: ''
    });

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="font-black text-lg mb-4">Filtros Avanzados</h3>

            {/* Búsqueda */}
            <Input
                placeholder="Buscar por nombre o dirección..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="mb-4"
            />

            {/* Estado */}
            <div className="mb-4">
                <label className="font-bold text-sm mb-2 block">Estado</label>
                <div className="space-y-2">
                    {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                        <label key={status} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.status.includes(status)}
                                onChange={(e) => {
                                    const newStatus = e.target.checked
                                        ? [...filters.status, status]
                                        : filters.status.filter(s => s !== status);
                                    handleFilterChange('status', newStatus);
                                }}
                                className="mr-2"
                            />
                            {status}
                        </label>
                    ))}
                </div>
            </div>

            {/* Prioridad */}
            <div className="mb-4">
                <label className="font-bold text-sm mb-2 block">Prioridad</label>
                <Select
                    value={filters.priority}
                    onValueChange={(value) => handleFilterChange('priority', value)}
                >
                    <option value="">Todas</option>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                </Select>
            </div>

            {/* Rango de Fechas */}
            <div className="mb-4">
                <label className="font-bold text-sm mb-2 block">Rango de Fechas</label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                    <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                </div>
            </div>

            {/* Botón Limpiar */}
            <Button
                variant="outline"
                onClick={() => {
                    setFilters({
                        status: [],
                        priority: [],
                        regionId: null,
                        dateFrom: null,
                        dateTo: null,
                        search: ''
                    });
                    onFilterChange({});
                }}
                className="w-full"
            >
                Limpiar Filtros
            </Button>
        </div>
    );
}
```

---

### **5. Exportar PDF - Itinerario del Día** 📄
**Prioridad:** Media  
**Tiempo Estimado:** 5 horas  
**Complejidad:** 5/10

#### **Descripción:**
Generar PDF con el itinerario completo del día incluyendo mapa de ruta optimizada.

#### **Características:**
- ✅ Lista de visitas del día
- ✅ Mapa con ruta optimizada
- ✅ Información de cada visita
- ✅ Tiempo estimado total
- ✅ Distancia total
- ✅ Notas y observaciones

#### **Tecnologías:**
- jsPDF
- html2canvas
- Google Maps Static API

#### **Implementación:**

```typescript
// apps/api/src/services/itinerary-generator.service.ts

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable()
export class ItineraryGeneratorService {
    async generateDailyItinerary(userId: string, date: Date): Promise<Buffer> {
        // Obtener visitas del día
        const visits = await this.prisma.visit.findMany({
            where: {
                assignedToId: userId,
                scheduledAt: {
                    gte: startOfDay(date),
                    lte: endOfDay(date)
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        // Optimizar ruta
        const optimizedRoute = await this.optimizeRoute(visits);

        // Generar PDF
        const pdf = new jsPDF();

        // Header
        pdf.setFontSize(20);
        pdf.text('Itinerario del Día', 20, 20);
        pdf.setFontSize(12);
        pdf.text(format(date, 'dd/MM/yyyy'), 20, 30);

        // Resumen
        let y = 45;
        pdf.setFontSize(14);
        pdf.text('Resumen:', 20, y);
        y += 10;
        pdf.setFontSize(10);
        pdf.text(`Total de visitas: ${visits.length}`, 25, y);
        y += 7;
        pdf.text(`Distancia total: ${optimizedRoute.totalDistance} km`, 25, y);
        y += 7;
        pdf.text(`Tiempo estimado: ${optimizedRoute.totalDuration} min`, 25, y);
        y += 15;

        // Lista de visitas
        pdf.setFontSize(14);
        pdf.text('Visitas:', 20, y);
        y += 10;

        visits.forEach((visit, index) => {
            pdf.setFontSize(10);
            pdf.text(`${index + 1}. ${visit.fullName}`, 25, y);
            y += 7;
            pdf.setFontSize(8);
            pdf.text(`   ${visit.addressText}`, 25, y);
            y += 7;
            pdf.text(`   Hora: ${format(visit.scheduledAt, 'HH:mm')}`, 25, y);
            y += 10;

            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
        });

        // Mapa (nueva página)
        pdf.addPage();
        const mapUrl = await this.generateStaticMap(visits);
        pdf.addImage(mapUrl, 'PNG', 10, 10, 190, 140);

        return Buffer.from(pdf.output('arraybuffer'));
    }

    private async generateStaticMap(visits: Visit[]): Promise<string> {
        const markers = visits.map((v, i) => 
            `markers=color:blue%7Clabel:${i + 1}%7C${v.latitude},${v.longitude}`
        ).join('&');

        const url = `https://maps.googleapis.com/maps/api/staticmap?${markers}&size=800x600&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        return url;
    }
}
```

---

### **6. Modo Offline - Sincronización Automática** 📱
**Prioridad:** Alta  
**Tiempo Estimado:** 12 horas  
**Complejidad:** 9/10

#### **Descripción:**
Permitir que la aplicación funcione sin conexión y sincronice automáticamente cuando vuelva la conexión.

#### **Características:**
- ✅ Caché de visitas asignadas
- ✅ Registro de visitas offline
- ✅ Sincronización automática
- ✅ Indicador de estado de conexión
- ✅ Cola de sincronización
- ✅ Resolución de conflictos

#### **Tecnologías:**
- Service Workers
- IndexedDB
- Workbox
- React Query (con persistencia)

#### **Implementación:**

##### **Service Worker:**
```typescript
// apps/web/public/sw.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precachear assets estáticos
precacheAndRoute(self.__WB_MANIFEST);

// Estrategia para API de visitas
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/territory/my-visits'),
    new NetworkFirst({
        cacheName: 'visits-cache',
        plugins: [
            new BackgroundSyncPlugin('visits-queue', {
                maxRetentionTime: 24 * 60 // 24 horas
            })
        ]
    })
);

// Estrategia para imágenes
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images-cache'
    })
);
```

##### **Frontend:**
```typescript
// apps/web/src/utils/offline-manager.ts

import { openDB } from 'idb';

class OfflineManager {
    private db: any;

    async init() {
        this.db = await openDB('visits-offline', 1, {
            upgrade(db) {
                db.createObjectStore('visits', { keyPath: 'id' });
                db.createObjectStore('pending-updates', { keyPath: 'id', autoIncrement: true });
            }
        });
    }

    async cacheVisits(visits: Visit[]) {
        const tx = this.db.transaction('visits', 'readwrite');
        for (const visit of visits) {
            await tx.store.put(visit);
        }
        await tx.done;
    }

    async getCachedVisits(): Promise<Visit[]> {
        return await this.db.getAll('visits');
    }

    async queueUpdate(update: any) {
        await this.db.add('pending-updates', {
            ...update,
            timestamp: Date.now()
        });
    }

    async syncPendingUpdates() {
        const updates = await this.db.getAll('pending-updates');
        
        for (const update of updates) {
            try {
                await fetch('/api/territory/visits/sync', {
                    method: 'POST',
                    body: JSON.stringify(update)
                });
                await this.db.delete('pending-updates', update.id);
            } catch (error) {
                console.error('Error syncing update:', error);
            }
        }
    }
}

export const offlineManager = new OfflineManager();
```

##### **Componente de Estado:**
```tsx
// apps/web/src/components/OfflineIndicator.tsx

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            offlineManager.syncPendingUpdates();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline && pendingSync === 0) return null;

    return (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
            {isOnline ? (
                <span>✅ En línea {pendingSync > 0 && `(${pendingSync} pendientes)`}</span>
            ) : (
                <span>⚠️ Sin conexión - Modo offline</span>
            )}
        </div>
    );
}
```

---

## 📊 Matriz de Priorización

| Funcionalidad | Prioridad | Complejidad | Tiempo | Valor de Negocio | ROI |
|---------------|-----------|-------------|--------|------------------|-----|
| **Modo Offline** | Alta | 9/10 | 12h | Alto | ⭐⭐⭐⭐⭐ |
| **Google Maps** | Alta | 7/10 | 8h | Alto | ⭐⭐⭐⭐⭐ |
| **Push Notifications** | Alta | 6/10 | 6h | Alto | ⭐⭐⭐⭐ |
| **Vista de Mapa** | Media | 5/10 | 6h | Medio | ⭐⭐⭐⭐ |
| **Exportar PDF** | Media | 5/10 | 5h | Medio | ⭐⭐⭐ |
| **Filtros Avanzados** | Media | 4/10 | 4h | Medio | ⭐⭐⭐ |

---

## 🚀 Plan de Implementación Sugerido

### **Sprint 1 (Semana 1-2): Fundamentos**
**Objetivo:** Establecer infraestructura base

1. **Google Maps Integration** (8h)
   - Configurar API keys
   - Implementar componente de mapa
   - Integrar navegación GPS
   - Testing

2. **Filtros Avanzados** (4h)
   - Componente de filtros
   - Lógica de filtrado
   - Persistencia de filtros
   - Testing

**Total:** 12 horas

---

### **Sprint 2 (Semana 3-4): Visualización**
**Objetivo:** Mejorar experiencia visual

3. **Vista de Mapa** (6h)
   - Mapa con todas las visitas
   - Clustering
   - Info windows
   - Testing

4. **Exportar PDF** (5h)
   - Generador de PDF
   - Diseño de itinerario
   - Integración con mapa
   - Testing

**Total:** 11 horas

---

### **Sprint 3 (Semana 5-6): Engagement**
**Objetivo:** Aumentar uso y retención

5. **Push Notifications** (6h)
   - Configurar Firebase
   - Implementar service worker
   - Cron jobs para recordatorios
   - Testing

**Total:** 6 horas

---

### **Sprint 4 (Semana 7-9): Offline-First**
**Objetivo:** Funcionalidad sin conexión

6. **Modo Offline** (12h)
   - Service workers
   - IndexedDB
   - Sincronización
   - Resolución de conflictos
   - Testing extensivo

**Total:** 12 horas

---

## 💰 Estimación de Costos

### **Desarrollo:**
- **Total de horas:** 41 horas
- **Costo por hora:** $50 USD
- **Total desarrollo:** $2,050 USD

### **Servicios Externos:**
- **Google Maps API:** $50-100/mes
- **Firebase (Push Notifications):** $25/mes (plan Blaze)
- **Total mensual:** $75-125 USD

### **Costo Total Primer Año:**
- **Desarrollo:** $2,050 USD
- **Servicios (12 meses):** $900-1,500 USD
- **Total:** $2,950-3,550 USD

---

## 📈 Métricas de Éxito

### **KPIs a Medir:**

1. **Adopción:**
   - % de gestores usando navegación GPS
   - % de gestores con notificaciones activadas
   - Visitas registradas offline

2. **Eficiencia:**
   - Reducción en tiempo de viaje
   - Aumento en visitas completadas por día
   - Reducción en visitas perdidas

3. **Engagement:**
   - Tiempo promedio en la app
   - Frecuencia de uso del mapa
   - PDFs generados por semana

4. **Calidad:**
   - Precisión de ubicaciones GPS
   - Tasa de sincronización exitosa
   - Errores reportados

---

## 🔒 Consideraciones de Seguridad

### **Google Maps:**
- ✅ Restringir API key por dominio
- ✅ Limitar cuota diaria
- ✅ No exponer coordenadas sensibles

### **Push Notifications:**
- ✅ Solicitar permiso explícito
- ✅ Encriptar tokens FCM
- ✅ Validar origen de notificaciones

### **Modo Offline:**
- ✅ Encriptar datos en IndexedDB
- ✅ Validar integridad al sincronizar
- ✅ Manejar conflictos de versión

---

## 🎯 Recomendación Final

### **Orden de Implementación Sugerido:**

1. **🥇 Google Maps Integration** (Semana 1-2)
   - Mayor impacto inmediato
   - Fundamento para otras features
   - Alta demanda de usuarios

2. **🥈 Filtros Avanzados** (Semana 1-2)
   - Rápido de implementar
   - Mejora UX significativamente
   - Bajo riesgo

3. **🥉 Push Notifications** (Semana 5-6)
   - Aumenta engagement
   - Reduce visitas perdidas
   - Complejidad media

4. **Vista de Mapa** (Semana 3-4)
   - Complementa Google Maps
   - Mejora visualización
   - Valor agregado

5. **Exportar PDF** (Semana 3-4)
   - Útil para reportes
   - Complejidad media
   - Valor moderado

6. **Modo Offline** (Semana 7-9)
   - Máxima complejidad
   - Requiere testing extensivo
   - Implementar al final cuando todo lo demás esté estable

---

## ✨ Conclusión

Este roadmap proporciona un plan detallado y ejecutable para implementar funcionalidades avanzadas en el módulo de visitas. La implementación incremental permite:

- ✅ Entregar valor continuamente
- ✅ Validar con usuarios reales
- ✅ Ajustar prioridades según feedback
- ✅ Minimizar riesgos técnicos
- ✅ Controlar costos efectivamente

**Tiempo Total:** 9 semanas  
**Costo Total:** $2,950-3,550 USD  
**ROI Esperado:** Alto (mejora significativa en eficiencia operativa)

---

**¿Deseas que proceda con la implementación de alguna de estas funcionalidades?** 🚀

Recomiendo comenzar con **Google Maps Integration** + **Filtros Avanzados** en el Sprint 1 para obtener resultados rápidos y visibles.
