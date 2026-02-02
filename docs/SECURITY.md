# Política de Seguridad UTP CONTROL

## Resumen Ejecutivo

El sistema UTP CONTROL implementa controles de seguridad empresariales alineados con estándares internacionales para garantizar la confidencialidad, integridad y disponibilidad de información crítica de gestión territorial.

## Estándares de Cumplimiento

### ISO 27001:2022 - Gestión de Seguridad de la Información

**Controles Implementados:**

- **A.8.24 - Registro y Monitoreo de Eventos**: Sistema completo de auditoría (`AuditLog`) que registra todas las operaciones críticas
- **A.8.10 - Eliminación de Información**: Los reportes y documentos son inmutables una vez creados
- **A.5.14 - Transferencia de Información**: Todos los reportes generados incluyen hash SHA-256 para verificación de integridad
- **A.5.15 - Control de Acceso**: Sistema de permisos granular basado en roles (ADMIN, COORDINATOR, GESTOR, APOYO, USER)

### SOC 2 Type II - Criterios de Servicio de Confianza

**Seguridad (Security):**
- Autenticación mediante Supabase Auth con JWT
- Control de acceso basado en roles y permisos granulares
- Auditoría completa de todas las acciones del usuario

**Disponibilidad (Availability):**
- Base de datos PostgreSQL con alta disponibilidad mediante Supabase
- API RESTful con manejo de errores y recuperación

**Integridad de Procesamiento (Processing Integrity):**
- Validación de datos mediante class-validator en el backend
- Hash SHA-256 para verificación de integridad de reportes
- Sistema de versionado para documentos

**Confidencialidad (Confidentiality):**
- Datos sensibles almacenados solo en variables de entorno
- Comunicación mediante HTTPS/TLS
- Aislamiento de datos por región/municipalidad

**Privacidad (Privacy):**
- Cumplimiento con LGPD (Brasil) y GDPR (Europa)
- Sistema de aceptación de términos y condiciones
- Consentimientos rastreables con metadatos forenses

### NIST Cybersecurity Framework

**Identificar (Identify):**
- Catálogo completo de activos de información (usuarios, regiones, documentos, reportes)
- Clasificación de datos por sensibilidad

**Proteger (Protect):**
- Control de acceso basado en roles (RBAC)
- Cifrado de contraseñas mediante hashing
- Protección de APIs mediante autenticación JWT

**Detectar (Detect):**
- Logging completo de todas las acciones en `audit_logs`
- Monitoreo de actividad de usuarios
- Registro de IPs y metadata de sesión

**Responder (Respond):**
- Sistema de alertas para eventos de alta prioridad
- Notificaciones en tiempo real para coordinadores

**Recuperar (Recover):**
- Backup automático de base de datos en Supabase
- Datos inmutables para garantizar auditoría histórica

## Arquitectura de Seguridad

### 1. Autenticación y Autorización

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ 1. Login
       ▼
┌─────────────────┐
│  Supabase Auth  │ ← JWT Token
└──────┬──────────┘
       │ 2. Token Validation
       ▼
┌──────────────────┐
│   API Backend    │
│   (NestJS)       │ ← Role-Based Access Control
└──────┬───────────┘
       │ 3. Permission Check
       ▼
┌──────────────────┐
│    Database      │
│  (PostgreSQL)    │
└──────────────────┘
```

### 2. Integridad de Datos - Hash SHA-256

Todos los reportes generados incluyen un hash SHA-256 calculado sobre el contenido del archivo:

```typescript
// Ejemplo de generación de hash
const hash = crypto.createHash('sha256')
    .update(fileContent)
    .digest('hex');
```

Este hash se almacena en la base de datos (`reports.hash_sha256`) y permite:
- Verificar que el archivo no ha sido modificado
- Demostrar la integridad del documento en auditorías
- Cumplir con requisitos legales de no repudio

### 3. Auditoría Completa

Tabla `audit_logs` registra:
- **userId**: Quién realizó la acción
- **action**: Qué acción se realizó (CREATE, UPDATE, DELETE, GENERATE_REPORT, etc.)
- **entity**: Qué entidad fue afectada
- **entityId**: ID específico del registro
- **ipAddress**: Dirección IP del usuario
- **metadata**: Contexto adicional en formato JSON
- **timestamp**: Cuándo ocurrió la acción

### 4. Control de Acceso Granular

**Matriz de Permisos por Rol:**

| Recurso              | ADMIN | COORDINATOR | GESTOR | APOYO | USER |
|----------------------|-------|-------------|--------|-------|------|
| Ver Dashboard Global | ✅    | ❌          | ✅     | ❌    | ❌   |
| Generar Reportes     | ✅    | ✅ (región) | ✅     | ❌    | ❌   |
| Publicar Noticias    | ✅    | ✅ (región) | ❌     | ❌    | ❌   |
| Gestionar Usuarios   | ✅    | ❌          | ✅     | ❌    | ❌   |
| Ver Auditoría        | ✅    | ❌          | ✅     | ❌    | ❌   |
| Subir Documentos     | ✅    | ✅          | ✅     | ❌    | ✅   |
| Comentar Documentos  | ✅    | ✅          | ✅     | ✅    | ✅   |

### 5. Datos Inmutables

**Principio de Append-Only:**

Los siguientes registros son inmutables una vez creados:
- **Documentos** (`documents`): No se pueden editar, solo versionar
- **Comentarios** (`document_comments`): No se pueden editar ni eliminar
- **Reportes** (`reports`): No se pueden modificar, garantiza trazabilidad
- **Logs de Auditoría** (`audit_logs`): Registro permanente de acciones

## Gestión de Riesgos

### Riesgos Identificados y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Acceso no autorizado a datos sensibles | Alto | Media | Autenticación JWT + RBAC + Auditoría |
| Modificación de reportes históricos | Alto | Baja | Hash SHA-256 + Datos inmutables |
| Pérdida de datos | Alto | Baja | Backup automático Supabase + Replicación |
| Fuga de credenciales | Alto | Media | Variables de entorno + .gitignore |
| Inyección SQL | Alto | Baja | Prisma ORM con consultas parametrizadas |

## Respuesta a Incidentes

### Procedimiento de Respuesta

1. **Detección**: Monitoreo de logs de auditoría y alertas del sistema
2. **Contención**: Suspensión de cuentas comprometidas
3. **Erradicación**: Corrección de vulnerabilidad identificada
4. **Recuperación**: Restauración desde backup si es necesario
5. **Lecciones Aprendidas**: Actualización de políticas y controles

### Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- **Email**: security@utp-control.com
- **PGP Key**: [Pendiente]
- **Bug Bounty**: No disponible actualmente

## Backup y Recuperación

### Política de Backup

- **Frecuencia**: Diaria (automático vía Supabase)
- **Retención**: 30 días
- **Ubicación**: Múltiples regiones geográficas
- **Cifrado**: En tránsito y en reposo

### Procedimiento de Recuperación

1. Identificar punto de restauración necesario
2. Contactar a administrador de base de datos
3. Ejecutar restore desde consola de Supabase
4. Validar integridad de datos recuperados
5. Notificar a usuarios afectados

## Actualización de Política

Esta política se revisa trimestralmente y se actualiza cuando:
- Cambian los requisitos regulatorios
- Se identifican nuevas amenazas
- Se implementan nuevos controles de seguridad
- Ocurre un incidente de seguridad

**Última Actualización**: 2026-01-23  
**Próxima Revisión**: 2026-04-23  
**Versión**: 1.0.0
