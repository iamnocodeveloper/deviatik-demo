# Habit Tracker

Aplicación web de seguimiento de hábitos diarios y semanales, construida con
**React + Vite + TypeScript** en el frontend y **InsForge** como backend
(PostgreSQL con RLS por usuario).

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 3.4
- React Router 6
- `@insforge/sdk` (cliente oficial)
- Lucide Icons, date-fns, clsx, tailwind-merge

## Backend (InsForge)

Las tablas y políticas viven en `migrations/20260710000000_init-habit-tracker.sql`.

| Tabla | Descripción |
| --- | --- |
| `public.habits` | Nombre, descripción, color, icono, frecuencia (`daily` / `weekly`), `days_of_week int[]`, soft-delete (`archived`). |
| `public.habit_completions` | `habit_id`, `user_id`, `completed_on date`, UNIQUE (user, habit, day). |

- **RLS** está habilitado en ambas tablas; cada política restringe el acceso
  a `user_id = auth.uid()`.
- El trigger `set_user_id_on_insert` rellena `user_id` desde `auth.uid()`
  para evitar la conocida fricción entre `DEFAULT auth.uid()` y `WITH CHECK`.
- La función helper `habit_owned_by` (SECURITY DEFINER) permite a la política
  de INSERT en `habit_completions` verificar que el hábito pertenece al mismo
  usuario sin recursar por RLS.

## Configuración local

```bash
# 1. Link con el backend de InsForge
npx @insforge/cli link --project-id <project-id> --org-id <org-id>

# 2. Variables de entorno (Vite)
# .env
VITE_INSFORGE_URL=https://demo-youtube-minimax.apps.devtik.xyz
VITE_INSFORGE_ANON_KEY=<anon-key>

# 3. Instalar y arrancar
npm install
npm run dev
```

Para aplicar la migración manualmente (los proyectos enlazados con la CLI ya
la tienen aplicada):

```bash
# Opción A — endpoint de migración
# (no soportado en esta versión del CLI, usar opción B)

# Opción B — `db query` con la migración aplicada manualmente
npx @insforge/cli db query --unrestricted \
  "$(cat migrations/20260710000000_init-habit-tracker.sql)"
```

## Funcionalidad

- Registro e inicio de sesión (con verificación de correo opcional).
- Dashboard con tres estadísticas: hábitos activos, completados hoy, racha más larga.
- CRUD completo de hábitos (crear, editar, archivar).
- Hábitos diarios o semanales con selección de días.
- Marcar hábito como completado en el día (un click).
- Historial visual tipo heatmap de los últimos 30 días.
- Porcentaje de cumplimiento por hábito.
- Solo puedes ver y modificar tus propios datos (RLS).