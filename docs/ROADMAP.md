# 🗺️ CAPA 3 - ROADMAP, DEPENDENCIAS E HITOS

**Objetivo**: Saber qué va primero, qué bloquea y qué desbloquea

> Las grandes startups no planifican por fechas, sino por hitos.

---

## 📍 Roadmap por Fases

### ✅ FASE 1: MVP (COMPLETADO - v1.0.0)

**Objetivo**: Validar concepto con funcionalidad core

**Entregables**:
- [x] Sistema de autenticación con Supabase
- [x] CRUD de noticias regionales
- [x] Sistema de documentos inmutables
- [x] Generación de reportes (mockado)
- [x] Auditoría básica
- [x] Dashboard por roles
- [x] Diseño UI/UX profesional

**Estado**: ✅ Completado 2026-01-23

---

### 🚧 FASE 2: Post-MVP (EN CURSO - v1.1.0)

**Objetivo**: Hacer el sistema production-ready

**Fecha estimada**: 2026-02-15

**Entregables**:
- [ ] Tests automatizados (60% cobertura)
- [ ] Generador real de PDFs
- [ ] Upload a Supabase Storage
- [ ] Integración de email notifications
- [ ] Usuario desde sesión real (sin hardcode)
- [ ] Validación de permisos en backend
- [ ] Error handling centralizado

**Hitos clave**:
- 🏁 H1: Tests implementados (2026-02-07)
- 🏁 H2: PDFs funcionales (2026-02-10)
- 🏁 H3: Code freeze (2026-02-13)
- 🏁 H4: Release candidate (2026-02-14)
- 🏁 H5: Producción v1.1 (2026-02-15)

---

### 📅 FASE 3: Escalamiento (PLANEADO - v1.2.0)

**Objetivo**: Soportar crecimiento de usuarios y datos

**Fecha estimada**: 2026-03-15

**Entregables**:
- [ ] WhatsApp Business API integration
- [ ] Rate limiting y protección DDoS
- [ ] Caching con Redis
- [ ] Optimización de queries
- [ ] Índices de base de datos
- [ ] Monitoreo con Sentry
- [ ] Logging estructurado (Winston/Pino)

**Capacidad Target**:
- 1000 usuarios concurrentes
- <200ms P95 latency
- 99.9% uptime

---

### 🎯 FASE 4: Optimización (PLANEADO - v1.3.0)

**Objetivo**: Mejorar UX y automatización

**Fecha estimada**: 2026-04-30

**Entregables**:
- [ ] Aplicación móvil (React Native)
- [ ] PWA offline-first
- [ ] Exportación masiva de datos
- [ ] Analytics avanzados
- [ ] Dashboard de métricas en tiempo real
- [ ] Internacionalización (i18n)
- [ ] Dark mode mejorado

---

## 🔗 Dependencias

### Dependencias Técnicas

| Item | Depende de | Tipo | Estado |
|------|------------|------|--------|
| Tests automatizados | - | Core | 🟡 En progreso |
| PDFs reales | Tests completados | Feature | ⚪ Pendiente |
| Email notifications | PDFs reales | Feature | ⚪ Pendiente |
| WhatsApp integration | Email funcionando | Feature | ⚪ Pendiente |
| App móvil | API estable v1.2 | Platform | ⚪ Pendiente |
| Analytics avanzados | Logging estructurado | Feature | ⚪ Pendiente |

### Dependencias de Negocio

| Item | Requiere | Responsable | Estado |
|------|----------|-------------|--------|
| Deploy a producción | Aprobación legal | Legal | ⚪ Pendiente |
| Integración WhatsApp | Cuenta WhatsApp Business | Ops | ⚪ Pendiente |
| Storage S3/Supabase | Decisión de infra | DevOps | 🟡 Evaluando |
| Dominio personalizado | Compra de dominio | Ops | ⚪ Pendiente |

### Dependencias Externas

| Servicio | Provider | Criticidad | Alternativa |
|----------|----------|------------|-------------|
| Base de datos | Supabase PostgreSQL | 🔴 Crítico | AWS RDS |
| Autenticación | Supabase Auth | 🔴 Crítico | Auth0 |
| Storage | Supabase Storage | 🟠 Alto | AWS S3 |
| Email | [Por definir] | 🟠 Alto | SendGrid/AWS SES |
| WhatsApp | WhatsApp Business API | 🟢 Medio | Twilio |

---

## 🏁 Hitos Detallados

### v1.1.0 - Production Ready

**Feature Complete**: 2026-02-10  
**Code Freeze**: 2026-02-13  
**Release Candidate**: 2026-02-14  
**Producción**: 2026-02-15

**Criterios de Aceptación**:
- ✅ Tests >60% cobertura
- ✅ PDFs se generan correctamente
- ✅ Emails se envían
- ✅ Zero bugs P0
- ✅ Performance: P95 <500ms
- ✅ Security review pasado
- ✅ Documentación actualizada

**Rollback Plan**:
- DB migration reversible
- Feature flags para funcionalidad nueva
- Backup antes de deploy

---

### v1.2.0 - Escalamiento

**Feature Complete**: 2026-03-10  
**Code Freeze**: 2026-03-13  
**Producción**: 2026-03-15

**Criterios de Aceptación**:
- ✅ Soporta 1000 usuarios concurrentes
- ✅ Rate limiting activo
- ✅ Caching implementado
- ✅ Monitoring activo (Sentry)
- ✅ Logs estructurados
- ✅ WhatsApp notifications funcionan

---

### v1.3.0 - Mobile & Analytics

**Feature Complete**: 2026-04-25  
**Producción**: 2026-04-30

**Criterios de Aceptación**:
- ✅ App móvil en App Store/Play Store
- ✅ PWA offline funciona
- ✅ Analytics dashboard activo
- ✅ i18n (español + inglés)

---

## 📊 Tracking de Progreso

### Sprint Actual (Sprint 3 - 2026-01-23 a 2026-02-06)

| Tarea | Owner | Estado | Bloqueador |
|-------|-------|--------|------------|
| Implementar tests unitarios | [TBD] | ⚪ Pendiente | - |
| Generar PDFs reales | [TBD] | ⚪ Pendiente | Decisión de librería |
| Arreglar usuario hardcodeado | [TBD] | ⚪ Pendiente | - |
| Validación de permisos backend | [TBD] | ⚪ Pendiente | - |

### Burndown

```
Sprint 3 Capacity: 40 story points
Completed: 0 SP
Remaining: 40 SP
Days left: 14
```

---

## 🎯 Métricas de Roadmap

| Métrica | Target | Actual |
|---------|--------|--------|
| Velocidad promedio | 30 SP/sprint | - |
| Predictibilidad | >80% | - |
| Días desde último deploy | <7 días | - |
| Features on-time | >75% | - |

---

## 🔄 Proceso de Actualización

**Frecuencia**: Bi-semanal (cada sprint planning)  
**Responsable**: Product Owner + Tech Lead  
**Próxima actualización**: 2026-02-06

### Cambios en Roadmap

Cualquier cambio mayor (mover >1 mes una fecha, cancelar feature) requiere:
1. Propuesta escrita con justificación
2. Análisis de impacto en dependencias
3. Aprobación de stakeholders
4. Comunicación a equipo

---

**Última actualización**: 2026-01-23  
**Documento versión**: 1.0
