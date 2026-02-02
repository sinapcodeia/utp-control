# ✅ CAPA 2 - DESGLOSE FUNCIONAL Y TÉCNICO

**Objetivo**: Traducir ideas en trabajo ejecutable

---

## 📑 Índice

1. [Requerimientos Funcionales](#requerimientos-funcionales)
2. [Requerimientos Técnicos](#requerimientos-técnicos)
3. [Checklist de Implementación](#checklist-de-implementación)

---

## 1️⃣ REQUERIMIENTOS FUNCIONALES

### RF-001: Sistema de Autenticación

**Descripción**: Los usuarios deben poder autenticarse de forma segura

**Flujo de Usuario**:
1. Usuario ingresa a `/login`
2. Introduce email y password
3. Sistema valida credenciales con Supabase Auth
4. Redirige a `/dashboard` según rol
5. Session persiste con JWT

**Casos Normales**:
- Login exitoso → redirect dashboard
- Logout → redirect login
- Session expira → redirect login

**Edge Cases**:
- Credenciales incorrectas → mensaje error
- Email no verificado → bloquear login
- Usuario desactivado → mensaje "cuenta suspendida"
- Múltiples intentos fallidos → rate limiting

**Impacto UX/UI**:
- Formulario simple y claro
- Mensajes de error descriptivos
- Loading states

**Estado**: ✅ Implementado

---

### RF-002: Gestión de Noticias Regionales

**Descripción**: Coordinadores publican noticias filtradas por región

**Flujo de Usuario**:
1. Coordinator navega a `/dashboard/news`
2. Click "Nueva Noticia"
3. Completa formulario:
   - Categoría (CLIMATE, SECURITY, etc.)
   - Prioridad (LOW, MEDIUM, HIGH)
   - Contenido (texto)
   - Región/Municipalidad (opcional)
4. Click "Publicar"
5. Sistema:
   - Guarda en `regional_reports`
   - Si prioridad HIGH → auto-crea `alert`
   - Envía a audit_logs

**Casos Normales**:
- Noticia regional → solo usuarios de esa región ven
- Noticia nacional (sin región) → todos ven
- HIGH priority → genera alerta automática

**Edge Cases**:
- Content vacío → validación frontend
- Usuario sin permisos → bloquear en backend
- Región inexistente → validación

**Impacto UX/UI**:
- Modal o página dedicada
- Preview antes de publicar
- Confirmación visual post-publicación

**Estado**: ✅ Implementado

---

### RF-003: Sistema de Documentos Inmutables

**Descripción**: Upload y versionado de documentos oficiales

**Flujo de Usuario**:
1. Usuario navega a `/dashboard/documents`
2. Click "Subir Documento"
3. Selecciona archivo (PDF, DOCX, etc.)
4. Ingresa título
5. Click "Subir"
6. Sistema:
   - Calcula SHA-256 del archivo
   - Sube a storage
   - Guarda metadata en `documents`
   - Audit log

**Casos Normales**:
- Ver lista de documentos
- Descargar documento
- Añadir comentario (append-only)

**Edge Cases**:
- Archivo >10MB → rechazar con mensaje
- Formato no soportado → validar extensión
- Duplicate hash → advertir posible duplicado

**Impacto UX/UI**:
- Drag & drop para upload
- Progress bar durante upload
- Lista filtrable y buscable

**Estado**: ✅ Implementado (storage mockado)

---

### RF-004: Generación de Reportes Empresariales

**Descripción**: Generar reportes con código único y hash SHA-256

**Flujo de Usuario**:
1. Admin/Coordinator navega a `/dashboard/reports`
2. Click "Generar Reporte"
3. Selecciona:
   - Tipo (GENERAL, REGIONAL, AUDIT, ALERT)
   - Formato (PDF, XLSX, DOCX)
   - Región/Municipalidad (si aplica)
   - Filtros (rango fechas, etc.)
4. Click "Generar"
5. Sistema:
   - Genera código único (INF-REG_2026-01-23_A1B2)
   - Obtiene datos según filtros
   - Genera archivo PDF/Excel
   - Calcula SHA-256
   - Guarda en `reports`
   - Audit log
6. Usuario puede descargar reporte

**Casos Normales**:
- Reporte regional → solo datos de esa región
- Reporte general → todos los datos
- Hash permite verificar integridad futura

**Edge Cases**:
- Sin datos para filtros → reportar "sin resultados"
- Generación falla → retry automático
- Usuario sin permisos para región → bloquear

**Impacto UX/UI**:
- Wizard multi-paso para configuración
- Preview de datos antes de generar
- Download automático o link persistente

**Estado**: 🟡 MVP (PDF mockado)

---

### RF-005: Dashboard Personalizado por Rol

**Descripción**: Cada rol ve información relevante a su función

**Flujo de Usuario**:
1. Usuario hace login
2. Sistema detecta rol desde DB
3. Renderiza vista correspondiente:
   - **ADMIN**: Stats globales, quick actions
   - **COORDINATOR**: Noticias regionales, reportes
   - **GESTOR**: Compliance, analytics
   - **APOYO**: Tareas operativas, noticias
   - **USER**: Documentos, consultas

**Casos Normales**:
- Cada vista tiene widgets específicos
- Navegación sidebar filtrada por permisos

**Edge Cases**:
- Rol no definido → default a USER
- Usuario con múltiples roles → priorizar más alto

**Impacto UX/UI**:
- Diseño consistente pero contenido diferente
- Animaciones y transiciones suaves

**Estado**: ✅ Implementado

---

### RF-006: Auditoría Completa

**Descripción**: Registrar todas las acciones para compliance

**Flujo Automático**:
- Cada acción crítica genera entrada en `audit_logs`
- Campos: userId, action, entity, entityId, ipAddress, metadata, timestamp

**Casos a Auditar**:
- Login/logout
- Crear/editar/eliminar noticia
- Generar reporte
- Upload documento
- Cambiar permisos de usuario

**Edge Cases**:
- Sistema caído → logs en cola para retry
- IP no disponible → registrar como "N/A"

**Impacto UX/UI**:
- Invisible para usuario final
- Admin puede ver `/dashboard/audit` con logs

**Estado**: ✅ Implementado (modelo DB)

---

## 2️⃣ REQUERIMIENTOS TÉCNICOS

### RT-001: Frontend (Next.js 16)

**Stack**:
- ✅ Next.js 16.1.4 (App Router)
- ✅ React 19 (RSC)
- ✅ TypeScript 5
- ✅ Tailwind CSS 4
- ✅ Radix UI (componentes)
- ✅ Recharts (gráficos)
- ✅ Sonner (toasts)
- ⚪ React Query (pendiente v1.2)

**Componentes Clave**:
```
src/
├── app/
│   ├── auth/
│   ├── dashboard/
│   │   ├── page.tsx (dashboard principal)
│   │   ├── news/
│   │   ├── documents/
│   │   ├── reports/
│   │   └── users/
│   └── login/
├── components/
│   ├── ui/ (Radix primitives)
│   └── dashboard/
│       ├── role-views/
│       ├── DashboardFooter.tsx
│       └── activity-chart.tsx
├── types/
│   └── index.ts (18 interfaces)
└── utils/
    └── supabase/ (client setup)
```

**Estados Globales**:
- ⚪ Implementar React Query para cache (v1.2)
- ⚪ Zustand para estado local compartido (v1.2)

**Performance**:
- ✅ Code splitting por ruta (automático Next.js)
- ✅ Image optimization
- ⚪ Bundle analyzer (pendiente)

---

### RT-002: Backend (NestJS)

**Stack**:
- ✅ NestJS 11
- ✅ Prisma 5.19.1
- ✅ PostgreSQL (Supabase)
- ✅ Passport JWT
- ⚪ Redis (pendiente v1.2)

**Módulos**:
```
src/
├── app.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── supabase.strategy.ts
│   └── jwt.strategy.ts
├── regional-reports/
│   ├── regional-reports.service.ts
│   ├── regional-reports.controller.ts
│   └── dto/
├── reports/
│   ├── reports.service.ts
│   └── dto/
├── documents/
│   └── documents.service.ts
├── users/
│   └── users.service.ts
├── prisma/
│   └── prisma.service.ts
└── stats.controller.ts
```

**Validación**:
- ✅ class-validator para DTOs
- ⚪ Guards para permisos (pendiente TD-004)

**Error Handling**:
- ⚪ ExceptionFilter global (pendiente TD-006)

---

### RT-003: Base de Datos (PostgreSQL)

**Schema Prisma**:
- ✅ 14 modelos definidos
- ✅ Enums: Role, ReportType, Priority, NewsCategory, etc.
- ✅ Relaciones: User → Region → Reports
- ⚪ Índices optimizados (pendiente TD-005)

**Tablas Críticas**:
```sql
users           -- Usuarios y roles
audit_logs      -- Auditoría completa
regional_reports -- Noticias regionales
reports         -- Reportes empresariales
documents       -- Documentos inmutables
document_comments -- Comentarios append-only
alerts          -- Alertas automáticas
news_read_receipts -- Tracking de lectura
regions         -- Regiones
municipalities  -- Municipalidades
```

**Integridad**:
- ✅ Foreign keys
- ✅ Unique constraints
- ✅ Default values
- ⚪ Triggers para audit (pendiente)

---

### RT-004: Infraestructura

**Hosting**:
- ⚪ Vercel (frontend) - pendiente deploy
- ⚪ Railway/Render (backend) - pendiente deploy
- ✅ Supabase (DB + Auth)

**Storage**:
- ⚪ Supabase Storage o AWS S3 (pendiente TD-002)

**Monitoreo**:
- ⚪ Sentry (error tracking) - v1.2
- ⚪ Prometheus + Grafana (métricas) - v1.3

**CI/CD**:
- ⚪ GitHub Actions (pendiente)

---

### RT-005: Seguridad

**Autenticación**:
- ✅ Supabase Auth (JWT)
- ✅ Roles en DB
- ⚪ Refresh token rotation (v1.2)

**Autorización**:
- ✅ RBAC (Role-Based Access Control)
- ⚪ Guards en NestJS (pendiente)
- ⚪ Row Level Security en Supabase (v1.2)

**Data Protection**:
- ✅ Hash SHA-256 para reportes/documentos
- ✅ Passwords hasheados (Supabase)
- ⚪ Encryption at rest (Supabase default)
- ⚪ TLS en transit (producción)

**Audit**:
- ✅ audit_logs table
- ✅ Timestamp + IP + metadata

---

## 3️⃣ CHECKLIST DE IMPLEMENTACIÓN

### ✅ Completado (v1.0.0)

**Autenticación**:
- [x] Setup Supabase Auth
- [x] Login/logout flow
- [x] Middleware para rutas protegidas
- [x] Roles en DB

**Frontend**:
- [x] Sistema de tipos TypeScript
- [x] Dashboard con 4 vistas por rol
- [x] Páginas: news, documents, reports, users, audit
- [x] Footer profesional con compliance badges
- [x] Toast notifications
- [x] Responsive design

**Backend**:
- [x] Módulos NestJS (auth, reports, regional-reports, documents, users)
- [x] Prisma schema completo
- [x] Audit logging básico
- [x] CRUD APIs

**Base de Datos**:
- [x] 14 modelos Prisma
- [x] Migraciones base
- [x] Seed data (opcional)

**Documentación**:
- [x] SECURITY.md (ISO 27001, SOC 2)
- [x] PROJECT_FRAMEWORK.md
- [x] VISION.md
- [x] ROADMAP.md
- [x] TECHNICAL_DEBT.md
- [x] OWNERSHIP.md
- [x] QUALITY.md
- [x] CHANGELOG.md

---

### ⚪ Pendiente (v1.1.0)

**Testing**:
- [ ] Jest setup
- [ ] Unit tests (60% coverage)
- [ ] Integration tests (APIs)
- [ ] E2E tests (login flow)

**Backend**:
- [ ] PDF generator real (PDFKit)
- [ ] Upload a Supabase Storage
- [ ] Guards para validación de permisos
- [ ] ExceptionFilter global
- [ ] Env vars validation

**Frontend**:
- [ ] useCurrentUser() hook
- [ ] Reemplazar usuario hardcoded
- [ ] React Query para caching

**Infraestructura**:
- [ ] CI/CD GitHub Actions
- [ ] Deploy a Vercel/Railway
- [ ] Environment setup (staging/prod)

---

### 🔮 Planead (v1.2+)

**Features**:
- [ ] Email notifications
- [ ] WhatsApp Business API
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Analytics dashboard
- [ ] Mobile app

**Infra**:
- [ ] Sentry monitoring
- [ ] Logging estructurado
- [ ] Performance monitoring

---

**Última actualización**: 2026-01-23  
**Documento versión**: 1.0
