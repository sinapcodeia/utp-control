# 🗺️ UTP CONTROL - Roadmap de Funcionalidades Avanzadas

**Fecha**: 2026-01-29  
**Estado**: Especificaciones listas para implementación

---

## 📋 Funcionalidades Especificadas (No Implementadas)

### 1. **Simulador de Escenarios (What-If)** 🎯

**Prioridad**: Alta  
**Complejidad**: Media-Alta  
**Tiempo estimado**: 2-3 semanas

#### **Objetivo**
Permitir a CEO/Dirección simular decisiones operativas y ver su impacto proyectado en KPIs antes de ejecutar.

#### **Ubicación**
- Dashboard CEO (`CEOHome.tsx`)
- Botón: "Simular Escenario"
- Modal/página dedicada

#### **Variables Simulables**
1. **Recursos**:
   - +/- gestores por región
   - Reasignación senior/junior
   - Refuerzo temporal (30/60/90 días)

2. **Operación**:
   - Priorizar municipios críticos
   - Aumentar visitas en zonas clave
   - Reducir carga en zonas estables

3. **Estrategia**:
   - Enfoque cobertura vs cumplimiento
   - Tolerancia al riesgo (conservador/agresivo)

#### **UX Flow**
```
Pantalla 1: ¿Qué quiero cambiar?
  ↓
Pantalla 2: Ajuste rápido (sliders)
  ↓
Pantalla 3: Impacto proyectado (visual)
  ↓
Pantalla 4: Insight ejecutivo + recomendación
```

#### **Output**
```
Impacto estimado (60 días):
ICOE:      82% → 88%  🟢 (+6 pts)
Cobertura: 76% → 84%  🟢 (+8 pts)
Riesgo:    Medio → Bajo 🟢
Coste:     +12%

Recomendación:
"Este escenario mejora el ICOE en +6 pts, reduce 
el riesgo territorial en –35%, pero incrementa el 
coste operativo en +12%. Recomendado si el objetivo 
es estabilización trimestral."
```

#### **Implementación Técnica**

**Backend** (`apps/api/src/simulator/`):
```typescript
// simulator.controller.ts
@Post('simulate')
async simulateScenario(@Body() dto: SimulateScenarioDto) {
  return this.simulatorService.calculate(dto);
}

// simulator.service.ts
class SimulatorService {
  calculate(scenario: SimulateScenarioDto) {
    // 1. Obtener baseline actual
    const baseline = await this.getBaseline();
    
    // 2. Aplicar cambios del escenario
    const projected = this.applyChanges(baseline, scenario);
    
    // 3. Calcular impacto en KPIs
    const impact = this.calculateImpact(baseline, projected);
    
    // 4. Generar recomendación
    const recommendation = this.generateRecommendation(impact);
    
    return { baseline, projected, impact, recommendation };
  }
}
```

**Frontend** (`apps/web/src/components/simulator/`):
```typescript
// ScenarioSimulator.tsx
export function ScenarioSimulator() {
  const [scenario, setScenario] = useState<Scenario>({
    region: 'Norte',
    gestorsChange: 0,
    duration: 60,
    priority: 'coverage'
  });
  
  const { data: simulation } = useSimulation(scenario);
  
  return (
    <Dialog>
      <Step1_SelectAction />
      <Step2_AdjustVariables />
      <Step3_ViewImpact impact={simulation?.impact} />
      <Step4_ExecutiveInsight recommendation={simulation?.recommendation} />
    </Dialog>
  );
}
```

#### **Reglas de Negocio**
- ✅ Máximo 3 variables por simulación
- ✅ No promete exactitud absoluta (±10% margen)
- ✅ Basado en datos históricos + tendencias
- ✅ Validación de escenarios imposibles

---

### 2. **OKRs Estratégicos** 📊

**Prioridad**: Alta  
**Complejidad**: Media  
**Tiempo estimado**: 1-2 semanas

#### **Objetivo**
Convertir el dashboard en sistema de seguimiento estratégico con OKRs alimentados automáticamente.

#### **Estructura**
```
Objetivo (3-5 máximo)
  ├── Key Result 1 (medible)
  ├── Key Result 2 (medible)
  └── Key Result 3 (medible)
```

#### **Ejemplo Real**
```
🎯 Objetivo 1: Operación territorial sostenible

KR1: ICOE ≥ 85%           [82%] 🟡 En riesgo
KR2: Regiones riesgo ≤10% [14%] 🔴 Fuera objetivo
KR3: Alertas críticas ↓30% [-22%] 🟡 En progreso

🎯 Objetivo 2: Eficiencia operativa

KR1: Productividad ≥ 90%   [87%] 🟡
KR2: Visitas fallidas < 8% [6%]  🟢 En objetivo
KR3: Coste/visita ↓ 10%   [-7%] 🟡
```

#### **Conexión con Simulador**
```
KR en 🔴 → Botón "Simular corrección"
  ↓
Simulador sugiere acciones de alto impacto
  ↓
CEO decide y ejecuta
```

#### **Implementación Técnica**

**Backend** (`apps/api/src/okrs/`):
```typescript
// okr.entity.ts
interface OKR {
  id: string;
  objective: string;
  keyResults: KeyResult[];
  quarter: string;
  owner: string;
}

interface KeyResult {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  kpiSource: string; // 'icoe', 'compliance', etc.
  status: 'on_track' | 'at_risk' | 'off_track';
}

// okrs.service.ts
class OKRsService {
  async getOKRsWithProgress(quarter: string) {
    const okrs = await this.prisma.okr.findMany({ where: { quarter } });
    
    // Alimentar automáticamente desde KPIs
    for (const okr of okrs) {
      for (const kr of okr.keyResults) {
        kr.current = await this.getKPIValue(kr.kpiSource);
        kr.status = this.calculateStatus(kr.current, kr.target);
      }
    }
    
    return okrs;
  }
}
```

**Frontend** (`apps/web/src/components/okrs/`):
```typescript
// OKRDashboard.tsx
export function OKRDashboard({ quarter }: { quarter: string }) {
  const { data: okrs } = useOKRs(quarter);
  
  return (
    <div className="space-y-6">
      {okrs?.map(okr => (
        <Card key={okr.id}>
          <CardHeader>
            <h3>{okr.objective}</h3>
          </CardHeader>
          <CardContent>
            {okr.keyResults.map(kr => (
              <KeyResultRow
                key={kr.id}
                kr={kr}
                onSimulate={() => openSimulator(kr)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### 3. **Motor de Alertas Predictivas** 🔮

**Prioridad**: Media  
**Complejidad**: Alta  
**Tiempo estimado**: 3-4 semanas

#### **Objetivo**
Pasar de "ver el problema" a "anticiparse al problema" con predicción a 72h.

#### **Tipos de Alertas**

**🔴 Críticas (acción inmediata)**:
- Unidad no visitada 2+ veces consecutivas
- Cobertura < 60%
- Alerta crítica sin evidencia
- Gestor inactivo en horario operativo

**🟡 Preventivas (seguimiento)**:
- Tendencia negativa de cumplimiento (3 días)
- Aumento de visitas parciales
- Disminución de productividad

**🔵 Informativas**:
- Picos de carga
- Territorio estabilizado
- Mejora sostenida

#### **Predicción**

**Señales Predictivas**:
- Historial de visitas fallidas
- Tendencia de alertas
- Disminución progresiva de evidencia
- Tiempo medio por visita

**Output**:
```
⚠️ PREDICCIÓN (72h):
"Municipio X tiene alta probabilidad (78%) de caer 
en riesgo crítico en las próximas 72h."

Acción sugerida:
→ Reasignar gestor
→ Priorizar zona
→ Auditoría preventiva
```

#### **Implementación Técnica**

**Backend** (`apps/api/src/alerts/`):
```typescript
// alert-engine.service.ts
class AlertEngineService {
  async predictRisks(timeframe: number = 72) {
    const historicalData = await this.getHistoricalData(30); // 30 días
    
    const predictions = [];
    
    for (const municipality of municipalities) {
      const trend = this.calculateTrend(municipality, historicalData);
      const probability = this.calculateRiskProbability(trend);
      
      if (probability > 0.7) {
        predictions.push({
          municipality,
          probability,
          timeframe,
          suggestedActions: this.getSuggestedActions(municipality, trend)
        });
      }
    }
    
    return predictions;
  }
  
  private calculateTrend(municipality, data) {
    // Análisis de tendencia con regresión lineal simple
    const visits = data.filter(d => d.municipalityId === municipality.id);
    const failureRate = visits.filter(v => v.status === 'FAILED').length / visits.length;
    const alertsRate = visits.filter(v => v.hasAlert).length / visits.length;
    
    return { failureRate, alertsRate, slope: this.linearRegression(visits) };
  }
}
```

---

### 4. **Score de Desempeño del Gestor** 📈

**Prioridad**: Media  
**Complejidad**: Media  
**Tiempo estimado**: 2 semanas

#### **Objetivo**
Ranking justo, accionable y no punitivo de gestores (0-100).

#### **Componentes del Score**

| Dimensión | Peso | Qué mide |
|-----------|------|----------|
| Cumplimiento Operativo | 30% | Ejecuta lo planificado |
| Cobertura Territorial | 25% | Llega a todas las UP |
| Calidad de Ejecución | 20% | Estado real de las visitas |
| Gestión de Riesgos | 15% | Detección temprana |
| Calidad del Dato | 10% | Evidencia y precisión |

#### **Fórmula**
```
Score = (Cumplimiento × 0.30)
      + (Cobertura × 0.25)
      + (Calidad × 0.20)
      + (Gestión alertas × 0.15)
      + (Calidad datos × 0.10)
```

#### **Mecanismos de Justicia**
- ✅ No penaliza alertas bien reportadas
- ✅ Penaliza ocultar problemas
- ✅ Ajuste por densidad territorial
- ✅ Ajuste por distancia
- ✅ Ajuste por complejidad de zona

#### **Visualización**
```
Gestor: Juan Pérez
Score: 87/100 🟢 Alto desempeño
Tendencia: ↑ +3 pts (vs mes anterior)

Breakdown:
Cumplimiento:    92% ████████░░ 30 pts
Cobertura:       85% ████████░░ 21 pts
Calidad:         90% █████████░ 18 pts
Gestión riesgos: 88% ████████░░ 13 pts
Calidad datos:   50% █████░░░░░  5 pts
```

---

### 5. **Dashboard Mobile del Gestor** 📱

**Prioridad**: Alta  
**Complejidad**: Alta  
**Tiempo estimado**: 3-4 semanas

#### **Objetivo**
Registro de visitas en terreno < 2 minutos, 5-6 taps promedio.

#### **Wireframes Implementados**

**1. Home del Gestor**:
```
┌──────────────────────────┐
│ Buenos días, Juan        │
│ Región Norte             │
│                          │
│ HOY                      │
│ 🟢 Programadas: 6        │
│ 🟡 Pendientes: 1         │
│ 🔴 Reprogramadas: 1      │
│                          │
│ Progreso: ███████░ 70%   │
│                          │
│ [ Empezar siguiente ]    │
└──────────────────────────┘
```

**2. Registro de Visita** (5 pantallas):
1. Estado de la visita (Realizada/No)
2. Estado de la unidad (Óptimo/Seguimiento/Crítico)
3. Cumplimiento (Sí/Parcial/No)
4. Alertas (Crítica/Preventiva/Informativa/No)
5. Evidencia (Foto/Doc/Firma/GPS)

**Características**:
- ✅ Offline-first (sincronización automática)
- ✅ Captura de GPS automática
- ✅ Firma digital
- ✅ Foto con timestamp
- ✅ Validación de campos obligatorios

---

## 🎯 Plan de Implementación Sugerido

### **Sprint 1-2** (2 semanas): OKRs Estratégicos
- Modelo de datos
- Backend endpoints
- Frontend dashboard
- Conexión con KPIs existentes

### **Sprint 3-5** (3 semanas): Simulador de Escenarios
- Motor de simulación
- UI/UX del simulador
- Integración con CEO dashboard
- Testing de escenarios

### **Sprint 6-7** (2 semanas): Score de Desempeño
- Cálculo de scores
- Ranking de gestores
- Visualización en dashboard
- Ajustes por territorio

### **Sprint 8-11** (4 semanas): Motor de Alertas Predictivas
- Análisis de tendencias
- Algoritmo de predicción
- Sistema de notificaciones
- Dashboard de alertas

### **Sprint 12-15** (4 semanas): Dashboard Mobile
- App React Native / PWA
- Registro de visitas
- Sincronización offline
- Testing en campo

---

## 📊 Priorización Recomendada

### **Fase 1: Decisión Estratégica** (4-5 semanas)
1. ✅ OKRs Estratégicos
2. ✅ Simulador de Escenarios

**Impacto**: CEO puede tomar decisiones basadas en evidencia

### **Fase 2: Operación Eficiente** (6-7 semanas)
3. ✅ Score de Desempeño del Gestor
4. ✅ Motor de Alertas Predictivas

**Impacto**: Coordinador anticipa problemas y optimiza recursos

### **Fase 3: Ejecución en Campo** (4 semanas)
5. ✅ Dashboard Mobile del Gestor

**Impacto**: Gestores registran visitas en < 2 min, datos en tiempo real

---

## 🏁 Resultado Final Esperado

Con todas las funcionalidades implementadas:

✅ **CEO**: Decide antes de ejecutar, simula escenarios, sigue OKRs
✅ **Coordinador**: Anticipa riesgos, optimiza recursos, rankea gestores
✅ **Gestor**: Registra visitas rápido, sincroniza offline, recibe alertas
✅ **Organización**: Alineación estrategia-operación, datos confiables, decisiones basadas en evidencia

---

**Versión**: 1.0.0  
**Última actualización**: 2026-01-29  
**Estado**: 📋 **Especificaciones Completas - Listo para Implementar**
