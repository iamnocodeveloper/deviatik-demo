import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Flame, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useCompletions } from '../hooks/useCompletions'
import { useToast } from '../context/ToastContext'
import { HabitDialog } from '../components/habits/HabitDialog'
import { HabitHeatmap } from '../components/habits/HabitHeatmap'
import { HabitIcon } from '../components/habits/HabitIcon'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, ProgressBar } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Primitives'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import {
  completionPercent,
  currentStreak,
  lastNDays,
  longestStreak,
  todayISO,
  WEEKDAY_LABELS,
} from '../lib/date'
import { habitStats } from '../hooks/useStats'
import type { HabitDraft } from '../types/habit'

export function HabitDetailPage() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { habits, loading, update, remove } = useHabits()
  const { completions, setCompletion } = useCompletions()
  const habit = useMemo(() => habits.find((h) => h.id === params.id) ?? null, [habits, params.id])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !habit && params.id) {
      navigate('/', { replace: true })
    }
  }, [habit, loading, params.id, navigate])

  if (loading && !habit) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!habit) return null

  const window = lastNDays(30)
  const stats = habitStats(habit, completions, window)
  const completionsSet = stats.completions
  const longest = longestStreak(completionsSet, habit.frequency, habit.days_of_week, window)
  const current = currentStreak(completionsSet, habit.frequency, habit.days_of_week, window)
  const percent = completionPercent(completionsSet, habit.frequency, habit.days_of_week, window)

  const today = todayISO()

  const handleToggleToday = async (done: boolean) => {
    const { error } = await setCompletion(habit.id, today, done)
    if (error) toast.show(error, 'error')
    else toast.show(done ? '¡Día registrado!' : 'Marca retirada.', 'success')
  }

  const handleSubmit = async (draft: HabitDraft) => {
    const { error } = await update(habit.id, draft)
    if (error) {
      toast.show(error, 'error')
      return { error }
    }
    toast.show('Hábito actualizado.', 'success')
    return {}
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await remove(habit.id)
    setDeleting(false)
    if (error) {
      toast.show(error, 'error')
      return
    }
    toast.show('Hábito eliminado.', 'success')
    navigate('/', { replace: true })
  }

  const frequencyLabel =
    habit.frequency === 'daily'
      ? 'Todos los días'
      : habit.days_of_week
          .slice()
          .sort()
          .map((d) => WEEKDAY_LABELS[d])
          .join(' · ')

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-3 w-3" /> Volver al dashboard
        </Link>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${habit.color}1a`, color: habit.color }}
              >
                <HabitIcon name={habit.icon} className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{habit.name}</h1>
                {habit.description ? (
                  <p className="mt-1 max-w-xl text-sm text-slate-600">{habit.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">
                    <Repeat className="h-3 w-3" />
                    {habit.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                  </Badge>
                  <span className="text-xs text-slate-500">{frequencyLabel}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => setDialogOpen(true)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => setDeleting(true)}
                className="text-slate-500 hover:text-rose-600"
              >
                Eliminar
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Cumplimiento 30d
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{percent}%</p>
              <ProgressBar value={percent} color={habit.color} className="mt-2" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Racha actual</p>
              <p className="mt-1 inline-flex items-baseline gap-1 text-2xl font-semibold text-slate-900">
                {current} <Flame className="h-4 w-4 text-amber-500" />
              </p>
              <p className="mt-1 text-[11px] text-slate-500">días consecutivos esperados</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Racha más larga
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{longest}</p>
              <p className="mt-1 text-[11px] text-slate-500">días consecutivos en 30 días</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleToday(!stats.completedToday)}
              className={
                stats.completedToday
                  ? 'rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100'
                  : 'rounded-lg px-3 py-2 text-sm font-semibold text-white'
              }
              style={
                !stats.completedToday ? { backgroundColor: habit.color } : undefined
              }
            >
              {stats.completedToday ? '✓ Completado hoy' : 'Marcar hoy como hecho'}
            </button>
            <span className="text-xs text-slate-400">
              {habit.frequency === 'daily'
                ? 'Este hábito se repite todos los días.'
                : `Días esperados: ${habit.days_of_week
                    .slice()
                    .sort()
                    .map((d) => WEEKDAY_LABELS[d])
                    .join(', ')}.`}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Historial de los últimos 30 días"
          description="Cada celda es un día. Las celdas opacas corresponden a días no programados."
        />
        <CardBody>
          <HabitHeatmap habit={habit} completions={completions} />
        </CardBody>
      </Card>

      <HabitDialog
        open={dialogOpen}
        habit={habit}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar hábito"
        description={`Vas a eliminar "${habit.name}" y todo su historial. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmTone="danger"
      />
    </div>
  )
}