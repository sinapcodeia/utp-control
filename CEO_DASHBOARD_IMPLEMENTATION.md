# Dashboard C-Level / CEO View - Strategic Control Tower

## 🎯 Objetivo

Vista ejecutiva diseñada para CEO / Dirección General. **No operación diaria**: salud del negocio, riesgo y decisiones estratégicas en **< 5 minutos**.

---

## 📋 Las 5 Preguntas Clave

El dashboard responde únicamente estas preguntas críticas:

1. **¿La operación territorial está sana?** → ICOE Global
2. **¿Está mejorando o empeorando?** → Tendencia vs mes anterior
3. **¿Dónde están los mayores riesgos?** → Nivel de Riesgo + Alertas
4. **¿Qué regiones/gestores explican el resultado?** → Heatmap Regional
5. **¿Qué decisión debo tomar hoy?** → Acciones Recomendadas

---

## 🎨 Principios de Diseño (CEO-grade)

✅ **Máximo 1 pantalla sin scroll**
✅ **Lenguaje de negocio, no operativo**
✅ **Tendencias > detalle**
✅ **Comparación temporal siempre visible**
✅ **Colores solo para riesgo**

---

## 📐 Layout Implementado

```
┌────────────────────────────────────────────────────────┐
│ Header: Control Tower Ejecutivo | Fecha                │
└────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────┬──────────────────┐
│ ICOE Global (82%)    │ Tendencia    │ Riesgo (MEDIO)   │
│ ÓPTIMO/ACEPTABLE/    │ ↑ +3.2%      │ 3 🔴 • 5 🟡      │
│ CRÍTICO              │ vs mes ant.  │                  │
└──────────────────────┴──────────────┴──────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Cumplimiento │ Cobertura    │ Fuerza Activa│
│ 92% ↑        │ 76% →        │ 128 / 150    │
└──────────────┴──────────────┴──────────────┘

┌────────────────────────────────────────────┐
│ Salud por Región (Heatmap)                 │
│ Norte: 85% 🟢 | Sur: 72% 🟡                │
│ Oriente: 91% 🟢 | Occidente: 68% 🔴        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Acciones Recomendadas                      │
│ 🔴 Urgente: Reforzar Región Occidente      │
│ 🟡 Media: Auditoría de Calidad             │
│ 🟢 Baja: Reconocer Región Oriente          │
└────────────────────────────────────────────┘
```

---

## 🔢 Componentes Clave

### 1. Hero Card - ICOE Global

**Características**:
- Gradiente oscuro (slate-900 → slate-800)
- Número 6xl con badge de estado
- Estados: ÓPTIMO (≥85%) | ACEPTABLE (70-84%) | CRÍTICO (<70%)
- Elementos decorativos (círculos de fondo)

**Datos mostrados**:
- ICOE actual
- Estado operativo
- Descripción del KPI

---

### 2. Card de Tendencia

**Características**:
- Icono dinámico (TrendingUp/Down/Activity)
- Color según dirección (verde/rojo/gris)
- Comparación temporal explícita

**Datos mostrados**:
- Variación porcentual
- Período de comparación

---

### 3. Card de Riesgo Global

**Características**:
- Gradiente según nivel (rojo/ámbar/verde)
- Texto blanco sobre fondo de color
- Icono AlertTriangle

**Datos mostrados**:
- Nivel de riesgo (CRÍTICO/MEDIO/BAJO)
- Conteo de alertas críticas
- Conteo de alertas preventivas

---

### 4. KPIs Ejecutivos (3 cards)

**Cumplimiento**:
- % de ejecución vs planificado
- Tendencia (icono)
- Barra de progreso verde

**Cobertura**:
- % de territorio cubierto
- Indicador de estabilidad
- Barra de progreso azul

**Fuerza Activa**:
- Gestores activos / total
- Ratio visual
- Barra de progreso azul

---

### 5. Heatmap Regional

**Características**:
- Grid 4 columnas (responsive)
- Cards clickeables
- Semáforo visual (punto de color)

**Datos por región**:
- Nombre
- Score ICOE
- Estado (🟢🟡🔴)
- Barra de progreso

---

### 6. Acciones Recomendadas

**Características**:
- Gradiente azul suave (fondo)
- 3 niveles de prioridad
- Iconos contextuales

**Estructura por acción**:
- Icono + color de prioridad
- Título de la acción
- Descripción breve
- Badge de urgencia (URGENTE/MEDIA/BAJA)

---

## 📊 Datos Consumidos

```typescript
interface CEOHomeProps {
    stats: {
        icoeRaw: number;           // 0-100
        complianceRaw: number;     // 0-100
        coverageRaw: number;       // 0-100
        riskLevel: 'CRÍTICO' | 'MEDIO' | 'BAJO';
        criticalAlerts: number;
        preventiveAlerts: number;
        activePersonnel: number;
        personnelTotal: number;
    };
    user: {
        id: string;
        name: string;
        role: string;
    };
}
```

---

## 🎯 Decisiones de Diseño

### Jerarquía Visual

1. **ICOE** → Hero card oscura, 6xl
2. **Tendencia + Riesgo** → Cards de color, 4xl
3. **KPIs Satélite** → Cards blancas, 4xl
4. **Regional** → Grid uniforme
5. **Acciones** → Lista priorizada

### Paleta de Colores

- **Salud**: Verde (#10B981) / Ámbar (#F59E0B) / Rojo (#EF4444)
- **Neutro**: Slate-900 (oscuro) / Slate-50 (claro)
- **Acento**: Azul-600 (#2563EB)

### Tipografía

- **Números grandes**: 6xl (ICOE), 4xl (KPIs), 3xl (Regional)
- **Labels**: 9-10px, uppercase, tracking-widest
- **Descripciones**: 12px, normal

---

## 🚀 Integración

**Archivo**: `apps/web/src/components/dashboard/role-views/CEOHome.tsx`

**Uso**:
```tsx
import { CEOHome } from "@/components/dashboard/role-views/CEOHome";

// En dashboard/page.tsx
case 'ADMIN':
    return <CEOHome stats={stats} user={currentUser} />;
```

---

## ✅ Checklist de Implementación

- [x] Hero card ICOE con estados
- [x] Card de tendencia con iconos dinámicos
- [x] Card de riesgo con gradientes
- [x] 3 KPIs ejecutivos comparativos
- [x] Heatmap regional (4 regiones)
- [x] Acciones recomendadas priorizadas
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark mode support
- [x] Integración con datos reales del backend

---

## 📈 Próximas Mejoras

1. **Tendencias Reales**: Calcular variación vs mes anterior desde backend
2. **Drill-down Regional**: Click en región → detalle municipal
3. **Exportar PDF**: Snapshot del dashboard para reuniones
4. **Alertas Predictivas**: Predicción de riesgos a 72h
5. **Comparación Multi-período**: Trimestral, semestral, anual

---

## 🎓 Filosofía de Diseño

> "Un CEO debe entender el estado del negocio en 30 segundos. Si necesita más tiempo, el dashboard ha fallado."

**Principios aplicados**:
- **Claridad > Completitud**: Solo lo esencial
- **Acción > Información**: Cada dato sugiere una decisión
- **Contexto > Números**: Tendencias y comparaciones siempre visibles
- **Simplicidad > Sofisticación**: Diseño limpio, sin distracciones

---

**Estado**: ✅ **Implementado y Funcional**
**Última actualización**: 2026-01-29
