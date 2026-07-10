import { useMemo, useState } from 'react'
import { Check, Flame, Pencil, Repeat, Trash2 } from 'lucide-react'
import { Badge, ProgressBar } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardBody } from '../ui/Card'
import { HabitIcon } from './HabitIcon'
import { lastNDays, WEEKDAY_LABELS } from '../../lib/date'
import type { Habit, HabitCompletion } from '../../types/habit'
import { habitStats } from '../../hooks/useStats'
import { cn } from '../../lib/utils'

interface HabitCardProps {
  habit: Habit
  completions: HabitCompletion[]
  onToggleToday: (done: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function HabitCard({
  habit,
  completions,
  onToggleToday,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [busy, setBusy] = useState(false)
  const window = useMemo(() => lastNDays(30), [])
  const stats = useMemo(
    () => habitStats(habit, completions, window),
    [habit, completions, window],
  )

  const frequencyLabel =
    habit.frequency === 'daily'
      ? 'Todos los días'
      : habit.days_of_week
          .slice()
          .sort()
          .map((d) => WEEKDAY_LABELS[d])
          .join(' · ')

  const handleToggle = async () => {
    setBusy(true)
    await onToggleToday(!stats.completedToday)
    setBusy(false)
  }

  return (
    <Card className="flex flex-col">
      <CardBody className="flex-1">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${habit.color}1a`, color: habit.color }}
          >
            <HabitIcon name={habit.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900">{habit.name}</h3>
              {stats.completedToday ? (
                <Badge tone="success">Hoy ✓</Badge>
              ) : null}
            </div>
            {habit.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{habit.description}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Repeat className="h-3 w-3" />
              <span className="truncate">{frequencyLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Últimos 30 días</span>
            <span className="font-semibold text-slate-700">{stats.percent}%</span>
          </div>
          <ProgressBar value={stats.percent} color={habit.color} />
        </div>
      </CardBody>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar hábito">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Eliminar hábito"
            className="text-slate-400 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60',
            stats.completedToday
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-900 text-white hover:bg-slate-800',
          )}
          style={
            !stats.completedToday
              ? { backgroundColor: habit.color }
              : undefined
          }
        >
          {stats.completedToday ? (
            <>
              <Check className="h-3.5 w-3.5" /> Completado
            </>
          ) : (
            <>
              <Flame className="h-3.5 w-3.5" /> Marcar hoy
            </>
          )}
        </button>
      </div>
    </Card>
  )
}