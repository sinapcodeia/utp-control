# 🎯 CAPA 1 - VISIÓN Y ALCANCE DEL PROYECTO

**Objetivo**: Alinear a ingeniería, producto y liderazgo

---

## Problema que Resuelve el Producto

### 🔴 Situación Actual (Pain Points)

Las organizaciones territoriales enfrentan:

1. **Fragmentación de información**: Datos dispersos en múltiples sistemas sin centralización
2. **Falta de trazabilidad**: No hay historial auditable de decisiones y comunicados
3. **Ineficiencia en comunicación**: Avisos críticos no llegan a tiempo a coordinadores regionales
4. **Ausencia de compliance**: No se cumple con estándares ISO 27001, SOC 2, LGPD/GDPR
5. **Pérdida de documentación**: Información crítica se pierde o modifica sin control

### 💚 Solución Propuesta

UTP CONTROL es un **sistema empresarial de gestión territorial** que:

- ✅ Centraliza información de múltiples regiones y municipalidades
- ✅ Garantiza integridad mediante hashing SHA-256
- ✅ Audita todas las acciones con trazabilidad completa
- ✅ Distribuye alertas en tiempo real según prioridad
- ✅ Cumple con estándares internacionales de seguridad

---

## 👤 Usuarios Objetivo

### Personas y Roles

| Rol | Descripción | Necesidades Principales |
|-----|-------------|------------------------|
| **ADMIN** | Administrador general del sistema | Control total, auditoría, gestión de usuarios |
| **COORDINATOR** | Coordinador regional | Publicar noticias regionales, generar reportes de su región |
| **GESTOR** | Gestor operativo | Análisis de datos, compliance, supervisión |
| **APOYO** | Personal de apoyo operativo | Recibir noticias, reportar novedades, tareas operativas |
| **USER** | Usuario estándar | Consultar documentos, comentar |

### User Journeys Principales

#### Journey 1: Coordinador Regional publica noticia crítica

```
1. Login con credenciales → 2. Navegar a /dashboard/news 
→ 3. Crear nueva noticia SECURITY con prioridad HIGH 
→ 4. Sistema auto-genera alerta → 5. Personal de apoyo recibe notificación
```

#### Journey 2: Admin genera reporte auditado

```
1. Login como ADMIN → 2. Ir a /dashboard/reports 
→ 3. Seleccionar tipo (REGIONAL), región y formato (PDF) 
→ 4. Sistema genera PDF + calcula SHA-256 
→ 5. Registro en audit_logs → 6. Reporte descargable con hash verificable
```

---

## 📦 Alcance del MVP

### ✅ Incluido en v1.0

**Autenticación y Autorización**
- [x] Login/logout con Supabase Auth
- [x] Roles: ADMIN, COORDINATOR, GESTOR, APOYO, USER
- [x] Control de acceso basado en roles (RBAC)
- [x] Permisos granulares en JSON

**Gestión de Noticias Regionales**
- [x] CRUD de noticias con categorías (CLIMATE, SECURITY, PUBLIC_ORDER, etc.)
- [x] Prioridades: LOW, MEDIUM, HIGH
- [x] Filtrado por región/municipalidad
- [x] Auto-generación de alertas para HIGH priority
- [x] Sistema de "read receipts" para noticias nacionales

**Gestión de Documentos**
- [x] Upload de documentos inmutables
- [x] Sistema de comentarios append-only
- [x] Hash SHA-256 para integridad
- [x] Versionado de documentos

**Reportes Empresariales**
- [x] Generación de reportes con código único
- [x] Formatos: PDF, XLSX, DOCX
- [x] Hash SHA-256 automático
- [x] Metadata en JSON
- [x] Jerarquía por región/municipalidad

**Auditoría y Compliance**
- [x] Tabla audit_logs con todas las operaciones
- [x] Registro de IP, usuario, acción, entidad
- [x] Datos inmutables una vez creados
- [x] Documentación de seguridad ISO 27001/SOC 2

**Dashboard y Visualización**
- [x] Vistas personalizadas por rol
- [x] Estadísticas en tiempo real
- [x] Gráficos de actividad
- [x] Control panel para ADMIN

---

## 🚫 Fuera de Alcance (Explícito)

### ❌ No incluido en v1.0

- ❌ **Aplicación móvil nativa** (iOS/Android) - Planeado para v2.0
- ❌ **Integración con WhatsApp Business API** - Planeado para v1.2
- ❌ **Integración con servicios de email** - Planeado para v1.1
- ❌ **Generador real de PDFs** - Mockado en v1.0
- ❌ **Upload a S3/Cloud Storage** - Mockado en v1.0
- ❌ **Tests automatizados** - Planeado para v1.1
- ❌ **i18n (internacionalización)** - Solo español en v1.0
- ❌ **Modo offline** - Requiere conexión en v1.0
- ❌ **Exportación masiva de datos** - Planeado para v1.3
- ❌ **Analytics avanzados** - Planeado para v1.4

---

## 📈 Métricas Clave (KPIs / OKRs)

### OKR Q1 2026

**Objetivo**: Validar product-market fit y asegurar adopción inicial

| Key Result | Métrica | Target | Actual |
|------------|---------|--------|--------|
| KR1: Usuarios activos | Usuarios con login mensual | 50 | - |
| KR2: Adopción de reportes | Reportes generados/mes | 100 | - |
| KR3: Engagement con noticias | % usuarios que leen noticias nacionales | 80% | - |
| KR4: Tiempo de respuesta | P95 latency API | <500ms | - |
| KR5: Seguridad | Zero incidentes de seguridad | 0 | - |

### Métricas Operacionales

| Métrica | Fórmula | Dashboard |
|---------|---------|-----------|
| **Uptime** | (tiempo online / tiempo total) × 100 | Pendiente implementar |
| **Errores por request** | (requests con error / total requests) × 100 | Pendiente implementar |
| **Tiempo medio de generación de reporte** | avg(tiempo de generación) | Pendiente implementar |
| **Usuarios activos diarios (DAU)** | count(distinct users per day) | `/dashboard/status` |
| **Adopción por región** | count(users) group by region | `/dashboard/analytics` |

---

## 🔄 Revisión y Actualización

**Frecuencia**: Trimestral (cada major release)  
**Próxima revisión**: 2026-04-23  
**Responsable**: Tech Lead + Product Owner

### Triggers para Revisión Extraordinaria

- Cambio en regulaciones (LGPD, GDPR, ISO)
- Pivot de producto
- Feedback crítico de usuarios
- Incidente de seguridad mayor

---

**Última actualización**: 2026-01-23  
**Versión del documento**: 1.0  
**Aprobado por**: [Pendiente]
