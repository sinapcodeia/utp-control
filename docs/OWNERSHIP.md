# 👥 CAPA 4 - EJECUCIÓN, OWNERSHIP Y TRAZABILIDAD

**Objetivo**: Responsabilidad clara y cero ambigüedad

> Si no tiene owner, no existe.

---

## 🎯 Principios de Ownership

1. **Un responsable único** - Cada tarea tiene exactamente UN owner (puede tener colaboradores)
2. **Responsabilidad end-to-end** - El owner es responsable desde inicio hasta producción
3. **Autonomía con accountability** - Libertad para ejecutar, obligación de entregar
4. **Transparencia total** - Estado siempre visible en tiempo real

---

## 👤 Roles y Responsables del Proyecto

### Leadership

| Rol | Responsable | Responsabilidades |
|-----|-------------|-------------------|
| **Project Owner** | [Pendiente asignar] | Visión producto, priorización roadmap, stakeholder management |
| **Tech Lead** | [Pendiente asignar] | Arquitectura, decisiones técnicas, code review final, mentoring |
| **Product Manager** | [Pendiente asignar] | Requerimientos, UX, métricas de negocio |

### Engineering

| Rol | Responsable | Responsabilidades |
|-----|-------------|-------------------|
| **Backend Lead** | [Pendiente asignar] | APIs NestJS, base de datos, performance backend |
| **Frontend Lead** | [Pendiente asignar] | UI/UX Next.js, componentes, estado global |
| **DevOps Engineer** | [Pendiente asignar] | CI/CD, deployment, monitoreo, infraestructura |
| **QA Engineer** | [Pendiente asignar] | Testing strategy, automation, regression |

### Cross-Functional

| Rol | Responsable | Responsabilidades |
|-----|-------------|-------------------|
| **Security Officer** | [Pendiente asignar] | Security audits, compliance (ISO/SOC), penetration testing |
| **Data Engineer** | [Pendiente asignar] | Migraciones, optimización queries, backup/recovery |

---

## 📋 Ownership por Módulo

### Módulo: Autenticación y Autorización
**Owner**: [Pendiente]  
**Colaboradores**: Security Officer  
**Estado**: ✅ Producción

**Responsabilidades**:
- Mantener Supabase Auth integration
- Sistema RBAC (roles y permisos)
- JWT token management
- Session handling

**Archivos clave**:
- `apps/api/src/auth/`
- `apps/web/src/utils/supabase/`
- `apps/web/middleware.ts`

---

### Módulo: Noticias Regionales
**Owner**: [Pendiente]  
**Colaboradores**: Backend Lead  
**Estado**: ✅ Producción

**Responsabilidades**:
- CRUD de regional reports
- Sistema de alertas automáticas
- Read receipts
- Jerarquía por región/municipalidad

**Archivos clave**:
- `apps/api/src/regional-reports/`
- `apps/web/src/app/dashboard/news/`

---

### Módulo: Documentos
**Owner**: [Pendiente]  
**Colaboradores**: Frontend Lead  
**Estado**: ✅ Producción

**Responsabilidades**:
- Upload de documentos
- Sistema de comentarios append-only
- Cálculo de hash SHA-256
- Versionado

**Archivos clave**:
- `apps/api/src/documents/`
- `apps/web/src/app/dashboard/documents/`

---

### Módulo: Reportes Empresariales
**Owner**: [Pendiente]  
**Colaboradores**: Backend Lead, Data Engineer  
**Estado**: 🟡 MVP (PDF mockado)

**Responsabilidades**:
- Generación de reportes
- Implementar PDF real (TD-002)
- Upload a storage
- Validación de integridad SHA-256

**Archivos clave**:
- `apps/api/src/reports/`
- `apps/web/src/app/dashboard/reports/`

---

### Módulo: Dashboard y Analytics
**Owner**: [Pendiente]  
**Colaboradores**: Frontend Lead, Product Manager  
**Estado**: ✅ Producción

**Responsabilidades**:
- Vistas personalizadas por rol
- Estadísticas en tiempo real
- Gráficos con Recharts
- Performance UI

**Archivos clave**:
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/components/dashboard/`

---

### Módulo: Auditoría y Compliance
**Owner**: [Pendiente]  
**Colaboradores**: Security Officer, Data Engineer  
**Estado**: ✅ Producción

**Responsabilidades**:
- Audit logging
- Compliance documentation
- Security reviews
- Data retention policies

**Archivos clave**:
- `apps/api/src/prisma/schema.prisma` (audit_logs)
- `docs/SECURITY.md`

---

## 🎫 Ownership por Feature (Backlog)

### Feature: Tests Automatizados (TD-001)
**Owner**: [Pendiente asignar]  
**Colaboradores**: QA Engineer  
**Prioridad**: P1  
**Estado**: ⚪ Backlog  
**Sprint Target**: Sprint 3 (2026-02-06)  
**Story Points**: 13

**Tasks**:
- [ ] Configurar Jest + React Testing Library
- [ ] Tests unitarios componentes críticos
- [ ] Tests integración APIs
- [ ] Configurar CI/CD para tests
- [ ] Alcanzar 60% cobertura

**Evidencia esperada**: 
- PR con setup de tests
- Build de CI pasando
- Coverage report

---

### Feature: Generador Real de PDFs (TD-002)
**Owner**: [Pendiente asignar]  
**Colaboradores**: Backend Lead  
**Prioridad**: P1  
**Estado**: ⚪ Backlog  
**Sprint Target**: Sprint 4 (2026-02-20)  
**Story Points**: 8

**Tasks**:
- [ ] Evaluar PDFKit vs alternativas
- [ ] Implementar templates de reporte
- [ ] Integrar en reports.service.ts
- [ ] Setup Supabase Storage
- [ ] Tests de generación

**Bloqueadores**: Decisión de librería PDF

---

### Feature: Usuario desde Sesión (TD-003)
**Owner**: [Pendiente asignar]  
**Colaboradores**: Frontend Lead  
**Prioridad**: P1  
**Estado**: ⚪ Backlog  
**Sprint Target**: Sprint 3 (2026-02-06)  
**Story Points**: 5

**Tasks**:
- [ ] Crear hook useCurrentUser()
- [ ] Reemplazar CURRENT_USER hardcoded
- [ ] Obtener rol desde DB vía API
- [ ] Validar permisos en UI

**Bloqueadores**: Ninguno

---

## 📊 Matriz de Responsabilidades (RACI)

| Actividad | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|-----------|-----------|---------|----------|--------|-----|----------|
| Arquitectura técnica | **A** | C | C | C | I | C |
| Code review | **A** | R | R | R | I | C |
| Deploy a producción | A | I | I | **R** | C | C |
| Security audit | A | C | C | C | I | **R** |
| Tests automatizados | A | C | C | I | **R** | I |
| Performance tuning | **A** | R | R | C | I | I |
| Bug fixes P0 | A | **R** | **R** | C | C | I |
| Documentación | C | R | R | R | R | R |

**Leyenda**:
- **R** = Responsible (ejecuta)
- **A** = Accountable (responsable final)
- **C** = Consulted (consultado)
- **I** = Informed (informado)

---

## 📅 On-Call y Rotación

### Rotación de On-Call
**Horario**: 24/7 coverage  
**Duración**: 1 semana por turno  
**Compensación**: [Por definir]

| Semana | Primary | Secondary |
|--------|---------|-----------|
| 2026-01-27 | [TBD] | [TBD] |
| 2026-02-03 | [TBD] | [TBD] |
| 2026-02-10 | [TBD] | [TBD] |

### SLAs de Respuesta

| Severidad | Tiempo de Respuesta | Tiempo de Resolución |
|-----------|---------------------|----------------------|
| P0 (Sistema caído) | 15 min | 4 horas |
| P1 (Crítico) | 1 hora | 24 horas |
| P2 (Alto) | 4 horas | 3 días |
| P3 (Medio) | 1 día | 1 semana |

---

## 🔄 Proceso de Handoff

Cuando un owner cambia (rotación, vacaciones, salida):

1. **Documentación de contexto**
   - Estado actual del módulo
   - Decisiones técnicas previas
   - Deuda técnica conocida
   - Puntos de contacto externos

2. **Knowledge transfer session**
   - 1 hora de walkthrough
   - Grabación de sesión
   - Q&A documentado

3. **Shadow period**
   - 1 semana de overlap
   - Nuevo owner observa
   - Viejo owner disponible para consultas

4. **Oficial handoff**
   - Actualización de este documento
   - Comunicación a equipo
   - Transferencia de accesos

---

## 📈 Métricas de Ownership

| Métrica | Target | Actual |
|---------|--------|--------|
| % tareas con owner asignado | 100% | 0% |
| Tiempo promedio de asignación | <24h | - |
| % tasks completadas on-time | >75% | - |
| Handoffs exitosos/trimestre | 100% | - |

---

## 🔄 Actualización

**Frecuencia**: Semanal (lunes en sprint planning)  
**Responsable**: Tech Lead  
**Próxima actualización**: 2026-01-30

---

**Última actualización**: 2026-01-23  
**Documento versión**: 1.0
