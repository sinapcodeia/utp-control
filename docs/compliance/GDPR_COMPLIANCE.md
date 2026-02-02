# GDPR / LGPD Compliance Guide
## General Data Protection Regulation & Lei Geral de Proteção de Dados

**Versión:** 1.0  
**Última actualización:** 23 de Enero de 2026  
**DPO:** privacy@company.com

---

## 1. Principios de Protección de Datos

| Principio GDPR | Implementación | Estado |
|----------------|----------------|--------|
| **Lawfulness** | Consentimiento explícito | ✅ |
| **Purpose Limitation** | Datos usados solo para propósito declarado | ✅ |
| **Data Minimization** | Solo datos necesarios recolectados | ✅ |
| **Accuracy** | Actualización periódica de datos | ✅ |
| **Storage Limitation** | Retención máxima 5 años | ✅ |
| **Integrity & Confidentiality** | Cifrado AES-256 | ✅ |
| **Accountability** | Audit trail completo | ✅ |

---

## 2. Derechos de los Titulares (GDPR Art. 12-23)

### 2.1 Derecho de Acceso (Art. 15)
**Implementación:**
```typescript
// apps/api/src/gdpr/data-access.service.ts
@Get('/my-data')
async getMyData(@Req() req) {
  const userId = req.user.id;
  
  const userData = {
    personal: await this.users.findOne(userId),
    reports: await this.reports.findByUser(userId),
    documents: await this.documents.findByUser(userId),
    auditLogs: await this.auditLogs.findByUser(userId)
  };
  
  return {
    format: 'JSON',
    requestDate: new Date(),
    data: userData
  };
}
```

**Estado:** ✅ Implementado

### 2.2 Derecho de Rectificación (Art. 16)
**Implementación:**
```typescript
@Patch('/profile')
async updateMyData(@Req() req, @Body() data) {
  await this.auditLog.create({
    action: 'USER_DATA_UPDATE',
    userId: req.user.id,
    changes: data
  });
  
  return this.users.update(req.user.id, data);
}
```

**Estado:** ✅ Implementado

### 2.3 Derecho al Olvido (Art. 17)
**Implementación:**
```typescript
@Delete('/delete-account')
async deleteAccount(@Req() req) {
  const userId = req.user.id;
  
  // 1. Soft delete (compliance - mantener audit trail)
  await this.users.update(userId, {
    deleted_at: new Date(),
    email: `deleted_${userId}@anonymized.local`,
    full_name: 'Usuario Eliminado',
    dni: 'ANONYMIZED'
  });
  
  // 2. Anonimizar documentos
  await this.documents.anonymize(userId);
  
  // 3. Mantener audit logs (7 años - compliance)
  await this.auditLog.create({
    action: 'GDPR_RIGHT_TO_BE_FORGOTTEN',
    userId,
    timestamp: new Date()
  });
  
  // 4. Programar hard delete después de período legal
  await this.scheduler.scheduleHardDelete(userId, 90); // 90 días
  
  return { message: 'Cuenta programada para eliminación' };
}
```

**Estado:** ✅ Implementado

### 2.4 Derecho a la Portabilidad (Art. 20)
**Implementación:**
```typescript
@Get('/export-data')
async exportData(@Req() req) {
  const userId = req.user.id;
  const exportData = await this.gdpr.generateExport(userId);
  
  // Formato estructurado y legible
  const zip = await this.archiver.create({
    'user_profile.json': exportData.profile,
    'documents.json': exportData.documents,
    'reports.json': exportData.reports,
    'audit_trail.csv': exportData.auditLogs
  });
  
  await this.audit.log({
    action: 'GDPR_DATA_EXPORT',
    userId
  });
  
  return zip;
}
```

**Estado:** ✅ Implementado

### 2.5 Derecho de Oposición (Art. 21)
**Implementación:**
```typescript
@Post('/opt-out/:purpose')
async optOut(@Req() req, @Param('purpose') purpose: string) {
  await this.users.update(req.user.id, {
    [`consent_${purpose}`]: false
  });
  
  await this.audit.log({
    action: 'GDPR_OPT_OUT',
    purpose,
    userId: req.user.id
  });
}
```

**Estado:** ✅ Implementado

---

## 3. Consentimiento (GDPR Art. 7)

### 3.1 Gestión de Consentimiento
```typescript
// Schema Extension
CREATE TABLE user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  purpose ENUM('marketing', 'analytics', 'third_party_sharing'),
  consented BOOLEAN NOT NULL,
  consent_date TIMESTAMP DEFAULT NOW(),
  consent_method TEXT, -- 'explicit_checkbox', 'api_call'
  ip_address TEXT,
  user_agent TEXT,
  withdrawn_date TIMESTAMP
);
```

### 3.2 Requisitos de Consentimiento Válido
- ✅ Específico por propósito
- ✅ Informado (privacy notice clara)
- ✅ Inequívoco (opt-in explícito, no pre-checked)
- ✅ Revocable fácilmente
- ✅ Registrado con evidencia

**UI Ejemplo:**
```tsx
<form>
  <label>
    <input type="checkbox" name="terms" required />
    Acepto los <Link href="/terms">Términos de Servicio</Link>
  </label>
  
  <label>
    <input type="checkbox" name="privacy" required />
    He leído la <Link href="/privacy">Política de Privacidad</Link>
  </label>
  
  <label>
    <input type="checkbox" name="marketing" />
    Deseo recibir comunicaciones de marketing (opcional)
  </label>
</form>
```

---

## 4. Privacy by Design (GDPR Art. 25)

### 4.1 Minimización de Datos
```typescript
// ❌ MAL - Recolectar datos innecesarios
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthdate: Date;
  ssn: string; // ← No necesario
  income: number; // ← No necesario
}

// ✅ BIEN - Solo datos esenciales
interface UserProfile {
  name: string;
  email: string;
  role: Role;
}
```

### 4.2 Pseudonimización
```typescript
// Para analytics, usar IDs pseudónimos
const analyticsUserId = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(realUserId)
  .digest('hex')
  .substring(0, 16);

analytics.track(analyticsUserId, event); // No el ID real
```

### 4.3 Cifrado por Defecto
```typescript
// Todos los datos CONFIDENTIAL/RESTRICTED cifrados
@Entity()
class SensitiveData {
  @Column({
    type: 'text',
    transformer: {
      to: (value) => encrypt(value), // AES-256
      from: (value) => decrypt(value)
    }
  })
  sensitiveField: string;
}
```

---

## 5. Data Protection Impact Assessment (DPIA)

### 5.1 Cuándo es Necesario
DPIA requerido para:
- ✅ Procesamiento a gran escala de categorías especiales de datos
- ❌ Monitoreo sistemático de áreas públicas
- ✅ Toma de decisiones automatizadas con efectos legales
- ✅ Perfilado de alto riesgo

### 5.2 Template DPIA
```markdown
1. **Descripción del tratamiento:**
   - Propósito: Gestión de reportes regionales
   - Datos tratados: Nombres, emails, documentos
   - Volumen: ~1000 usuarios, 10,000 documentos/año

2. **Necesidad y proporcionalidad:**
   - Necesario para funcionalidad core
   - Sin alternativas menos invasivas

3. **Riesgos identificados:**
   - Acceso no autorizado: Mitigado con RBAC + MFA
   - Pérdida de datos: Mitigado con backup 3-2-1
   - Fuga de datos: Mitigado con cifrado AES-256

4. **Medidas de mitigación:**
   - Cifrado end-to-end
   - Auditoría completa
   - Retention policies

5. **Conclusión:** Riesgo residual BAJO
```

---

## 6. Transferencias Internacionales (GDPR Art. 44-50)

### 6.1 Mecanismos Legales
- ✅ **Adequacy Decision:** Países con protección adecuada (e.g., UK, Suiza)
- ✅ **Standard Contractual Clauses (SCC):** Para proveedores cloud
- ❌ Privacy Shield: Invalidado (Schrems II)

### 6.2 Proveedores Actuales
| Proveedor | Ubicación | Mecanismo | Estado |
|-----------|-----------|-----------|--------|
| Supabase | US (multi-región) | SCC + EU data residency | ✅ |
| Vercel | US (edge global) | SCC | ✅ |
| GitHub | US | SCC | ✅ |

---

## 7. Breach Notification (GDPR Art. 33-34)

### 7.1 Timeline
- **72 horas** para notificar a autoridad supervisora (DPA)
- **Sin demora indebida** para notificar a afectados si alto riesgo

### 7.2 Contenido de Notificación
```typescript
interface BreachNotification {
  nature: string; // Descripción del breach
  categories: string[]; // Tipos de datos afectados
  approximateNumber: number; // # de registros
  likelyConsequences: string;
  measuresProposed: string[];
  dpoContact: string;
}
```

### 7.3 Registro de Breaches
```sql
CREATE TABLE security_breaches (
  id TEXT PRIMARY KEY,
  discovered_at TIMESTAMP NOT NULL,
  reported_to_dpa_at TIMESTAMP,
  affected_users INTEGER,
  data_categories TEXT[],
  mitigation_actions TEXT,
  lessons_learned TEXT
);
```

---

## 8. Records of Processing Activities (GDPR Art. 30)

```markdown
| Processing Activity | Purpose | Legal Basis | Data Categories | Recipients | Retention |
|---------------------|---------|-------------|-----------------|------------|-----------|
| User Registration | Account creation | Contractual | Name, email, DNI | Internal only | 5 years post-deletion |
| Document Management | Core service | Contractual | Uploaded files | Internal + cloud storage | User-controlled |
| Audit Logging | Security & compliance | Legitimate interest | User actions, IPs | Internal + SIEM | 7 years |
| Marketing Communications | Promotional | Consent | Email | Marketing team + ESP | Until consent withdrawn |
```

---

## 9. Diferencias GDPR vs LGPD

| Aspecto | GDPR (UE) | LGPD (Brasil) |
|---------|-----------|---------------|
| **Ámbito territorial** | Establecimientos UE + targeting UE | Operaciones en Brasil + datos de residentes BR |
| **Bases legales** | 6 bases (consent, contract, etc.) | 10 bases (similar) |
| **DPO** | Obligatorio en ciertos casos | Obligatorio siempre |
| **Multas** | Hasta €20M o 4% revenue | Hasta R$50M por infracción |
| **Menores** | < 16 años (o menor según país) | < 18 años |
| **Autoridad** | DPAs nacionales + EDPB | ANPD (Autoridade Nacional) |

**Estrategia:** Cumplir con el estándar más estricto (GDPR) cubre

 ambos.

---

## 10. Checklist de Cumplimiento

### Técnico
- [x] Cifrado AES-256 en reposo
- [x] TLS 1.3 en tránsito
- [x] Backup cifrado y multi-región
- [x] Retention policies automatizadas
- [ ] DLP (Data Loss Prevention)

### Procesos
- [x] Privacy notice actualizada
- [x] Consentimiento explícito
- [x] API de derechos de titular
- [ ] DPIA para nuevos procesos
- [ ] Breach response plan drill

### Gobernanza
- [x] DPO designado
- [x] Políticas documentadas
- [ ] Training anual a empleados
- [ ] Auditoría de privacidad anual

---

## 11. Contactos

**Data Protection Officer (DPO):**  
Email: privacy@company.com  
Teléfono: +XX-XXX-XXXXXXX

**Autoridades Supervisoras:**
- **GDPR (UE):** https://edpb.europa.eu/about-edpb/about-edpb/members_en
- **LGPD (Brasil):** ANPD - https://www.gov.br/anpd

**Reportar violación de datos:**  
incident@company.com (24/7)

---

**Próxima revisión:** Semestral  
**Última auditoría:** Pendiente (Q3 2026)
