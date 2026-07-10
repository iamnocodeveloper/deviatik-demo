import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ListChecks, Plus, Sparkles, Target } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useCompletions } from '../hooks/useCompletions'
import { useStats } from '../hooks/useStats'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { HabitCard } from '../components/habits/HabitCard'
import { HabitDialog } from '../components/habits/HabitDialog'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/dashboard/StatCard'
import { EmptyState, Skeleton } from '../components/ui/Primitives'
import { lastNDays, todayISO } from '../lib/date'
import type { Habit, HabitDraft } from '../types/habit'

export function DashboardPage() {
  const { user } = useAuth()
  const toast = useToast()
  const { habits, loading: loadingHabits, create, update, remove } = useHabits()
  const { completions, loading: loadingCompletions, setCompletion } = useCompletions()

  const stats = useStats(habits, completions)
  const today = todayISO()
  const window = useMemo(() => lastNDays(30), [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const name = user?.profile?.name || user?.email?.split('@')[0] || 'amigo'

  const handleSubmit = async (draft: HabitDraft) => {
    if (editing) {
      const { error } = await update(editing.id, draft)
      if (error) {
        toast.show(error, 'error')
        return { error }
      }
      toast.show('Hábito actualizado.', 'success')
    } else {
      const { error } = await create(draft)
      if (error) {
        toast.show(error, 'error')
        return { error }
      }
      toast.show('Hábito creado.', 'success')
    }
    return {}
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const { error } = await remove(deletingId)
    setDeletingId(null)
    if (error) {
      toast.show(error, 'error')
      return
    }
    toast.show('Hábito eliminado.', 'success')
  }

  const handleToggleToday = async (habit: Habit, done: boolean) => {
    const { error } = await setCompletion(habit.id, today, done)
    if (error) {
      toast.show(error, 'error')
    } else {
      toast.show(done ? '¡Día registrado!' : 'Marca retirada.', 'success')
    }
  }

  const deletingHabit = habits.find((h) => h.id === deletingId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {greeting}, {name}.
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {stats.expectedToday === 0
              ? 'No tienes hábitos programados para hoy.'
              : stats.completedToday === stats.expectedToday
                ? '¡Has completado todos tus hábitos de hoy!'
                : `Llevas ${stats.completedToday} de ${stats.expectedToday} hábitos hoy.`}
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditing(undefined)
            setDialogOpen(true)
          }}
        >
          Nuevo hábito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Hábitos activos"
          value={stats.activeHabits}
          hint={stats.activeHabits === 1 ? '1 hábito en seguimiento' : 'en seguimiento'}
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          label="Completados hoy"
          value={`${stats.completedToday}/${stats.expectedToday || 0}`}
          hint={stats.expectedToday === 0 ? 'Sin hábitos para hoy' : 'programados hoy'}
          tone="success"
          icon={<ListChecks className="h-5 w-5" />}
        />
        <StatCard
          label="Racha más larga"
          value={
            stats.longestStreak > 0 ? (
              <span className="inline-flex items-baseline gap-1">
                {stats.longestStreak}
                <span className="text-sm font-medium text-slate-400">días</span>
              </span>
            ) : (
              '—'
            )
          }
          hint="consecutivos en 30 días"
          tone="warn"
          icon={<Flame className="h-5 w-5" />}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Mis hábitos</h2>
          {loadingCompletions && habits.length > 0 ? (
            <span className="text-[11px] text-slate-400">Sincronizando…</span>
          ) : null}
        </div>

        {loadingHabits ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="Aún no tienes hábitos"
            description="Crea tu primer hábito y empieza tu racha hoy. Los hábitos diarios y semanales se ven de forma distinta en el dashboard."
            action={
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditing(undefined)
                  setDialogOpen(true)
                }}
              >
                Crear hábito
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <div key={habit.id} className="relative">
                <HabitCard
                  habit={habit}
                  completions={completions}
                  onToggleToday={(done) => handleToggleToday(habit, done)}
                  onEdit={() => {
                    setEditing(habit)
                    setDialogOpen(true)
                  }}
                  onDelete={() => setDeletingId(habit.id)}
                />
                <Link
                  to={`/habits/${habit.id}`}
                  className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                  aria-label={`Ver detalle de ${habit.name}`}
                >
                  <span className="sr-only">Ver detalle</span>
                </Link>
                <div className="pointer-events-none absolute inset-0 rounded-2xl" />
              </div>
            ))}
          </div>
        )}
      </section>

      <HabitDialog
        open={dialogOpen}
        habit={editing}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar hábito"
        description={
          deletingHabit
            ? `Vas a eliminar "${deletingHabit.name}" y todo su historial de cumplimiento. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        confirmTone="danger"
      />

      <p className="text-center text-[11px] text-slate-400">
        Ventana de seguimiento: {window[0]} → {window[window.length - 1]}
      </p>
    </div>
  )
}