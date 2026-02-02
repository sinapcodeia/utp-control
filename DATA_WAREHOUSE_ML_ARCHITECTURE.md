# 🏗️ UTP CONTROL - Data Warehouse & ML Architecture

**Fecha**: 2026-01-29  
**Estado**: 📋 **Especificación Completa - Arquitectura Avanzada**

---

## 🧠 Principio Silicon Valley

> "El Data Warehouse no sirve para guardar datos. Sirve para explicar qué está pasando."

**Objetivo**: Una sola fuente de verdad, lista para decisiones estratégicas, BI, ML y simulaciones.

---

## 🏗️ Arquitectura General (Alto Nivel)

```
┌─────────────────────────────────────────────────┐
│ FUENTES OPERATIVAS                              │
│ • App Móvil del Gestor                          │
│ • Sistema Web (Dashboard)                       │
│ • Catálogos (Territorio, Gestores, UP)          │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ ETL / ELT PIPELINE                              │
│ • Extracción de datos operativos               │
│ • Transformación y limpieza                     │
│ • Validación de calidad                         │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ ODS (Operational Data Store)                    │
│ • Datos operativos en tiempo casi real         │
│ • Staging area para transformaciones           │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ DATA WAREHOUSE (Star Schema)                    │
│ • fact_visits (tabla de hechos principal)      │
│ • Dimensiones: gestor, territory, date, alert  │
│ • Data Marts: daily_performance, monthly_summary│
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ CAPA DE CONSUMO                                 │
│ • BI Dashboards (CEO, Coordinador)             │
│ • ML Models (Predicción de Riesgo)             │
│ • Simulador What-If                             │
│ • Alertas Predictivas                           │
└─────────────────────────────────────────────────┘
```

---

## ⭐ Star Schema - Diseño Canónico

### 🎯 **Tabla de Hechos Principal: `fact_visits`**

**Grano**: 1 fila = 1 visita realizada o programada

```sql
CREATE TABLE fact_visits (
    visit_id            BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys (Dimensiones)
    gestor_id           INTEGER NOT NULL REFERENCES dim_gestor(gestor_id),
    territory_id        INTEGER NOT NULL REFERENCES dim_territory(territory_id),
    productive_unit_id  INTEGER NOT NULL REFERENCES dim_productive_unit(unit_id),
    date_id             INTEGER NOT NULL REFERENCES dim_date(date_id),
    alert_id            INTEGER REFERENCES dim_alert(alert_id),
    
    -- Flags de Estado
    planned_flag        BOOLEAN NOT NULL DEFAULT FALSE,
    executed_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    coverage_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    risk_flag           BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Métricas Cuantitativas
    execution_time_min  INTEGER,              -- Duración en minutos
    visit_score         DECIMAL(5,2),         -- Score de calidad (0-100)
    alert_count         INTEGER DEFAULT 0,    -- Número de alertas generadas
    distance_km         DECIMAL(8,2),         -- Distancia recorrida
    
    -- Timestamps
    planned_datetime    TIMESTAMP,
    executed_datetime   TIMESTAMP,
    
    -- Evidencia
    has_gps             BOOLEAN DEFAULT FALSE,
    has_photo           BOOLEAN DEFAULT FALSE,
    has_signature       BOOLEAN DEFAULT FALSE,
    
    -- Auditoría
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_fact_visits_gestor ON fact_visits(gestor_id);
CREATE INDEX idx_fact_visits_territory ON fact_visits(territory_id);
CREATE INDEX idx_fact_visits_date ON fact_visits(date_id);
CREATE INDEX idx_fact_visits_executed ON fact_visits(executed_flag, date_id);
```

---

### 🧱 **Dimensión: `dim_gestor`**

```sql
CREATE TABLE dim_gestor (
    gestor_id               SERIAL PRIMARY KEY,
    
    -- Identificación
    gestor_code             VARCHAR(50) UNIQUE NOT NULL,
    full_name               VARCHAR(200) NOT NULL,
    email                   VARCHAR(200),
    
    -- Características
    seniority_level         VARCHAR(20),  -- 'JUNIOR', 'SENIOR', 'EXPERT'
    contract_type           VARCHAR(20),  -- 'FULL_TIME', 'PART_TIME', 'CONTRACTOR'
    hire_date               DATE,
    
    -- Asignación Territorial
    assigned_region_id      INTEGER,
    assigned_municipality_id INTEGER,
    
    -- Métricas Históricas (SCD Type 2)
    historical_productivity DECIMAL(5,2),  -- Promedio histórico
    historical_quality      DECIMAL(5,2),  -- Score promedio
    total_visits_completed  INTEGER DEFAULT 0,
    
    -- SCD Type 2 (Slowly Changing Dimension)
    effective_date          DATE NOT NULL,
    expiration_date         DATE,
    is_current              BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dim_gestor_current ON dim_gestor(is_current, gestor_code);
```

---

### 🧱 **Dimensión: `dim_territory`**

```sql
CREATE TABLE dim_territory (
    territory_id        SERIAL PRIMARY KEY,
    
    -- Jerarquía Territorial
    region_code         VARCHAR(10) NOT NULL,
    region_name         VARCHAR(100) NOT NULL,
    department_code     VARCHAR(10),
    department_name     VARCHAR(100),
    municipality_code   VARCHAR(10),
    municipality_name   VARCHAR(100),
    vereda_code         VARCHAR(10),
    vereda_name         VARCHAR(100),
    
    -- Características del Territorio
    criticality_level   VARCHAR(20),  -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    unit_density        INTEGER,      -- Unidades productivas por km²
    population          INTEGER,
    area_km2            DECIMAL(10,2),
    
    -- Riesgo Base
    base_risk_score     DECIMAL(5,2), -- Score de riesgo histórico
    accessibility       VARCHAR(20),  -- 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT'
    
    -- Geolocalización
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    
    -- Auditoría
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dim_territory_region ON dim_territory(region_code);
CREATE INDEX idx_dim_territory_municipality ON dim_territory(municipality_code);
```

---

### 🧱 **Dimensión: `dim_productive_unit`**

```sql
CREATE TABLE dim_productive_unit (
    unit_id             SERIAL PRIMARY KEY,
    
    -- Identificación
    unit_code           VARCHAR(50) UNIQUE NOT NULL,
    unit_name           VARCHAR(200),
    
    -- Clasificación
    unit_type           VARCHAR(50),  -- 'FARM', 'COOPERATIVE', 'ASSOCIATION', etc.
    size_category       VARCHAR(20),  -- 'SMALL', 'MEDIUM', 'LARGE'
    
    -- Riesgo
    base_risk_level     VARCHAR(20),  -- 'LOW', 'MEDIUM', 'HIGH'
    priority_level      INTEGER,      -- 1 (más alta) - 5 (más baja)
    
    -- Ubicación
    territory_id        INTEGER REFERENCES dim_territory(territory_id),
    
    -- Estado
    is_active           BOOLEAN DEFAULT TRUE,
    last_visit_date     DATE,
    
    -- Auditoría
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dim_productive_unit_territory ON dim_productive_unit(territory_id);
CREATE INDEX idx_dim_productive_unit_active ON dim_productive_unit(is_active);
```

---

### 🧱 **Dimensión: `dim_date`**

```sql
CREATE TABLE dim_date (
    date_id             INTEGER PRIMARY KEY,  -- YYYYMMDD format
    
    -- Fecha completa
    full_date           DATE UNIQUE NOT NULL,
    
    -- Componentes de fecha
    day_of_week         INTEGER,      -- 1 (Lunes) - 7 (Domingo)
    day_of_month        INTEGER,
    day_of_year         INTEGER,
    week_of_year        INTEGER,
    month               INTEGER,
    quarter             INTEGER,
    year                INTEGER,
    
    -- Nombres
    day_name            VARCHAR(20),  -- 'Lunes', 'Martes', etc.
    month_name          VARCHAR(20),  -- 'Enero', 'Febrero', etc.
    quarter_name        VARCHAR(10),  -- 'Q1', 'Q2', etc.
    
    -- Flags especiales
    is_weekend          BOOLEAN,
    is_holiday          BOOLEAN,
    is_working_day      BOOLEAN,
    holiday_name        VARCHAR(100),
    
    -- Períodos fiscales
    fiscal_year         INTEGER,
    fiscal_quarter      INTEGER,
    fiscal_month        INTEGER
);

-- Poblar dimensión de fechas (ejemplo: 10 años)
INSERT INTO dim_date (date_id, full_date, day_of_week, day_of_month, ...)
SELECT 
    TO_CHAR(d, 'YYYYMMDD')::INTEGER,
    d,
    EXTRACT(ISODOW FROM d),
    EXTRACT(DAY FROM d),
    ...
FROM generate_series('2020-01-01'::DATE, '2030-12-31'::DATE, '1 day') AS d;
```

---

### 🧱 **Dimensión: `dim_alert`**

```sql
CREATE TABLE dim_alert (
    alert_id            SERIAL PRIMARY KEY,
    
    -- Clasificación
    alert_type          VARCHAR(50) NOT NULL,  -- 'SECURITY', 'CLIMATE', 'OPERATIONAL', etc.
    severity_level      VARCHAR(20) NOT NULL,  -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    
    -- Descripción
    alert_category      VARCHAR(100),
    alert_description   TEXT,
    
    -- Resolución
    is_resolvable       BOOLEAN DEFAULT TRUE,
    typical_resolution_days INTEGER,
    
    -- Auditoría
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 **Hechos Derivados (Data Marts)**

### 🎯 **Data Mart: `fact_daily_performance`**

Agregación diaria para dashboards y reportes rápidos.

```sql
CREATE TABLE fact_daily_performance (
    performance_id          BIGSERIAL PRIMARY KEY,
    
    -- Dimensiones
    date_id                 INTEGER NOT NULL REFERENCES dim_date(date_id),
    gestor_id               INTEGER REFERENCES dim_gestor(gestor_id),
    territory_id            INTEGER REFERENCES dim_territory(territory_id),
    
    -- KPIs Operativos
    visits_planned          INTEGER DEFAULT 0,
    visits_executed         INTEGER DEFAULT 0,
    visits_failed           INTEGER DEFAULT 0,
    compliance_rate         DECIMAL(5,2),  -- % cumplimiento
    
    -- KPIs de Cobertura
    units_covered           INTEGER DEFAULT 0,
    coverage_rate           DECIMAL(5,2),  -- % cobertura
    
    -- KPIs de Calidad
    avg_visit_score         DECIMAL(5,2),
    visits_with_gps         INTEGER DEFAULT 0,
    visits_with_evidence    INTEGER DEFAULT 0,
    quality_score           DECIMAL(5,2),
    
    -- KPIs de Riesgo
    critical_alerts         INTEGER DEFAULT 0,
    preventive_alerts       INTEGER DEFAULT 0,
    risk_index              DECIMAL(5,2),
    
    -- Productividad
    avg_execution_time_min  DECIMAL(8,2),
    total_distance_km       DECIMAL(10,2),
    
    -- Auditoría
    created_at              TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(date_id, gestor_id, territory_id)
);

CREATE INDEX idx_fact_daily_perf_date ON fact_daily_performance(date_id);
CREATE INDEX idx_fact_daily_perf_gestor ON fact_daily_performance(gestor_id);
```

---

### 🎯 **Data Mart: `fact_monthly_summary`**

Agregación mensual para CEO Dashboard y OKRs.

```sql
CREATE TABLE fact_monthly_summary (
    summary_id              BIGSERIAL PRIMARY KEY,
    
    -- Período
    year                    INTEGER NOT NULL,
    month                   INTEGER NOT NULL,
    territory_id            INTEGER REFERENCES dim_territory(territory_id),
    
    -- North Star KPI
    icoe_score              DECIMAL(5,2),  -- ICOE del mes
    icoe_trend              VARCHAR(10),   -- 'UP', 'DOWN', 'STABLE'
    
    -- KPIs Satélite
    compliance_rate         DECIMAL(5,2),
    coverage_rate           DECIMAL(5,2),
    quality_score           DECIMAL(5,2),
    
    -- Riesgo
    avg_risk_index          DECIMAL(5,2),
    risk_level              VARCHAR(20),   -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    -- Productividad
    avg_productivity        DECIMAL(5,2),
    total_visits            INTEGER,
    active_gestors          INTEGER,
    
    -- Tendencias (vs mes anterior)
    icoe_change_pct         DECIMAL(5,2),
    compliance_change_pct   DECIMAL(5,2),
    coverage_change_pct     DECIMAL(5,2),
    
    -- Auditoría
    created_at              TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(year, month, territory_id)
);

CREATE INDEX idx_fact_monthly_summary_period ON fact_monthly_summary(year, month);
```

---

## 🔄 **Pipeline ETL/ELT**

### **Proceso de Carga Diaria**

```sql
-- Stored Procedure: Carga incremental diaria
CREATE OR REPLACE PROCEDURE sp_load_daily_facts()
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. Extraer visitas del día desde ODS
    INSERT INTO fact_visits (
        gestor_id,
        territory_id,
        productive_unit_id,
        date_id,
        planned_flag,
        executed_flag,
        execution_time_min,
        visit_score,
        has_gps,
        has_photo,
        has_signature,
        planned_datetime,
        executed_datetime
    )
    SELECT 
        dg.gestor_id,
        dt.territory_id,
        dpu.unit_id,
        TO_CHAR(v.created_at, 'YYYYMMDD')::INTEGER,
        v.status IN ('SCHEDULED', 'COMPLETED'),
        v.status = 'COMPLETED',
        EXTRACT(EPOCH FROM (v.verified_at - v.created_at))/60,
        CASE 
            WHEN v.latitude IS NOT NULL AND v.longitude IS NOT NULL THEN 100
            WHEN v.verified_at IS NOT NULL THEN 80
            ELSE 50
        END,
        v.latitude IS NOT NULL,
        v.verified_at IS NOT NULL,
        v.verified_at IS NOT NULL,
        v.created_at,
        v.verified_at
    FROM ods.visits v
    JOIN dim_gestor dg ON v.user_id = dg.gestor_code
    JOIN dim_productive_unit dpu ON v.productive_unit_id = dpu.unit_code
    JOIN dim_territory dt ON dpu.territory_id = dt.territory_id
    WHERE v.created_at::DATE = CURRENT_DATE - INTERVAL '1 day'
    ON CONFLICT DO NOTHING;
    
    -- 2. Actualizar fact_daily_performance
    INSERT INTO fact_daily_performance (
        date_id,
        gestor_id,
        territory_id,
        visits_planned,
        visits_executed,
        compliance_rate,
        avg_visit_score,
        visits_with_gps,
        quality_score,
        critical_alerts
    )
    SELECT 
        date_id,
        gestor_id,
        territory_id,
        SUM(CASE WHEN planned_flag THEN 1 ELSE 0 END),
        SUM(CASE WHEN executed_flag THEN 1 ELSE 0 END),
        ROUND(100.0 * SUM(CASE WHEN executed_flag THEN 1 ELSE 0 END) / 
              NULLIF(SUM(CASE WHEN planned_flag THEN 1 ELSE 0 END), 0), 2),
        AVG(visit_score),
        SUM(CASE WHEN has_gps THEN 1 ELSE 0 END),
        AVG(CASE WHEN has_gps AND has_photo AND has_signature THEN 100 ELSE 70 END),
        SUM(alert_count)
    FROM fact_visits
    WHERE date_id = TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD')::INTEGER
    GROUP BY date_id, gestor_id, territory_id
    ON CONFLICT (date_id, gestor_id, territory_id) 
    DO UPDATE SET
        visits_planned = EXCLUDED.visits_planned,
        visits_executed = EXCLUDED.visits_executed,
        compliance_rate = EXCLUDED.compliance_rate;
        
    COMMIT;
END;
$$;
```

---

## 🧠 **Ventajas del Star Schema**

✅ **Queries Rápidas**: Joins simples, índices optimizados
✅ **BI Simple**: Herramientas como Power BI/Tableau se conectan fácilmente
✅ **ML Listo**: Features ya preparadas para modelos
✅ **Trazabilidad Total**: Input → KPI → Decisión
✅ **Escalabilidad**: Particionamiento por fecha_id
✅ **Historización**: SCD Type 2 en dimensiones críticas

---

## 🤖 **Predicción Avanzada con ML**

### **Principio ML Correcto**

> "No predecimos números. Predecimos probabilidad de fallar."

---

### 🎯 **Modelo 1: Predicción de Riesgo Territorial**

**Objetivo**: ¿Dónde va a fallar la operación?

**Target**:
```python
risk_event = 1  # Si ocurre alerta crítica en próximos N días
```

**Features (Variables Predictoras)**:

```python
# Operación (últimos 7/30 días)
- pct_visits_failed_7d
- pct_visits_failed_30d
- avg_delay_days
- recurring_alerts_count

# Gestor
- gestor_historical_score
- gestor_fatigue_index  # Visitas/día vs promedio
- gestor_recent_rotation  # Cambio reciente de zona

# Territorio
- territory_criticality_score
- territory_unit_density
- territory_base_risk

# Temporal
- is_rainy_season
- is_holiday_week
- day_of_week

# Tendencias
- visits_trend_7d  # Regresión lineal últimos 7 días
- alerts_trend_30d
```

**Modelo**:
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit

# Preparación de datos
X = df[features]
y = df['risk_event']

# Validación temporal (no aleatoria)
tscv = TimeSeriesSplit(n_splits=5)

# Modelo
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=50,
    class_weight='balanced',  # Importante: datos desbalanceados
    random_state=42
)

# Entrenamiento
model.fit(X_train, y_train)

# Predicción
risk_prob = model.predict_proba(X_test)[:, 1]
```

**Output**:
```json
{
  "municipality_id": "05001",
  "municipality_name": "Medellín",
  "risk_probability": 0.78,
  "risk_level": "HIGH",
  "estimated_window_days": 14,
  "top_factors": [
    {"feature": "pct_visits_failed_7d", "importance": 0.32},
    {"feature": "gestor_fatigue_index", "importance": 0.24},
    {"feature": "territory_criticality_score", "importance": 0.18}
  ],
  "suggested_actions": [
    "Reasignar gestor de zona Norte",
    "Priorizar municipio en próximas 72h",
    "Auditoría preventiva programada"
  ]
}
```

---

### 🎯 **Modelo 2: Predicción de Cobertura**

**Objetivo**: ¿Qué zonas perderán cobertura pronto?

**Target**:
```python
coverage_loss = 1  # Si cobertura cae bajo threshold en 30 días
```

**Features**:
```python
- visit_frequency_30d
- gestor_absences_count
- installed_capacity  # Gestores asignados
- actual_productivity  # Visitas/día real
- expected_productivity  # Visitas/día esperado
- territory_unit_count
- coverage_trend_30d
```

**Output**:
```json
{
  "territory_id": "05",
  "territory_name": "Antioquia",
  "current_coverage": 76,
  "projected_coverage_30d": 68,
  "risk_level": "MEDIUM",
  "confidence": 0.85,
  "recommendation": "Incrementar 2 gestores o reducir carga en 15%"
}
```

---

### 🔁 **Ciclo de Aprendizaje (MLOps Light)**

```
1. Predicción
   ↓
2. Acción tomada (registrada)
   ↓
3. Resultado real (observado)
   ↓
4. Feedback loop
   ↓
5. Reentrenamiento mensual
   ↓
6. Validación de mejora
   ↓
7. Deployment automático (si mejora > 5%)
```

**Implementación**:
```python
# ml_pipeline.py
class MLPipeline:
    def __init__(self):
        self.model = None
        self.feature_store = FeatureStore()
        
    def train(self, start_date, end_date):
        # 1. Extraer features del DW
        features = self.feature_store.get_features(start_date, end_date)
        
        # 2. Entrenar modelo
        self.model = self._train_model(features)
        
        # 3. Validar
        metrics = self._validate(features)
        
        # 4. Si mejora, guardar
        if metrics['f1_score'] > self.current_best_f1:
            self._save_model(self.model, metrics)
            
    def predict(self, territory_id, horizon_days=30):
        # 1. Obtener features actuales
        current_features = self.feature_store.get_current_features(territory_id)
        
        # 2. Predecir
        risk_prob = self.model.predict_proba([current_features])[0][1]
        
        # 3. Generar explicación
        explanation = self._explain_prediction(current_features)
        
        return {
            'probability': risk_prob,
            'level': self._classify_risk(risk_prob),
            'explanation': explanation
        }
```

---

## 🎛️ **Integración con Dashboards**

### **CEO View**

```sql
-- Query para CEO Dashboard: Zonas con riesgo en 30 días
SELECT 
    dt.region_name,
    dt.municipality_name,
    mp.risk_probability,
    mp.risk_level,
    mp.estimated_window_days,
    mp.suggested_actions
FROM ml_predictions mp
JOIN dim_territory dt ON mp.territory_id = dt.territory_id
WHERE mp.prediction_type = 'TERRITORIAL_RISK'
  AND mp.risk_level IN ('HIGH', 'CRITICAL')
  AND mp.prediction_date = CURRENT_DATE
ORDER BY mp.risk_probability DESC
LIMIT 10;
```

### **Coordinador View**

```sql
-- Query para Alertas Predictivas
SELECT 
    dg.full_name AS gestor,
    dt.municipality_name,
    mp.risk_probability,
    mp.top_factors,
    mp.suggested_actions
FROM ml_predictions mp
JOIN dim_gestor dg ON mp.gestor_id = dg.gestor_id
JOIN dim_territory dt ON mp.territory_id = dt.territory_id
WHERE mp.prediction_type = 'COVERAGE_LOSS'
  AND mp.risk_level = 'MEDIUM'
  AND dg.assigned_region_id = :coordinator_region_id
ORDER BY mp.risk_probability DESC;
```

---

## 🧠 **Transparencia (Clave Enterprise)**

Cada predicción incluye:

1. **Variables que más influyeron** (Feature Importance)
2. **Nivel de confianza** (Probability Score)
3. **Recomendación sugerida** (Actionable Insight)
4. **Datos históricos** (Baseline Comparison)

**Ejemplo de Explicación**:
```json
{
  "prediction_id": "PRED-2026-001",
  "municipality": "Medellín",
  "risk_probability": 0.78,
  "confidence": 0.85,
  "top_factors": [
    {
      "factor": "Visitas fallidas últimos 7 días",
      "value": "32%",
      "importance": 0.32,
      "threshold": "15%",
      "status": "ABOVE_THRESHOLD"
    },
    {
      "factor": "Fatiga operativa del gestor",
      "value": "1.8x promedio",
      "importance": 0.24,
      "threshold": "1.2x",
      "status": "ABOVE_THRESHOLD"
    }
  ],
  "historical_accuracy": {
    "last_30_predictions": 0.82,
    "precision": 0.79,
    "recall": 0.85
  },
  "suggested_actions": [
    "Reasignar gestor senior a zona Norte",
    "Reducir carga operativa en 20%",
    "Programar auditoría en 72h"
  ]
}
```

---

## 🏁 **Resultado Final**

Con **Star Schema + ML**:

✅ **Datos confiables**: Una sola fuente de verdad
✅ **KPIs explicables**: Trazabilidad completa
✅ **Alertas anticipadas**: Predicción a 30 días
✅ **Simulaciones realistas**: What-If basado en datos reales
✅ **Decisiones defendibles**: Ante Board/Inversionistas
✅ **Escalabilidad real**: Millones de registros sin degradación

---

## 📊 **Stack Tecnológico Recomendado**

### **Data Warehouse**
- **PostgreSQL 15+** con extensiones:
  - `pg_partman` (particionamiento automático)
  - `timescaledb` (series temporales)
  - `pg_stat_statements` (monitoreo de queries)

### **ETL/ELT**
- **Apache Airflow** (orquestación)
- **dbt** (transformaciones SQL)
- **Airbyte** (conectores a fuentes)

### **ML**
- **Python 3.11+**
- **scikit-learn** (modelos baseline)
- **XGBoost** (modelos avanzados)
- **MLflow** (tracking de experimentos)
- **SHAP** (explicabilidad)

### **BI**
- **Metabase** (open source, fácil)
- **Power BI** (enterprise)
- **Superset** (Apache, flexible)

---

**Versión**: 1.0.0  
**Última actualización**: 2026-01-29  
**Estado**: 📋 **Especificación Completa - Listo para Implementar**

---

## 🚀 **Próximos Pasos**

1. **Fase 1**: Implementar Star Schema (2 semanas)
2. **Fase 2**: Pipeline ETL diario (1 semana)
3. **Fase 3**: Data Marts agregados (1 semana)
4. **Fase 4**: Modelo ML de Riesgo (2 semanas)
5. **Fase 5**: Integración con Dashboards (1 semana)

**Total estimado**: 7-8 semanas para plataforma completa de inteligencia operativa.
