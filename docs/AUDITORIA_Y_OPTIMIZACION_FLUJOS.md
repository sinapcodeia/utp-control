# 🔍 AUDITORÍA COMPLETA Y OPTIMIZACIÓN DE FLUJOS POR ROL

## 📋 Resumen Ejecutivo

**Fecha:** 29 de enero de 2026  
**Tipo:** Auditoría de Seguridad y UX  
**Estilo:** Silicon Valley / Apple Principles  
**Estado:** 🔴 CRÍTICO - Requiere Acción Inmediata

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Flujo de Visitas Roto** ❌

**Problema:** Botón "VER RESUMEN" no redirige al calendario
- **Ubicación:** Pantalla de confirmación de visita
- **Comportamiento Actual:** Botón inactivo
- **Comportamiento Esperado:** Redirigir a `/dashboard/visits` con la visita seleccionada
- **Impacto:** 🔴 ALTO - Rompe experiencia 360°
- **Severidad:** P0 (Crítico)

### 2. **Reportes de Visitas No Visibles** ❌

**Problema:** No hay visualización de reportes de visitas completadas
- **Ubicación:** Sistema completo
- **Comportamiento Actual:** Reportes no se muestran en ninguna sección
- **Comportamiento Esperado:** Sección dedicada para ver reportes de visitas
- **Impacto:** 🔴 ALTO - Pérdida de información crítica
- **Severidad:** P0 (Crítico)

### 3. **Confusión en Sección "Informes"** ⚠️

**Problema:** No está claro qué informes ve cada rol
- **Ubicación:** `/dashboard/reports`
- **Roles Afectados:** Todos
- **Comportamiento Actual:** Muestra informes sin filtrado claro por rol
- **Impacto:** 🟡 MEDIO - Confusión de usuario
- **Severidad:** P1 (Alto)

### 4. **Bóveda de Informes Vacía** ⚠️

**Problema:** Solo muestra "GLOBAL" sin contenido
- **Ubicación:** `/dashboard/reports/archive`
- **Comportamiento Actual:** Interfaz vacía
- **Comportamiento Esperado:** Mostrar informes organizados por tipo
- **Impacto:** 🟡 MEDIO - Funcionalidad incompleta
- **Severidad:** P1 (Alto)

### 5. **Visibilidad de Novedades Sin Definir** ⚠️

**Problema:** No hay reglas claras de qué novedades ve cada rol
- **Ubicación:** `/dashboard/news`
- **Impacto:** 🟡 MEDIO - Posible brecha de seguridad
- **Severidad:** P1 (Alto)

### 6. **Visibilidad de Documentos Sin Definir** ⚠️

**Problema:** No hay reglas claras de qué documentos ve cada rol
- **Ubicación:** `/dashboard/documents`
- **Impacto:** 🟡 MEDIO - Posible brecha de seguridad
- **Severidad:** P1 (Alto)

---

## 🎯 MATRIZ DE VISIBILIDAD OPTIMIZADA (Silicon Valley Style)

### Principios de Diseño:
1. **Least Privilege** - Solo ver lo necesario para el rol
2. **Context-Aware** - Filtrado automático basado en contexto
3. **Progressive Disclosure** - Información gradual según necesidad
4. **Zero Trust** - Validación en cada capa (frontend + backend)

---

## 📊 MATRIZ COMPLETA POR MÓDULO Y ROL

### 🗺️ **VISITAS**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Visitas** | ✅ Todas (nacional) | ✅ De su región | ✅ Solo asignadas |
| **Crear Visitas** | ✅ Sí | ✅ Sí (su región) | ❌ No |
| **Asignar Visitas** | ✅ A cualquiera | ✅ A gestores de su región | ❌ No |
| **Reagendar Visitas** | ✅ Todas | ✅ De su región | ✅ Solo asignadas |
| **Cerrar Visitas** | ✅ Todas | ✅ De su región | ✅ Solo asignadas |
| **Ver Reportes de Visitas** | ✅ Todos | ✅ De su región | ✅ Solo propios |
| **Exportar Reportes** | ✅ Todos | ✅ De su región | ✅ Solo propios |

**Filtrado Automático:**
```typescript
// ADMIN
WHERE 1=1 // Sin filtro

// COORDINATOR
WHERE visit.regionId = currentUser.regionId

// GESTOR
WHERE visit.assignedToId = currentUser.id
```

---

### 📄 **INFORMES (Reports)**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Informes** | ✅ Todos (nacional) | ✅ De su región | ✅ De su región (lectura) |
| **Crear Informes** | ✅ Sí | ✅ Sí | ❌ No |
| **Editar Informes** | ✅ Todos | ✅ Solo propios | ❌ No |
| **Eliminar Informes** | ✅ Todos | ✅ Solo propios | ❌ No |
| **Aprobar Informes** | ✅ Sí | ✅ De su región | ❌ No |
| **Exportar PDF** | ✅ Todos | ✅ De su región | ✅ De su región |
| **Bóveda (Archive)** | ✅ Todos | ✅ De su región | ✅ De su región |

**Tipos de Informes:**
- **REGIONAL** - Informes regionales (creados por coordinadores)
- **AUDIT** - Informes de auditoría (solo admin)
- **VISIT** - Reportes de visitas (generados automáticamente)
- **CUSTOM** - Informes personalizados

**Filtrado Automático:**
```typescript
// ADMIN
WHERE 1=1

// COORDINATOR
WHERE report.regionId = currentUser.regionId
   OR report.type = 'NATIONAL'

// GESTOR
WHERE report.regionId = currentUser.regionId
  AND report.visibility = 'PUBLIC'
```

---

### 📰 **NOVEDADES (News/Regional Reports)**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Novedades** | ✅ Todas (nacional) | ✅ De su región + nacionales | ✅ De su región + nacionales |
| **Crear Novedades** | ✅ Sí (alcance nacional) | ✅ Sí (alcance regional) | ❌ No |
| **Editar Novedades** | ✅ Todas | ✅ Solo propias | ❌ No |
| **Eliminar Novedades** | ✅ Todas | ✅ Solo propias | ❌ No |
| **Marcar como Leída** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Comentar** | ✅ Sí | ✅ Sí | ✅ Sí (solo lectura) |
| **Archivo (Archive)** | ✅ Todas | ✅ De su región | ✅ De su región |

**Reglas de Visibilidad (Ver Sección de Alertas):**
```typescript
// ADMIN
WHERE 1=1

// COORDINATOR
WHERE (news.regionId = currentUser.regionId)
   OR (news.scope = 'NATIONAL' AND news.user.role = 'ADMIN')

// GESTOR
WHERE (news.regionId = currentUser.regionId)
   OR (news.scope = 'NATIONAL')
```

---

### 📁 **DOCUMENTOS (Documents)**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Documentos** | ✅ Todos | ✅ Todos (lectura) | ✅ Todos (lectura) |
| **Subir Documentos** | ✅ Sí | ✅ Sí (su región) | ❌ No |
| **Editar Documentos** | ✅ Todos | ✅ Solo propios | ❌ No |
| **Eliminar Documentos** | ✅ Todos | ✅ Solo propios | ❌ No |
| **Comentar** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Descargar** | ✅ Todos | ✅ Todos | ✅ Todos |
| **Ver Historial** | ✅ Todos | ✅ De su región | ✅ De su región |

**Categorías de Documentos:**
- **NATIONAL** - Documentos nacionales (visibles para todos)
- **REGIONAL** - Documentos regionales (filtrados por región)
- **INTERNAL** - Documentos internos (solo admin y coordinadores)
- **PUBLIC** - Documentos públicos (todos)

**Filtrado Automático:**
```typescript
// ADMIN
WHERE 1=1

// COORDINATOR
WHERE document.category IN ('NATIONAL', 'REGIONAL', 'PUBLIC')
  AND (document.regionId = currentUser.regionId OR document.category = 'NATIONAL')

// GESTOR
WHERE document.category IN ('NATIONAL', 'PUBLIC')
   OR (document.category = 'REGIONAL' AND document.regionId = currentUser.regionId)
```

---

### 👥 **DIRECTORIO (Directory)**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Usuarios** | ✅ Todos | ✅ De su región | ✅ De su región |
| **Ver Detalles** | ✅ Completos | ✅ Limitados | ✅ Básicos |
| **Exportar** | ✅ Todos | ✅ De su región | ❌ No |
| **Buscar** | ✅ Nacional | ✅ Regional | ✅ Regional |

**Campos Visibles por Rol:**
```typescript
// ADMIN - Ve todo
{
  fullName, email, phone, role, region, 
  municipality, assignedRegions, permissions,
  createdAt, lastLogin, status
}

// COORDINATOR - Ve datos operativos
{
  fullName, email, phone, role, region,
  municipality, status
}

// GESTOR - Ve datos básicos
{
  fullName, role, region, municipality
}
```

---

### 🔍 **AUDITORÍA (Audit)**

| Funcionalidad | ADMIN | COORDINATOR | GESTOR |
|---------------|-------|-------------|--------|
| **Ver Logs** | ✅ Todos | ❌ No | ❌ No |
| **Exportar Logs** | ✅ Sí | ❌ No | ❌ No |
| **Filtrar** | ✅ Sí | ❌ No | ❌ No |
| **Ver Métricas** | ✅ Sí | ❌ No | ❌ No |

**Acceso Exclusivo:** Solo ADMIN

---

## 🔧 CORRECCIONES REQUERIDAS

### **P0 - CRÍTICO (Implementar Inmediatamente)**

#### 1. **Arreglar Flujo de Visitas**

**Archivo:** `apps/mobile/App.tsx` (o componente de confirmación)

**Problema:** Botón "VER RESUMEN" no funciona

**Solución:**
```typescript
// Después de cerrar visita exitosamente
const handleVisitComplete = async () => {
  // ... lógica de cierre de visita
  
  // Redirigir al calendario con la visita seleccionada
  navigation.navigate('Visits', {
    selectedVisitId: visitId,
    highlightDate: visit.scheduledAt
  });
};

// En el botón
<Button onPress={handleVisitComplete}>
  VER RESUMEN
</Button>
```

**Tiempo Estimado:** 2 horas

---

#### 2. **Crear Sección de Reportes de Visitas**

**Archivo:** `apps/web/src/app/dashboard/visits/reports/page.tsx` (NUEVO)

**Funcionalidad:**
- Lista de todas las visitas completadas
- Filtros por fecha, región, gestor, estado
- Vista de detalle de cada reporte
- Exportar a PDF
- Gráficos de estadísticas

**Componentes:**
```typescript
// Vista de Lista
<VisitReportsTable 
  reports={filteredReports}
  onView={handleViewReport}
  onExport={handleExportPDF}
/>

// Vista de Detalle
<VisitReportDetail
  report={selectedReport}
  visit={visit}
  logs={visitLogs}
/>

// Estadísticas
<VisitReportsStats
  totalCompleted={stats.completed}
  totalCancelled={stats.cancelled}
  averageTime={stats.avgTime}
  byRegion={stats.byRegion}
/>
```

**Tiempo Estimado:** 8 horas

---

#### 3. **Implementar Filtrado por Rol en Informes**

**Archivo:** `apps/api/src/reports/reports.service.ts`

**Cambios:**
```typescript
async findAll(user: User, filters?: ReportFilters) {
  // Construir filtro basado en rol
  const roleFilter = this.buildRoleFilter(user);
  
  return this.prisma.report.findMany({
    where: {
      AND: [
        roleFilter,
        filters?.type ? { type: filters.type } : {},
        filters?.regionId ? { regionId: filters.regionId } : {}
      ]
    },
    include: {
      region: true,
      author: {
        select: { fullName: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

private buildRoleFilter(user: User) {
  switch (user.role) {
    case 'ADMIN':
      return {}; // Sin filtro
      
    case 'COORDINATOR':
      return {
        OR: [
          { regionId: user.regionId },
          { type: 'NATIONAL' }
        ]
      };
      
    case 'USER':
    case 'SUPPORT':
      return {
        regionId: user.regionId,
        visibility: 'PUBLIC'
      };
      
    default:
      return { id: 'never-match' };
  }
}
```

**Tiempo Estimado:** 4 horas

---

### **P1 - ALTO (Implementar Esta Semana)**

#### 4. **Poblar Bóveda de Informes**

**Archivo:** `apps/web/src/app/dashboard/reports/archive/page.tsx`

**Cambios:**
- Agregar categorías: REGIONAL, AUDIT, VISIT, CUSTOM
- Implementar búsqueda y filtros
- Agregar vista de grid/lista
- Implementar paginación

**Tiempo Estimado:** 6 horas

---

#### 5. **Implementar Filtrado de Novedades por Rol**

**Archivo:** `apps/api/src/regional-reports/regional-reports.service.ts`

**Usar lógica de Sistema de Alertas** (ya diseñada en documento anterior)

**Tiempo Estimado:** 4 horas

---

#### 6. **Implementar Filtrado de Documentos por Rol**

**Archivo:** `apps/api/src/documents/documents.service.ts`

**Cambios:**
```typescript
async findAll(user: User, filters?: DocumentFilters) {
  const roleFilter = this.buildDocumentRoleFilter(user);
  
  return this.prisma.document.findMany({
    where: {
      AND: [
        roleFilter,
        filters?.category ? { category: filters.category } : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}

private buildDocumentRoleFilter(user: User) {
  switch (user.role) {
    case 'ADMIN':
      return {};
      
    case 'COORDINATOR':
      return {
        OR: [
          { category: { in: ['NATIONAL', 'PUBLIC'] } },
          {
            category: 'REGIONAL',
            regionId: user.regionId
          }
        ]
      };
      
    case 'USER':
    case 'SUPPORT':
      return {
        OR: [
          { category: { in: ['NATIONAL', 'PUBLIC'] } },
          {
            category: 'REGIONAL',
            regionId: user.regionId
          }
        ]
      };
      
    default:
      return { id: 'never-match' };
  }
}
```

**Tiempo Estimado:** 4 horas

---

## 🛡️ MEJORAS DE SEGURIDAD

### 1. **Validación en Múltiples Capas**

```typescript
// Capa 1: Middleware de autenticación
@UseGuards(SupabaseGuard)

// Capa 2: Middleware de autorización por rol
@UseGuards(RoleGuard)
@Roles('ADMIN', 'COORDINATOR')

// Capa 3: Validación en servicio
if (!this.canUserAccessResource(user, resourceId)) {
  throw new ForbiddenException();
}

// Capa 4: Filtrado en query
WHERE resource.userId = currentUser.id
   OR resource.regionId = currentUser.regionId
```

### 2. **Auditoría de Accesos**

```typescript
// Registrar todos los accesos a recursos sensibles
await this.auditService.log({
  userId: user.id,
  action: 'VIEW_DOCUMENT',
  resourceId: documentId,
  resourceType: 'DOCUMENT',
  metadata: {
    userRole: user.role,
    userRegion: user.regionId,
    timestamp: new Date()
  }
});
```

### 3. **Rate Limiting por Rol**

```typescript
// Admin: Sin límite
// Coordinator: 1000 req/hora
// Gestor: 500 req/hora

@Throttle(getRateLimitByRole(user.role))
```

---

## 📊 DASHBOARD OPTIMIZADO POR ROL

### **ADMIN Dashboard**

```
┌─────────────────────────────────────────────────┐
│  📊 VISTA NACIONAL                              │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Visitas  │  │ Informes │  │ Alertas  │      │
│  │ 1,234    │  │ 567      │  │ 89       │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  🗺️ MONITOREO REGIONAL                         │
│  ┌────────────────────────────────────┐        │
│  │ Región 1: 45 alertas (3 críticas) │        │
│  │ Región 2: 23 alertas (1 crítica)  │        │
│  │ Región 3: 12 alertas (0 críticas) │        │
│  └────────────────────────────────────┘        │
│                                                  │
│  📈 MÉTRICAS GLOBALES                           │
│  - Eficiencia: 87%                              │
│  - Cobertura: 92%                               │
│  - Tiempo Respuesta: 2.3h                       │
└─────────────────────────────────────────────────┘
```

### **COORDINATOR Dashboard**

```
┌─────────────────────────────────────────────────┐
│  📍 MI REGIÓN: Antioquia                        │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Gestores │  │ Visitas  │  │ Alertas  │      │
│  │ 12       │  │ 234      │  │ 15       │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  👥 ALERTAS DE GESTORES                         │
│  ┌────────────────────────────────────┐        │
│  │ Juan P.: 3 alertas (1 crítica)    │        │
│  │ María G.: 2 alertas (0 críticas)  │        │
│  └────────────────────────────────────┘        │
│                                                  │
│  📊 RENDIMIENTO REGIONAL                        │
│  - Visitas Completadas: 89%                     │
│  - Alertas Resueltas: 95%                       │
└─────────────────────────────────────────────────┘
```

### **GESTOR Dashboard**

```
┌─────────────────────────────────────────────────┐
│  👤 MIS TAREAS                                  │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Hoy      │  │ Próximas │  │ Alertas  │      │
│  │ 5        │  │ 12       │  │ 3        │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  📅 VISITAS DE HOY                              │
│  ┌────────────────────────────────────┐        │
│  │ 09:00 - Juan Pérez                │        │
│  │ 11:00 - María García              │        │
│  │ 14:00 - Carlos López              │        │
│  └────────────────────────────────────┘        │
│                                                  │
│  📰 NOVEDADES REGIONALES                        │
│  - Alerta de coordinador (hace 2h)             │
│  - Novedad nacional (hace 5h)                   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Sprint 1 (Semana 1) - P0 Crítico**
- [ ] Día 1-2: Arreglar flujo de visitas
- [ ] Día 3-5: Crear sección de reportes de visitas

### **Sprint 2 (Semana 2) - P1 Alto**
- [ ] Día 1-2: Implementar filtrado de informes
- [ ] Día 3-4: Poblar bóveda de informes
- [ ] Día 5: Testing y QA

### **Sprint 3 (Semana 3) - Seguridad**
- [ ] Día 1-2: Implementar filtrado de novedades
- [ ] Día 3-4: Implementar filtrado de documentos
- [ ] Día 5: Auditoría de seguridad

### **Sprint 4 (Semana 4) - Optimización**
- [ ] Día 1-2: Optimizar dashboards por rol
- [ ] Día 3-4: Implementar rate limiting
- [ ] Día 5: Testing final y deployment

---

## ✅ CHECKLIST DE VALIDACIÓN

### Seguridad:
- [ ] Todos los endpoints tienen autenticación
- [ ] Todos los endpoints tienen autorización por rol
- [ ] Filtrado en backend (no solo frontend)
- [ ] Auditoría de accesos implementada
- [ ] Rate limiting configurado

### UX:
- [ ] Flujos claros por rol
- [ ] Sin información innecesaria
- [ ] Feedback visual en todas las acciones
- [ ] Loading states en todas las peticiones
- [ ] Error handling robusto

### Performance:
- [ ] Queries optimizadas con índices
- [ ] Paginación implementada
- [ ] Caché donde corresponda
- [ ] Lazy loading de componentes
- [ ] Bundle size optimizado

---

**Desarrollado con 🔒 Seguridad + 🎯 Precisión + ❤️ Silicon Valley Principles**
