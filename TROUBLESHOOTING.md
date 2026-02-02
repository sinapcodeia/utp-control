# 🔧 Troubleshooting - Errores Comunes

**Última actualización**: 2026-01-31

---

## 🚨 Error: "Failed to fetch" (TypeError)

### **Síntomas**
```
AuthContext.tsx:58 Error loading profile: TypeError: Failed to fetch
```

### **Causas Posibles**

1. **Backend no está corriendo** 🔴
   - Verificar que el API esté ejecutándose en `http://localhost:3001`
   - Comando: `cd apps/api && pnpm start:dev`

2. **Frontend no puede conectar con el API** ⚠️
   - Verificar que el frontend esté en `http://localhost:3000`
   - Comando: `cd apps/web && pnpm dev`

3. **Problemas de CORS** 🔒
   - Verificar configuración de CORS en el backend
   - Asegurarse de que las cookies se envíen correctamente

4. **Extension del navegador bloqueando requests** 🛡️
   - Deshabilitar extensiones de seguridad temporalmente
   - Usar modo incógnito para testing

### **Solución**

#### **Paso 1: Verificar que el backend está corriendo**
```bash
curl http://localhost:3001/health
```

**Respuesta esperada**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T...",
  "uptime": 153.13,
  ...
}
```

#### **Paso 2: Verificar que el endpoint `/api/users/me` funciona**
```bash
# Primero, iniciar sesión en el navegador para obtener cookies
# Luego, desde DevTools Console:
fetch('/api/users/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

#### **Paso 3: Revisar logs del navegador**
1. Abrir DevTools (F12)
2. Ir a la pestaña **Network**
3. Filtrar por "me"
4. Buscar el request a `/api/users/me`
5. Revisar:
   - **Status Code**: Debería ser 200
   - **Headers**: Verificar cookies
   - **Response**: Ver el error exacto

#### **Paso 4: Verificar variables de entorno**

**`apps/web/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL="https://mhaqatbmjuqdodaczlmc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://127.0.0.1:3001"
```

#### **Paso 5: Limpiar caché y reiniciar**
```bash
# Terminal 1 - Backend
cd apps/api
rm -rf dist
pnpm start:dev

# Terminal 2 - Frontend  
cd apps/web
rm -rf .next
pnpm dev
```

---

## ⚠️ Error: Hydration Mismatch (bis_skin_checked)

### **Síntomas**
```
A tree hydrated but some attributes of the server rendered HTML didn't match...
- bis_skin_checked="1"
```

### **Causa**
Este atributo es **inyectado por extensiones del navegador**, típicamente:
- **BitDefender Internet Security** (BIS)
- Extensiones de AdBlock
- Extensiones de Dark Mode
- Otros plugins de seguridad

### **Solución**

#### **Opción 1: Suprimir el warning (Recomendado para desarrollo)**
El warning ya está suprimido con `suppressHydrationWarning` en el layout:

```tsx
<html lang="en" suppressHydrationWarning>
  <body suppressHydrationWarning>
```

#### **Opción 2: Desactivar extensiones (Testing)**
1. Abrir modo incógnito sin extensiones
2. O desactivar BitDefender/extensiones temporalmente

#### **Opción 3: Ignorar el warning**
Este warning **no afecta la funcionalidad** de la aplicación. Es solo cosmético.

---

## 🔐 Error: "Unauthorized" (401) en /api/users/me

### **Síntomas**
```
Response status: 401
Error: Unauthorized
```

### **Causas**

1. **No hay sesión activa de Supabase** 🔑
2. **Cookies no se están enviando** 🍪
3. **Token JWT expirado** ⏰

### **Solución**

#### **Paso 1: Verificar sesión de Supabase**
```typescript
// En DevTools Console
const { createClient } = await import('./utils/supabase/client');
const supabase = createClient();
const { data } = await supabase.auth.getUser();
console.log(data.user);
```

#### **Paso 2: Iniciar sesión nuevamente**
1. Ir a `/auth/login`
2. Ingresar credenciales válidas
3. Verificar que redirige al dashboard

#### **Paso 3: Verificar cookies**
1. DevTools → Application → Cookies
2. Buscar cookies de Supabase:
   - `sb-{project-id}-auth-token`
   - Debe estar presente y no expirado

---

## 📡 Error: CORS (Cross-Origin Request Blocked)

### **Síntomas**
```
Access to fetch at 'http://localhost:3001/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### **Solución**

Verificar configuración de CORS en `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
});
```

---

## 🔄 Error: Too Many Requests / Infinite Loop

### **Síntomas**
El componente `AuthContext` hace requests infinitos a `/api/users/me`

### **Causas**
- Dependencias incorrectas en `useEffect`
- Estado que causa re-renders infinitos

### **Solución**

Verificar que `loadProfile` esté en `useCallback` y que las dependencias de `useEffect` sean correctas.

---

## 📝 Checklist de Diagnóstico Rápido

Cuando tengas un error, sigue estos pasos en orden:

- [ ] ¿Está el backend corriendo? → `curl http://localhost:3001/health`
- [ ] ¿Está el frontend corriendo? → Abrir `http://localhost:3000`
- [ ] ¿Hay errores en la consola del navegador?
- [ ] ¿Hay errores en la terminal del backend?
- [ ] ¿Hay errores en la terminal del frontend?
- [ ] ¿Las variables de entorno están correctas?
- [ ] ¿Hay sesión activa de Supabase?
- [ ] ¿Se están enviando las cookies?

---

## 🆘 Reportar un Bug

Si ninguna de estas soluciones funciona, recopilar la siguiente información:

1. **Logs del navegador** (DevTools Console)
2. **Logs del backend** (Terminal donde corre `apps/api`)
3. **Screenshots del error**
4. **Network tab** (Headers y Response)
5. **Pasos para reproducir el error**

---

**Documento de Troubleshooting - UTP CONTROL**  
**Versión**: 1.0.0  
**Fecha**: 2026-01-31
