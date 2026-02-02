# Despliegue Manual a Producción (Windows)

Debido a problemas previos con Docker, hemos configurado un entorno de producción directo en Windows.

## ✅ Estado Actual
- **API (Backend):** Corriendo en puerto `3001`
- **Web (Frontend):** Corriendo en puerto `3003` (Modo Producción Optimizado)
- **Base de Datos:** Conectada a Supabase (Producción)

## 🚀 Cómo Iniciar / Reiniciar

Hemos creado un script automático:

```bash
.\scripts\start-manual.bat
```

Este script:
1. Compila la API y el Frontend si es necesario (o usa los builds existentes).
2. Lanza los procesos en ventanas separadas.

## 🛠️ Comandos de Mantenimiento

Si necesitas actualizar el código:

1. **Detener todo:** Cierra las ventanas de CMD que se abrieron.
2. **Reconstruir:**
   ```bash
   pnpm --filter web build
   pnpm --filter api build
   ```
3. **Sincronizar Base de Datos (si hay cambios de esquema):**
   ```bash
   cd apps/api
   npx prisma db push
   ```
4. **Iniciar de nuevo:**
   ```bash
   .\scripts\start-manual.bat
   ```

## 🔍 Verificación
- Frontend: [http://localhost:3003](http://localhost:3003)
- API Health: [http://localhost:3001/health](http://localhost:3001/health)
