# Política de Seguridad de la Información
## Conforme a ISO/IEC 27001:2022

**Versión:** 1.0  
**Fecha de efectividad:** 23 de Enero de 2026  
**Propietario:** CTO / Director de Seguridad  
**Clasificación:** INTERNAL

---

## 1. Propósito

Esta política establece el marco de seguridad de la información para proteger la confidencialidad, integridad y disponibilidad de los activos de información según los estándares ISO/IEC 27001, SOC 2 Type II, NIST SP 800-53, GDPR y LGPD.

---

## 2. Alcance

Aplica a:
- Todos los empleados, contratistas y terceros
- Todos los sistemas, aplicaciones y datos
- Toda la infraestructura (cloud, on-premise, híbrida)

---

## 3. Clasificación de Datos

| Nivel | Descripción | Ejemplos | Cifrado | Backup |
|-------|-------------|----------|---------|--------|
| **PUBLIC** | Información pública | Marketing, documentación pública | Opcional | Semanal |
| **INTERNAL** | Uso interno | Comunicaciones internas, métricas | Recomendado | Diario |
| **CONFIDENTIAL** | Datos sensibles del negocio | Contratos, estrategias | **Obligatorio** | Cada 6h |
| **RESTRICTED** | Datos altamente sensibles | PII, PHI, financieros | **Obligatorio (AES-256)** | Cada 1h |

---

## 4. Control de Accesos

### 4.1 Principio de Mínimo Privilegio
- Acceso basado en roles (RBAC)
- Revisión trimestral de permisos
- Desactivación inmediata al terminar relación laboral

### 4.2 Autenticación
- **Contraseñas:** Mínimo 12 caracteres, complejidad alta
- **MFA obligatorio** para:
  - Administradores
  - Acceso a datos CONFIDENTIAL/RESTRICTED
  - Acceso remoto
- **Sesiones:** Timeout 30 minutos de inactividad

### 4.3 Matriz de Roles

| Rol | Permisos | Clasificación Máxima |
|-----|----------|---------------------|
| **ADMIN** | Full access, gestión de usuarios | RESTRICTED |
| **COORDINATOR** | Gestión regional, reports | CONFIDENTIAL |
| **USER** | Lectura documentos, news | INTERNAL |

---

## 5. Cifrado

### 5.1 En Reposo
- **Base de datos:** AES-256-GCM (Supabase encryption)
- **Archivos:** AES-256 server-side encryption (S3)
- **Backups:** GPG encryption antes de almacenamiento

### 5.2 En Tránsito
- **TLS 1.3** mínimo para todas las comunicaciones
- **Certificate pinning** en aplicaciones móviles
- **mTLS** para comunicación entre servicios

### 5.3 Gestión de Claves
- AWS KMS / Supabase Vault
- Rotación automática cada 90 días
- Separación por entorno (dev/staging/prod)
- Claves nunca en código fuente

---

## 6. Desarrollo Seguro

### 6.1 Revisión de Código
- Peer review obligatorio
- SAST automático en CI/CD (SonarQube)
- Dependency scanning (Snyk)
- Secret scanning (TruffleHog)

### 6.2 Gestión de Dependencias
- Auditoría mensual de vulnerabilidades
- Actualización inmediata de CVE críticos
- Prohibido uso de dependencias obsoletas

### 6.3 Entornos
- **Desarrollo:** Datos sintéticos únicamente
- **Staging:** Anonimización de datos de producción
- **Producción:** Acceso restringido y auditado

---

## 7. Monitoreo y Auditoría

### 7.1 Logging
- Todos los eventos de seguridad registrados
- Retención: 7 años (compliance)
- Centralización en SIEM

### 7.2 Eventos Críticos
- Intentos de acceso fallidos (3+ en 5 min)
- Cambios en permisos
- Acceso a datos RESTRICTED
- Modificación de configuraciones

### 7.3 Auditorías
- **Interna:** Trimestral
- **Externa:** Anual (SOC 2)
- **Penetration testing:** Semestral

---

## 8. Gestión de Incidentes

### 8.1 Clasificación

| Severidad | RTO | Notificación |
|-----------|-----|--------------|
| **CRITICAL** | 1 hora | Inmediata (CEO, CTO, CISO) |
| **HIGH** | 4 horas | Dentro de 1 hora |
| **MEDIUM** | 24 horas | Dentro de 4 horas |
| **LOW** | 72 horas | Siguiente día hábil |

### 8.2 Respuesta
1. **Contención:** Aislar sistema afectado
2. **Erradicación:** Eliminar causa raíz
3. **Recuperación:** Restaurar servicios
4. **Lecciones aprendidas:** Post-mortem en 48h

---

## 9. Backup y Recuperación

### 9.1 Estrategia 3-2-1
- **3** copias de los datos
- **2** tipos de medios diferentes
- **1** copia offsite (multi-región)

### 9.2 Frecuencias
| Datos | Backup | Retención |
|-------|---------|-----------|
| Base de datos | Incremental 6h, completo diario | 90 días |
| Archivos | Tiempo real (replicación) | 30 días |
| Configuraciones | Git + diario | Permanente |

### 9.3 Objetivos
- **RTO (Recovery Time Objective):** < 4 horas
- **RPO (Recovery Point Objective):** < 15 minutos

### 9.4 Pruebas
- Simulación mensual de restauración
- DR full drill trimestral

---

## 10. Cumplimiento Normativo

### 10.1 GDPR / LGPD
- **Derecho al olvido:** Implementado
- **Portabilidad de datos:** API disponible
- **Consentimiento explícito:** Requerido
- **DPO:** Data Protection Officer designado

### 10.2 SOC 2 Type II
- Controles de seguridad documentados
- Auditoría anual de efectividad
- Evidencias mantenidas 7 años

### 10.3 ISO 27001
- ISMS (Information Security Management System) implementado
- Revisión anual de políticas
- Certificación objetivo: Q2 2026

---

## 11. Capacitación

### 11.1 Onboarding
- Formación en seguridad obligatoria (4 horas)
- Firma de NDA y políticas
- Evaluación de conocimientos

### 11.2 Continua
- Awareness training trimestral
- Phishing simulations mensuales
- Actualizaciones de políticas comunicadas

---

## 12. Sanciones

El incumplimiento de esta política puede resultar en:
- Advertencia escrita
- Suspensión de accesos
- Terminación de contrato
- Acciones legales (si aplica)

---

## 13. Revisión de Política

- **Frecuencia:** Anual o tras incidente de seguridad
- **Responsables:** CISO, CTO, Legal
- **Aprobación:** CEO / Board

---

## 14. Contacto

**CISO / Security Team:** security@company.com  
**Reportar Incidente:** incident@company.com  
**DPO / Privacy:** privacy@company.com

---

**Aprobado por:**  
[Firmas digitales de CEO, CTO, CISO]

**Fecha de próxima revisión:** 23 de Enero de 2027
