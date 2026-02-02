# 🚀 PLAN DE ACCIÓN CRÍTICO - Sistema Gerencial UTP CONTROL

**Fecha**: 2026-01-31  
**Prioridad**: 🔴 ALTA - Implementación Inmediata  
**Estándar**: Silicon Valley Enterprise Grade

---

## 📋 PROBLEMAS IDENTIFICADOS Y SOLUCIONES

### 1. ❌ PROBLEMA: Errores 401 (Unauthorized) Generalizados
**Causa**: Estrategia de autenticación no cargaba perfil completo del usuario  
**Solución Implementada**: ✅ 
- Ampliado `SupabaseStrategy` para incluir todas las relaciones territoriales
- Agregada validación de usuario activo
- Incluidos: region, municipality, assignedRegions, assignedMunicipalities, assignedVeredas

**Código**: `apps/api/src/auth/supabase.strategy.ts`

---

### 2. ❌ PROBLEMA: "Mis Visitas" en Panel Administrativo
**Debe Ser**: "Gestión Nacional de Visitas" con jerarquía completa  

**Solución Implementada**: ✅
- Creada nueva página `/dashboard/visits-management`
- Vista jerárquica con 3 modos:
  - Por Región (mapa nacional de cobertura)
  - Por Coordinador (desempeño individual)
  - Por Gestor (eficiencia operativa)
- KPIs en tiempo real:
  - Total visitas nacionales
  - Tasa de cumplimiento global
  - Visitas completadas vs pendientes
  - Desglose por región con ranking

**Archivo**: `apps/web/src/app/dashboard/visits-management/page.tsx`

---

### 3. ❌ PROBLEMA: Directorio Corporativo Vacío
**Solución Implementada**: ✅
- Corregido `UsersController` para permitir acceso a todos los usuarios autenticados
- Filtrado inteligente por rol:
  - ADMIN: Ve todos los usuarios
  - COORDINATOR: Ve su región
  - GESTOR/APOYO: Ve su región (colaboración)

**Código**: `apps/api/src/users/users.controller.ts`

---

### 4. ❌ PROBLEMA: Sistema de Informes Gerenciales Incompleto
**Estado**: 🚧 EN DESARROLLO  

**Informes Requeridos** (Nivel Silicon Valley):

#### A. Informe de Cumplimiento de Visitas
**Métricas**:
- Cumplimiento por región (%)
- Cumplimiento por coordinador (%)
- Cumplimiento por gestor (%)
- Tendencia mensual
- Proyección de alcance

**Endpoint a Crear**: `GET /reports/visits-compliance`

#### B. Informe de Cobertura Territorial
**Métricas**:
- % de UPs visitadas por región
- Municipios con cobertura completa
- Municipios con cobertura parcial
- Zonas sin cobertura (alertas)
- Heatmap de densidad

**Endpoint a Crear**: `GET /reports/territorial-coverage`

#### C. Informe de Proyección de Alcance
**Métricas**:
- Ritmo actual de visitas (visitas/día)
- Proyección a 30/60/90 días
- Recursos necesarios para meta
- Recomendaciones de reasignación

**Endpoint a Crear**: `GET /reports/reach-projection`

#### D. Dashboard Ejecutivo Consolidado
**Componentes**:
- ICOE (ya implementado)
- Cumplimiento de Visitas
- Índice de Riesgo Territorial
- Calidad de Datos
- Eficiencia por Coordinador
- Top 5 Gestores
- Bottom 5 Regiones (requieren atención)

**Endpoint a Crear**: `GET /reports/executive-dashboard`

---

### 5. ❌ PROBLEMA: Auditoría Sin Funcionalidad
**Estado**: 🚧 PENDIENTE

**Solución Planificada**:

#### Endpoints de Auditoría:
```typescript
GET /audit/logs              // Últimos movimientos
GET /audit/by-user/:userId   // Acciones de un usuario
GET /audit/by-entity/:entity // Auditoría de una entidad
GET /audit/critical          // Solo acciones críticas
GET /audit/export            // Exportar para cumplimiento
```

#### Visualizaciones:
- Timeline de eventos
- Filtro por usuario, acción, entidad, fecha
- Exportación en PDF/Excel para ISO 27001
- Alertas de acciones sospechosas

**Archivo a Crear**: `apps/api/src/audit/audit.controller.ts` (ya existe, necesita endpoints)

---

### 6. ❌ PROBLEMA: Notificaciones Push No Operativas
**Estado**: 🚧 80% - Falta Migración DB

**Pasos Restantes**:
1. ✅ VAPID Keys generadas
2. ✅ Variables de entorno configuradas
3. ✅ NotificationsModule integrado en app
4. ⏳ PENDIENTE: Ejecutar `prisma db push` (estaba bloqueado)
5. ⏳ PENDIENTE: Generar cliente Prisma con `prisma generate`

**Acción Inmediata**:
```bash
cd apps/api
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN - PRÓXIMAS 48 HORAS

### FASE 1: Infraestructura Crítica (4 horas)
- [x] Arreglar autenticación (COMPLETADO)
- [x] Habilitar directorio corporativo (COMPLETADO)
- [x] Crear vista nacional de visitas (COMPLETADO)
- [ ] Ejecutar migración de Push Notifications
- [ ] Verificar compilación sin errores

### FASE 2: Sistema de Informes Gerenciales (8 horas)
- [ ] Endpoint: `/reports/visits-compliance`
- [ ] Endpoint: `/reports/territorial-coverage`
- [ ] Endpoint: `/reports/reach-projection`
- [ ] Endpoint: `/reports/executive-dashboard`
- [ ] Componente Frontend: `ExecutiveReportGenerator.tsx`
- [ ] Integrar con botón "Ver Reportes" en Admin Dashboard

### FASE 3: Auditoría Funcional (4 horas)
- [ ] Implementar endpoints de auditoría
- [ ] Crear componente `AuditTimeline.tsx`
- [ ] Sistema de filtros avanzados
- [ ] Exportación para cumplimiento ISO

### FASE 4: Notificaciones en Producción (2 horas)
- [ ] Completar migración DB
- [ ] Testing de notificaciones
- [ ] Integración con flujos de alertas
- [ ] Documentar proceso para usuarios

### FASE 5: Testing y Validación (4 horas)
- [ ] Testing end-to-end de autenticación
- [ ] Validar permisos por rol
- [ ] Testing de informes gerenciales
- [ ] Validar métricas de dashboard CEO
- [ ] Testing de notificaciones push

---

## 📊 ARQUITECTURA DE INFORMES GERENCIALES

### Estructura de Datos (Ejemplo: Informe de Cumplimiento)
```typescript
interface VisitsComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  national: {
    totalVisits: number;
    completedVisits: number;
    completionRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  byRegion: Array<{
    region: string;
    coordinator: string;
    totalVisits: number;
    completedVisits: number;
    completionRate: number;
    rank: number;
  }>;
  byCoordinator: Array<{
    coordinator: string;
    region: string;
    totalVisits: number;
    completedVisits: number;
    avgVisitsPerDay: number;
    efficiency: number; // visitas/día vs meta
  }>;
  byGestor: Array<{
    gestor: string;
    coordinator: string;
    region: string;
    totalVisits: number;
    completedVisits: number;
    avgVisitsPerDay: number;
    quality: number; // % con evidencia GPS
  }>;
  insights: {
    topPerformers: string[];      // Top 3 coordinadores
    needsAttention: string[];     // Bottom 3 regiones
    projectedCompletion: Date;    // Cuándo se alcanzará 100%
    recommendations: string[];    // Acciones recomendadas
  };
}
```

### Flujo de Generación
```
1. Usuario hace clic en "Generar Informe Gerencial"
2. Frontend: POST /reports/generate-compliance
   - Parámetros: período, formato (PDF/Excel), destinatarios
3. Backend:
   - Query a BD (visitas, usuarios, regiones)
   - Cálculo de métricas
   - Generación de insights con ML (opcional)
   - Renderizado a PDF/Excel
4. Almacenamiento en `reports` table con hash SHA-256
5. Envío automático por email (si se especificó)
6. Retorno de URL de descarga al frontend
```

---

## 🔧 TECNOLOGÍAS Y HERRAMIENTAS

### Backend (NestJS)
- **ORM**: Prisma
- **PDF**: PDFKit (ya implementado)
- **Excel**: `exceljs`
- **Gráficos**: `chart.js` + `node-canvas`
- **ML Insights**: GPT-4 API (opcional para recomendaciones)

### Frontend (Next.js)
- **Gráficos**: Recharts
- **Exportación**: `react-to-pdf`
- **Tablas**: `@tanstack/react-table`
- **Visualización**: `visx` para mapas

---

## 🎨 PRINCIPIOS DE DISEÑO (Silicon Valley)

### 1. Claridad Ejecutiva
- **1 Dashboard = 1 Decisión**
- Métricas en lenguaje de negocio, no técnico
- Colores solo para indicar riesgo (verde/amarillo/rojo)

### 2. Jerarquía de Información
```
Nacional → Regional → Coordinador → Gestor
```

### 3. Acción Inmediata
- Cada métrica debe responder: "¿Qué hago ahora?"
- Botones de acción junto a alertas:
  - "Reasignar Gestor"
  - "Contactar Coordinador"
  - "Generar Plan de Acción"

### 4. Mobile-First
- Dashboards responsive
- Gráficos adaptativos
- CTAs accesibles con el pulgar

---

## 📈 KPIS GERENCIALES COMPLETOS

### Operativos
1. **ICOE** (North Star) - Ya implementado ✅
2. **Cobertura Territorial** (% UPs visitadas)
3. **Cumplimiento de Visitas** (% completadas)
4. **Velocidad de Ejecución** (visitas/día)
5. **Calidad de Datos** (% con GPS + evidencia)

### Tácticos
6. **Eficiencia por Coordinador** (visitas/gestor/día)
7. **Índice de Riesgo Territorial** (alertas críticas)
8. **Tasa de Cancelación** (% visitas canceladas)
9. **Tiempo Promedio de Visita** (desde asignación hasta cierre)

### Estratégicos
10. **Proyección de Meta** (días para 100% cobertura)
11. **ROI de Gestores** (visitas completadas vs salario)
12. **Satisfacción de Stakeholders** (encuestas post-visita)
13. **Cumplimiento Normativo** (auditorías pasadas)

---

## ✅ CHECKLIST DE CALIDAD

### Antes de Deployment
- [ ] Todos los endpoints retornan 200 (no 401/403)
- [ ] Permisos validados para cada rol
- [ ] Informes se generan correctamente
- [ ] PDFs tienen branding corporativo
- [ ] Notificaciones se envían en tiempo real
- [ ] Auditoría registra todas las acciones críticas
- [ ] Tests E2E pasan al 100%
- [ ] Documentación actualizada
- [ ] Changelog con nuevas features
- [ ] Demo grabado para stakeholders

---

## 🚨 ALERTAS Y RECOMENDACIONES

### Alertas Automáticas a Implementar
1. **Región con cumplimiento < 50%** → Email a CEO
2. **Gestor sin visitas en 7 días** → WhatsApp a Coordinador
3. **Alerta crítica sin resolver en 24h** → Escalación automática
4. **3 visitas canceladas consecutivas** → Review de gestor
5. **Coordinador con eficiencia < 70%** → Entrenamiento requerido

### Sistema de Recomendaciones (ML)
```typescript
interface Recommendation {
  type: 'reassign' | 'hire' | 'train' | 'escalate';
  priority: 'high' | 'medium' | 'low';
  target: string; // region, coordinator, gestor
  action: string; // descripción de la acción
  impact: number; // mejora esperada en ICOE (%)
  cost: number;   // costo estimado
}
```

---

## 📞 SOPORTE Y CONTACTO

**Desarrollador**: Tech Lead UTP CONTROL  
**Stack**: NestJS + Next.js + Prisma + PostgreSQL  
**Deployment**: Vercel (Frontend) + Railway (Backend)  
**Monitoreo**: Sentry + PostHog

---

**Siguiente Paso**: 
1. Ejecutar migración de Push Notifications
2. Crear endpoints de informes gerenciales
3. Implementar sistema de auditoría funcional
4. Testing integral y validación con usuario
