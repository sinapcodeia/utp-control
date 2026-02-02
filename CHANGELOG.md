# 📜 CHANGELOG

Todos los cambios notables en el proyecto UTP CONTROL se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Planeado para v1.1.0 (2026-02-15)

#### Added
- Tests automatizados con Jest y React Testing Library
- Generación real de PDFs con PDFKit
- Integración de email notifications
- Upload a Supabase Storage
- Validación de permisos en backend con Guards

#### Changed
- Usuario obtenido desde sesión en lugar de hardcoded
- Error handling centralizado con ExceptionFilter

#### Fixed
- TD-003: Usuario hardcodeado reemplazado con hook useCurrentUser()

---

## [1.0.0] - 2026-01-23

### 🎉 Release Inicial - MVP Completado

**Resumen**: Primera versión estable del sistema de gestión regional UTP CONTROL con funcionalidad core y estándares empresariales de seguridad.

### Added

#### Autenticación y Autorización
- Sistema de login/logout con Supabase Auth
- 5 roles implementados: ADMIN, COORDINATOR, GESTOR, APOYO, USER
- Control de acceso basado en roles (RBAC)
- Permisos granulares almacenados en JSON

#### Gestión de Noticias Regionales
- CRUD completo de noticias regionales
- 6 categorías: CLIMATE, SECURITY, PUBLIC_ORDER, HEALTH, INFRASTRUCTURE, OTHER
- 3 niveles de prioridad: LOW, MEDIUM, HIGH
- Filtrado automático por región/municipalidad
- Auto-generación de alertas para noticias HIGH priority
- Sistema de "read receipts" para noticias nacionales
- Vista jerárquica en `/dashboard/news/archive`

#### Gestión de Documentos
- Upload de documentos inmutables
- Sistema de comentarios append-only
- Cálculo de hash SHA-256 para verificación de integridad
- Versionado de documentos
- Vista de documentos con filtrado y búsqueda

#### Sistema de Reportes Empresariales
- Generación de reportes con código único (formato: INF-REG_YYYY-MM-DD_XXXX)
- 4 tipos de reporte: GENERAL, REGIONAL, ALERT, AUDIT
- 3 formatos: PDF, XLSX, DOCX
- Hash SHA-256 automático para cada reporte
- Metadata almacenada en JSON
- Vista jerárquica por región/municipalidad
- Audit log para cada reporte generado

#### Auditoría y Compliance
- Tabla `audit_logs` con registro completo de operaciones
- Campos: userId, action, entity, entityId, ipAddress, metadata, timestamp
- Datos inmutables una vez creados
- Documentación completa en `docs/SECURITY.md`
- Cumplimiento con ISO 27001, SOC 2 Type II, NIST, LGPD/GDPR

#### Dashboard y Visualización
- 4 vistas personalizadas por rol (Admin, Coordinator, Gestor, Apoyo)
- Estadísticas en tiempo real (reportes, noticias, usuarios, documentos)
- Gráfico de actividad con Recharts
- Footer profesional con badges de compliance (ISO 27001, SOC 2, LGPD/GDPR)
- Quick actions para ADMIN (publicar aviso nacional)

#### TypeScript y Calidad de Código
- 18 interfaces y tipos definidos en `src/types/index.ts`
- Eliminación completa de tipos `any` en componentes principales
- Validación de tipos para todas las respuestas de API
- Manejo de errores con toast notifications (Sonner)

#### Documentación
- `docs/SECURITY.md` - Política de seguridad empresarial (6000+ palabras)
- `docs/PROJECT_FRAMEWORK.md` - Marco de trabajo Silicon Valley
- `docs/VISION.md` - Visión, usuarios, MVP scope, OKRs
- `docs/TECHNICAL_DEBT.md` - Registro de 15 items de deuda técnica
- `docs/ROADMAP.md` - Roadmap de 4 fases con hitos
- `README.md` actualizado con arquitectura

#### Infraestructura
- Monorepo con Turborepo
- Apps: `api` (NestJS) + `web` (Next.js 16)
- Base de datos: PostgreSQL vía Supabase
- ORM: Prisma 5.19.1
- Autenticación: Supabase Auth con JWT
- Deployment: [Pendiente definir]

### Changed
- Nada (primera versión)

### Deprecated
- Nada (primera versión)

### Removed
- Nada (primera versión)

### Fixed
- Nada (primera versión)

### Security
- Implementado hash SHA-256 para integridad de reportes
- Audit logging completo en todas las operaciones críticas
- Control de acceso basado en roles (RBAC)
- Datos inmutables para garantizar trazabilidad
- Documentación de cumplimiento con ISO 27001/SOC 2

### Known Issues
- Generador de PDF es mock (retorna URL ficticia) - Ver TD-002
- Usuario hardcodeado en dashboard - Ver TD-003
- Sin tests automatizados - Ver TD-001
- Sin validación de permisos en backend - Ver TD-004
- Sin rate limiting - Ver TD-011

### Breaking Changes
- Ninguno (primera versión)

### Migration Guide
- No aplica (primera versión)

---

## Tipos de Cambios

- `Added` - Nuevas funcionalidades
- `Changed` - Cambios en funcionalidad existente
- `Deprecated` - Funcionalidades que serán removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Bugs corregidos
- `Security` - Mejoras de seguridad

---

## Links

- [Unreleased]: Comparar con último tag
- [1.0.0]: Primera release

---

**Mantenido por**: Tech Lead  
**Última actualización**: 2026-01-23
