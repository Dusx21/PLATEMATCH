# platematch v2

**Plataforma FoodTech de descubrimiento gastronómico hiperlocal**
Desarrollada para la Escuela Profesional de Ingeniería de Sistemas – Universidad Andina del Cusco (ExpoAndina)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Estilos | Tailwind CSS v3 + CSS custom properties |
| Animaciones | Framer Motion / Motion |
| Base de datos | Supabase (PostgreSQL + RLS + Realtime) |
| Deploy | Vercel (SPA estática) |
| QR | qrcode.react + html5-qrcode |

---

## Estructura de la aplicación

```
/             → App del comensal (Discovery Feed, tarjetas swipeables, reservas, ticket digital)
/dashboard    → Dashboard del restaurante Doña Rosa (pedidos, inventario, validación QR, historial)
/ticket/:id   → Ticket digital activo con cuenta regresiva y código QR
```

---

## Requisitos previos

- Node.js ≥ 20
- npm ≥ 10
- Cuenta Supabase (o correr en modo Demo offline sin credenciales)

---

## Instalación local

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd platematch

# Instalar dependencias
npm install
```

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (nunca lo cometas al repositorio):

```env
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Dónde encontrar los valores:**
> Supabase Dashboard → tu proyecto → Project Settings → API
> - **Project URL** → `VITE_SUPABASE_URL`
> - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

> **⚠️ Seguridad:** La clave `anon` es pública por diseño y queda incluida en el bundle del navegador. Protege tus datos exclusivamente mediante políticas **Row Level Security (RLS)** en Supabase. **Nunca uses la clave `service_role` en el frontend.**

Si dejas las variables vacías la app corre en **Modo Demo offline** completo con datos persistidos en `localStorage`. No se pierde ninguna funcionalidad para la demo de ExpoAndina.

---

## Ejecutar el proyecto

```bash
# Modo desarrollo (hot reload)
npm run dev

# El servidor queda en: http://localhost:5173
# App del comensal:     http://localhost:5173/
# Dashboard:            http://localhost:5173/dashboard
```

---

## Build de producción

```bash
npm run build
```

Genera los archivos en `dist/`. Puedes probar el build localmente:

```bash
npm run preview
# Disponible en: http://localhost:4173
```

---

## Configurar Supabase

### 1. Ejecutar la migración

En Supabase Dashboard → SQL Editor, ejecuta el contenido de:

```
supabase/migrations/20261023_init_platematch.sql
```

Este script:
- Crea las tablas `restaurants`, `dishes` y `reservations`
- Configura índices de rendimiento
- Activa Row Level Security (RLS)
- Crea las políticas de acceso mínimas necesarias
- Crea los RPC atómicos: `create_reservation_atomic`, `validate_and_complete_reservation_atomic`, `update_dish_stock_atomic`
- Incluye datos semilla (restaurantes y platos de Cusco)

### 2. Verificar RLS

Las políticas ya están incluidas en la migración:
- `restaurants`: solo restaurantes con `is_open = true` son visibles públicamente
- `dishes`: todos los platos son visibles (el filtro `is_available` se aplica en cliente)
- `reservations`: lectura y creación públicas (el control real está en los RPCs `SECURITY DEFINER`)

### 3. Verificar Realtime

Asegúrate de que las tablas `reservations` y `dishes` estén publicadas en Realtime:
Supabase Dashboard → Database → Replication → supabase_realtime

(La migración ya incluye `ALTER PUBLICATION supabase_realtime ADD TABLE ...`)

---

## Despliegue en Vercel

### Opción A: Interfaz web de Vercel (recomendado)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → **Add New → Project**
3. Importa tu repositorio de GitHub
4. Vercel detecta Vite automáticamente. Confirma:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. En **Environment Variables**, añade:
   ```
   VITE_SUPABASE_URL        = https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY   = eyJ...tu-clave-anon...
   ```
6. Haz clic en **Deploy**

### Opción B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Configuración SPA (ya incluida)

El archivo `vercel.json` en la raíz configura las reescrituras necesarias para que React Router funcione correctamente cuando el usuario navega directamente a `/dashboard` o actualiza el navegador:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Variables de entorno en Vercel por entorno

| Variable | Entorno | Valor |
|---|---|---|
| `VITE_SUPABASE_URL` | Production, Preview, Development | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Clave anon pública de Supabase |

> Las variables con prefijo `VITE_` se incrusta en el bundle del navegador en tiempo de build. Por eso deben ser valores **públicos** protegidos por RLS.

---

## Verificar la conexión con Supabase

Una vez desplegado, abre la consola del navegador (F12) y busca:

- ✅ **No hay mensaje** `[platematch] Supabase no configurado` → las variables están correctas
- ✅ Los platos cargan desde Supabase (no de `localStorage`)
- ❌ Si aparece `[platematch] Supabase no configurado` → revisa que las variables `VITE_*` estén en Vercel

---

## ¿Por qué no aparecen los platos?

Diagnóstico en orden:

1. **Modo Demo offline (normal):** Si no hay `.env.local` ni variables en Vercel, la app usa datos de `localStorage`. Funciona perfectamente para ExpoAndina.
2. **Variables incorrectas:** La URL debe comenzar con `https://` y no contener `placeholder`. La clave anon debe ser un JWT válido.
3. **Política RLS bloqueando:** Verifica que la política `"Public: read all dishes"` existe en Supabase → Authentication → Policies.
4. **Tabla no creada:** Ejecuta la migración desde el SQL Editor de Supabase.
5. **Supabase en pausa:** Los proyectos gratuitos se pausan por inactividad. Actívalos desde el dashboard.

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Build de producción → dist/
npm run preview   # Preview local del build de producción
npm run lint      # Análisis estático con oxlint
npm run test      # Tests con vitest (si existen)
```

---

## Modo Demo vs Modo Supabase

| Funcionalidad | Demo (offline) | Supabase (online) |
|---|---|---|
| Platos del feed | ✅ localStorage | ✅ Tabla `dishes` |
| Restaurantes | ✅ localStorage | ✅ Tabla `restaurants` |
| Crear reserva | ✅ localStorage | ✅ RPC atómico |
| Validar QR | ✅ localStorage | ✅ RPC atómico |
| Realtime | ✅ CustomEvents (mismo tab) + Storage (cross-tab) | ✅ Supabase Realtime WebSocket |
| Stock atómico | ✅ localStorage | ✅ `FOR UPDATE` lock en PostgreSQL |

---

## Arquitectura de seguridad

- La clave `service_role` **nunca está en el frontend**
- Las operaciones críticas (crear reserva, decrementar stock, validar QR) se ejecutan mediante RPCs `SECURITY DEFINER` en PostgreSQL
- RLS activo en todas las tablas
- No hay rutas API serverless — es una SPA 100% estática servida por Vercel CDN
- Las credenciales no se imprimen en logs de producción
- `.env`, `.env.local` y `.env.*` están en `.gitignore`

---

## Hecho para ExpoAndina · UAC Larapa · Cusco, Perú
