# 🔧 GESTIÓN EXPLÍCITA DE DEUDA TÉCNICA

**Objetivo**: Evitar colapsos futuros mediante gestión proactiva

> La deuda técnica no se esconde, se gestiona.

---

## 📊 Estado Actual

**Total Items**: 15  
**P0 (Crítico)**: 0  
**P1 (Alto)**: 3  
**P2 (Medio)**: 8  
**P3 (Bajo)**: 4

---

## 🔴 P0 - Crítico (Debe arreglarse ANTES del próximo release)

*Ningún item crítico actualmente*

---

## 🟠 P1 - Alto (Debe arreglarse en las próximas 2 semanas)

### TD-001: Falta de Tests Automatizados

**Descripción**: El proyecto no tiene tests unitarios ni de integración. Cualquier cambio puede romper funcionalidad existente sin detección temprana.

**Impacto si no se corrige**:
- Bugs en producción
- Regresiones no detectadas
- Tiempo excesivo en QA manual
- Miedo a refactorizar código

**Prioridad**: P1  
**Owner**: [Pendiente asignar]  
**Estimación**: 2 semanas  
**Fecha objetivo**: 2026-02-07

**Plan de mitigación**:
1. Instalar Jest + React Testing Library + Supertest
2. Crear tests para componentes críticos (Dashboard, Login, Reports)
3. Crear tests de integración para APIs principales
4. Configurar CI/CD para correr tests automáticamente
5. Meta: 60% cobertura para v1.1

**Bloqueadores**: Ninguno

---

### TD-002: Generador de PDF Mockado

**Descripción**: El sistema actualmente no genera PDFs reales, solo retorna URLs mock y contenido dummy.

**Impacto si no se corrige**:
- No se pueden usar reportes en producción real
- Pérdida de credibilidad
- Hash SHA-256 no es útil sin archivo real

**Prioridad**: P1  
**Owner**: [Pendiente asignar]  
**Estimación**: 1 semana  
**Fecha objetivo**: 2026-02-01

**Plan de mitigación**:
1. Investigar librería: PDFKit vs Puppeteer vs jsPDF
2. Implementar template de reporte en PDF
3. Integrar generación en `reports.service.ts`
4. Añadir upload a S3/Supabase Storage
5. Actualizar URL con link real

**Bloqueadores**: 
- Decisión de stack de PDF (PDFKit recomendado)
- Configuración de S3 o Supabase Storage

---

### TD-003: Usuario Hardcodeado en Dashboard

**Descripción**: El `CURRENT_USER` está hardcodeado en `dashboard/page.tsx` en lugar de obtenerlo de la sesión.

```typescript
const CURRENT_USER = {
    id: 'U-001',
    name: 'Carlos Pérez',
    role: 'ADMIN', // Hardcoded
    region: 'Antioquia'
};
```

**Impacto si no se corrige**:
- Cualquier usuario ve datos de "Carlos Pérez"
- No funciona multi-tenant
- Roles no se respetan realmente

**Prioridad**: P1  
**Owner**: [Pendiente asignar]  
**Estimación**: 3 días  
**Fecha objetivo**: 2026-01-27

**Plan de mitigación**:
1. Crear hook `useCurrentUser()` que obtenga sesión de Supabase
2. Reemplazar CURRENT_USER hardcodeado
3. Obtener rol desde tabla `users` vía API
4. Validar permisos en backend antes de mostrar UI

**Bloqueadores**: Ninguno

---

## 🟡 P2 - Medio (Debe arreglarse en el próximo mes)

### TD-004: Falta de Validación de Permisos en Backend

**Descripción**: Las APIs no validan que el usuario tenga permisos antes de ejecutar acciones.

**Impacto**: Cualquier usuario puede llamar cualquier endpoint
**Fecha objetivo**: 2026-02-15
**Plan**: Implementar Guards de NestJS con validación de roles

---

### TD-005: Queries de Prisma sin Optimizar

**Descripción**: Algunas queries usan `as any` y no tienen índices optimizados.

**Impacto**: Performance degradada con datos reales
**Fecha objetivo**: 2026-02-20
**Plan**: Añadir índices en `schema.prisma` y eliminar `as any`

---

### TD-006: Sin Manejo de Errores Centralizado en API

**Descripción**: Los servicios retornan errores inconsistentes.

**Impacto**: Difícil debuggear problemas en producción
**Fecha objetivo**: 2026-02-25
**Plan**: Crear ExceptionFilter global de NestJS

---

### TD-007: Variables de Entorno no Validadas

**Descripción**: El sistema no valida que las env vars existan al inicio.

**Impacto**: Crashes crípticos en runtime
**Fecha objetivo**: 2026-02-28
**Plan**: Usar @nestjs/config con validación schema (Joi/Zod)

---

### TD-008: Sin Logging Estructurado

**Descripción**: Los logs usan `console.log` en lugar de logger estructurado.

**Impacto**: Imposible buscar/filtrar logs en producción
**Fecha objetivo**: 2026-03-05
**Plan**: Integrar Winston o Pino

---

### TD-009: Sin Monitoreo de Performance

**Descripción**: No hay métricas de latencia, throughput, errores.

**Impacto**: No sabemos si el sistema está sano
**Fecha objetivo**: 2026-03-10
**Plan**: Integrar Sentry + Prometheus o similar

---

### TD-010: Frontend sin Manejo de Estados Global

**Descripción**: Estado se maneja con `useState` local, difícil de escalar.

**Impacto**: Props drilling, refetching innecesario
**Fecha objetivo**: 2026-03-15
**Plan**: Evaluar React Query vs Zustand vs Redux Toolkit

---

### TD-011: Sin Rate Limiting en APIs

**Descripción**: Las APIs no tienen protección contra abuso.

**Impacto**: Vulnerable a DDoS
**Fecha objetivo**: 2026-03-20
**Plan**: Implementar @nestjs/throttler

---

## 🟢 P3 - Bajo (Nice to have, sin fecha límite)

### TD-012: Componentes UI sin Storybook

**Descripción**: Difícil visualizar componentes en aislamiento.
**Plan**: Configurar Storybook para design system

---

### TD-013: Sin Documentación OpenAPI/Swagger

**Descripción**: API no está documentada formalmente.
**Plan**: Añadir @nestjs/swagger

---

### TD-014: Sin Pre-commit Hooks

**Descripción**: Código sin formatear/lint puede entrar al repo.
**Plan**: Configurar Husky + lint-staged

---

### TD-015: Sin Análisis de Bundle Size

**Descripción**: No sabemos si el bundle de Next.js es óptimo.
**Plan**: Configurar @next/bundle-analyzer

---

## 📋 Proceso de Gestión

### Agregar Nueva Deuda Técnica

1. Crear issue con prefijo `[TECH DEBT]` en GitHub/Jira
2. Asignar ID secuencial (`TD-XXX`)
3. Documentar en este archivo con template estándar
4. Asignar prioridad (P0-P3)
5. Asignar owner (o dejar pendiente)
6. Linkar con PR que introdujo la deuda (si aplica)

### Template de Item

```markdown
### TD-XXX: [Título Descriptivo]

**Descripción**: [Qué está mal o faltante]

**Impacto si no se corrige**: 
- [Consecuencia 1]
- [Consecuencia 2]

**Prioridad**: P0/P1/P2/P3  
**Owner**: [Nombre o "Pendiente"]  
**Estimación**: [Tiempo necesario]  
**Fecha objetivo**: YYYY-MM-DD

**Plan de mitigación**:
1. Paso 1
2. Paso 2
...

**Bloqueadores**: [Lo que impide empezar]
```

---

## 📊 Métricas de Deuda Técnica

| Métrica | Q1 2026 | Q2 2026 (Target) |
|---------|---------|------------------|
| Total items | 15 | <10 |
| Edad promedio (días) | - | <30 |
| Items P0/P1 | 3 | 0 |
| % con owner asignado | 0% | 100% |

---

## 🔄 Revisión

**Frecuencia**: Semanal en sprint planning  
**Responsable**: Tech Lead  
**Próxima revisión**: 2026-01-30

---

**Última actualización**: 2026-01-23  
**Documento versión**: 1.0
