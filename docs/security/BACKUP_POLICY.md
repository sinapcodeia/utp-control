# Política de Backup y Disaster Recovery
## Conforme a ISO 22301:2019 (Business Continuity)

**Versión:** 1.0  
**Fecha de efectividad:** 23 de Enero de 2026  
**Propietario:** CTO / Director de Infraestructura  
**Clasificación:** CONFIDENTIAL

---

## 1. Estrategia de Backup: Regla 3-2-1

### Principio
- **3** copias de los datos (1 producción + 2 backups)
- **2** tipos de medios diferentes (DB + Object Storage)
- **1** copia offsite (multi-región geográfica)

---

## 2. Frecuencias y Retención

| Componente | Tipo | Frecuencia | Retención | Ubicación |
|------------|------|-----------|-----------|-----------|
| **Base de Datos** | Full | Diario (00:00 UTC) | 90 días | Supabase Multi-AZ + S3 |
| **Base de Datos** | Incremental | Cada 6 horas | 7 días | Supabase WAL |
| **Base de Datos** | Transaction Log | Continuo | 24 horas | Supabase Streaming |
| **Archivos (S3)** | Replicación | Tiempo real | 30 días | Multi-región |
| **Código** | Git | En cada commit | Permanente | GitHub + Mirror |
| **Configuraciones** | Snapshot | Diario | 365 días | Git + Vault |
| **Audit Logs** | Full | Diario | 7 años | S3 Glacier |

---

## 3. Objetivos de Recuperación

### 3.1 RTO (Recovery Time Objective)
| Severidad | Sistema | RTO |
|-----------|---------|-----|
| **CRITICAL** | Base de datos primaria | < 1 hora |
| **HIGH** | API Backend | < 2 horas |
| **MEDIUM** | Frontend Web | < 4 horas |
| **LOW** | Reportes históricos | < 24 horas |

### 3.2 RPO (Recovery Point Objective)
| Datos | RPO | Pérdida Máxima Aceptable |
|-------|-----|-------------------------|
| **Transacciones** | < 5 minutos | Últimas transacciones |
| **Documentos** | < 15 minutos | Último documento subido |
| **Configuraciones** | < 1 hora | Último cambio de config |
| **Métricas** | < 1 hora | Datos agregados |

---

## 4. Procedimientos de Backup

### 4.1 Backup Automático de Base de Datos

bash
#!/bin/bash
# Ejecutado vía cron: 0 */6 * * * (cada 6 horas)

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="db_backup_${TIMESTAMP}"

# 1. Dump de BD con compresión
pg_dump $DATABASE_URL | gzip > /tmp/${BACKUP_NAME}.sql.gz

# 2. Cifrado GPG
gpg --encrypt --recipient backup@company.com /tmp/${BACKUP_NAME}.sql.gz

# 3. Upload a S3 con versionado
aws s3 cp /tmp/${BACKUP_NAME}.sql.gz.gpg \
  s3://backups-primary/database/${BACKUP_NAME}.sql.gz.gpg \
  --storage-class INTELLIGENT_TIERING

# 4. Verificación de integridad
sha256sum /tmp/${BACKUP_NAME}.sql.gz.gpg > /tmp/${BACKUP_NAME}.sha256
aws s3 cp /tmp/${BACKUP_NAME}.sha256 s3://backups-primary/checksums/

# 5. Replicación a región secundaria
aws s3 sync s3://backups-primary s3://backups-dr-secondary --delete

# 6. Clean up local
rm -f /tmp/${BACKUP_NAME}.*

# 7. Notificación
curl -X POST $SLACK_WEBHOOK \
  -d "{'text':'✅ Backup ${BACKUP_NAME} completado'}"


### 4.2 Verificación de Backups

Los backups se verifican automáticamente:
1. **Checksum validation** cada 6 horas
2. **Test restore** semanal a entorno staging
3. **Full DR drill** trimestral

---

## 5. Plan de Disaster Recovery

### 5.1 Escenarios de Desastre

| Escenario | Probabilidad | Impacto | Estrategia |
|-----------|--------------|---------|-----------|
| **Pérdida de región AWS** | Baja | Crítico | Failover a región secundaria |
| **Corrupción de BD** | Media | Alto | Restore desde backup incremental |
| **Fallo de proveedor cloud** | Baja | Crítico | Multi-cloud readiness |
| **Ransomware** | Media | Crítico | Immutable backups + air gap |
| **Error humano** | Alta | Medio | Point-in-time recovery |

### 5.2 Runbook de Recuperación

#### Escenario 1: Pérdida Total de Base de Datos

**Tiempo estimado: 2-3 horas**

1. **Declaración de Incidente** (t+0)
   - Notificar a stakeholders
   - Activar equipo de DR

2. **Provisionar Nueva Instancia** (t+15min)
   bash
   terraform apply -target=module.database_dr
   

3. **Restaurar desde Backup** (t+30min)
   bash
   # Descargar último backup
   aws s3 cp s3://backups-primary/database/latest.sql.gz.gpg .
   
   # Descifrar
   gpg --decrypt latest.sql.gz.gpg | gunzip > restore.sql
   
   # Restaurar
   psql $DR_DATABASE_URL < restore.sql
   

4. **Verificar Integridad** (t+90min)
   - Count de registros
   - Checksums de tablas críticas
   - Pruebas funcionales

5. **Redirigir Tráfico** (t+120min)
   bash
   # Update DNS
   aws route53 change-resource-record-sets \
     --hosted-zone-id $ZONE_ID \
     --change-batch file://failover.json
   

6. **Monitoreo Post-Recuperación** (t+180min)
   - Verificar métricas
   - Confirmar funcionalidad end-to-end
   - Comunicar resolución

#### Escenario 2: Ransomware

**Tiempo estimado: 4-6 horas**

1. **Contención Inmediata** (t+0)
   - Desconectar sistemas afectados
   - Bloquear cuentas comprometidas
   - Preservar evidencia forense

2. **Evaluación** (t+30min)
   - Identificar alcance del ataque
   - Determinar punto de compromiso
   - Seleccionar backup pre-infección

3. **Limpieza** (t+120min)
   - Wipe de sistemas afectados
   - Rebuild desde imágenes limpias
   - Rotación de credenciales

4. **Restauración** (t+180min)
   - Restore desde backup air-gapped
   - Verificación de integridad
   - Escaneo de malware

5. **Fortale

cimiento** (t+240min)
   - Patch de vulnerabilidades
   - Mejora de controles
   - Post-mortem

---

## 6. Automatización de Backups

### 6.1 Configuración de Supabase

sql
-- Habilitar Point-in-Time Recovery (PITR)
ALTER DATABASE postgres SET wal_level = logical;

-- Configurar retención de WAL
ALTER SYSTEM SET wal_keep_size = '10GB';

-- Snapshot automático
SELECT cron.schedule(
  'daily-snapshot',
  '0 0 * * *',
  $$
  SELECT pg_create_physical_replication_slot('backup_slot');
  $$
);


### 6.2 Replicación Multi-Región

```typescript
// apps/api/src/backup/replication.service.ts
@Injectable()
export class ReplicationService {
  async syncToSecondaryRegion() {
    const regions = [
      { name: 'us-east-1', priority: 1 },
      { name: 'eu-west-1', priority: 2 },
      { name: 'ap-southeast-1', priority: 3 }
    ];

    for (const region of regions) {
      await this.s3.replicateObject({
        sourceBucket: 'backups-primary',
        targetBucket: `backups-${region.name}`,
        encryption: 'AES256',
        versioningEnabled: true
      });
    }
  }
}
```

---

## 7. Pruebas de Recuperación

### 7.1 Calendario de Pruebas

| Tipo | Frecuencia | Responsable | Duración |
|------|-----------|-------------|----------|
| **Backup Verification** | Diario | Automated | 5 min |
| **Test Restore (Sample)** | Semanal | DevOps | 30 min |
| **Full System Restore** | Mensual | Infrastructure Team | 4 hours |
| **DR Drill Completo** | Trimestral | Toda la empresa | 1 día |

### 7.2 Criterios de Éxito

Una prueba de DR es exitosa si:
- ✅ RTO cumplido (< 4 horas)
- ✅ RPO cumplido (< 15 minutos)
- ✅ Integridad de datos verificada (100%)
- ✅ Funcionalidad crítica operativa
- ✅ Sin intervención manual extensa

---

## 8. Monitoreo de Backups

### 8.1 Métricas Clave

- **Backup Success Rate:** > 99.9%
- **Backup Completion Time:** < 30 minutos
- **Backup Size Trend:** Monitoreo de crecimiento
- **Restore Test Success:** 100%

### 8.2 Alertas

```typescript
// Configuración de alertas en Datadog/CloudWatch
{
  alerts: [
    {
      name: 'backup_failed',
      condition: 'backup_status != success',
      severity: 'CRITICAL',
      notification: ['on-call', 'cto@company.com']
    },
    {
      name: 'backup_delayed',
      condition: 'time_since_last_backup > 6.5h',
      severity: 'HIGH',
      notification: ['devops-team']
    },
    {
      name: 'backup_size_anomaly',
      condition: 'backup_size > avg_size * 1.5',
      severity: 'MEDIUM',
      notification: ['monitoring-channel']
    }
  ]
}
```

---

## 9. Immutable Backups (Anti-Ransomware)

### 9.1 Configuración S3

```json
{
  "Rules": [{
    "Id": "ImmutableBackups",
    "Status": "Enabled",
    "Priority": 1,
    "Filter": {
      "Prefix": "database/"
    },
    "NoncurrentVersionExpiration": {
      "NoncurrentDays": 90
    },
    "ObjectLockConfiguration": {
      "ObjectLockEnabled": "Enabled",
      "Rule": {
        "DefaultRetention": {
          "Mode": "GOVERNANCE",
          "Days": 30
        }
      }
    }
  }]
}
```

### 9.2 Air-Gapped Backups

- **Frecuencia:** Semanal
- **Medio:** Tape backup / Offline storage
- **Ubicación:** Físicamente separada (otra ciudad)
- **Retención:** 1 año

---

## 10. Responsabilidades

| Rol | Responsabilidades |
|-----|-------------------|
| **CTO** | Aprobación de políticas, presupuesto |
| **Infrastructure Lead** | Implementación técnica, monitoreo |
| **DevOps Team** | Ejecución diaria, troubleshooting |
| **Security Team** | Auditoría, validación de cifrado |
| **QA Team** | Pruebas de restauración |

---

## 11. Costos Estimados

| Componente | Costo Mensual | Anual |
|------------|---------------|-------|
| Supabase PITR | $50 | $600 |
| S3 Storage (multi-región) | $200 | $2,400 |
| Glacier (long-term) | $30 | $360 |
| Bandwidth | $100 | $1,200 |
| **Total** | **$380** | **$4,560** |

*ROI: El costo de 1 hora de downtime > $10,000*

---

## 12. Compliance

- ✅ **ISO 22301:** Business Continuity certified
- ✅ **SOC 2 Type II:** CC7.2 (System Operations)
- ✅ **GDPR:** Art. 32 (Security of Processing)
- ✅ **NIST SP 800-53:** CP-9 (Information System Backup)

---

## 13. Revisión y Actualizaciones

- **Frecuencia:** Semestral o post-incidente
- **Responsable:** Infrastructure Lead + CISO
- **Aprobación:** CTO

**Próxima revisión:** 23 de Julio de 2026

---

## Apéndice A: Comandos de Recuperación Rápida

```bash
# Restaurar último backup
./scripts/restore-latest.sh

# Listar backups disponibles
aws s3 ls s3://backups-primary/database/ --recursive

# Verificar integridad
./scripts/verify-backup.sh <backup_name>

# Failover a DR
terraform apply -var="failover=true"
```

## Apéndice B: Contactos de Emergencia

- **On-call DevOps:** +1-XXX-ONCALL
- **CTO:** cto@company.com
- **Supabase Support:** support.priority@supabase.com
- **AWS Premium Support:** Case ID autogenerado
