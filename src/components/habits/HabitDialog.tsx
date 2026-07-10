import { useEffect, useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Label, Textarea } from '../ui/Input'
import { IconPicker } from './HabitIcon'
import { ColorPicker } from './ColorPicker'
import { WEEKDAY_LABELS } from '../../lib/date'
import { HABIT_COLORS, type Frequency, type Habit, type HabitDraft } from '../../types/habit'
import { cn } from '../../lib/utils'

interface HabitDialogProps {
  open: boolean
  onClose: () => void
  habit?: Habit
  onSubmit: (draft: HabitDraft) => Promise<{ error?: string }>
}

const EMPTY: HabitDraft = {
  name: '',
  description: null,
  color: HABIT_COLORS[0],
  icon: 'circle',
  frequency: 'daily',
  days_of_week: [],
}

export function HabitDialog({ open, onClose, habit, onSubmit }: HabitDialogProps) {
  const isEdit = Boolean(habit)
  const [draft, setDraft] = useState<HabitDraft>(() => habitToDraft(habit))
  const [nameError, setNameError] = useState<string | null>(null)
  const [daysError, setDaysError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(habitToDraft(habit))
      setNameError(null)
      setDaysError(null)
    }
  }, [open, habit])

  const handleSubmit = async () => {
    const trimmedName = draft.name.trim()
    if (!trimmedName) {
      setNameError('El nombre es obligatorio.')
      return
    }
    if (trimmedName.length > 80) {
      setNameError('Máximo 80 caracteres.')
      return
    }
    if (draft.frequency === 'weekly' && draft.days_of_week.length === 0) {
      setDaysError('Selecciona al menos un día.')
      return
    }
    setNameError(null)
    setDaysError(null)
    setSubmitting(true)
    const { error } = await onSubmit({
      ...draft,
      name: trimmedName,
      days_of_week: draft.frequency === 'daily' ? [] : draft.days_of_week.slice().sort(),
    })
    setSubmitting(false)
    if (error) return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar hábito' : 'Nuevo hábito'}
      description={
        isEdit
          ? 'Actualiza los detalles de tu hábito.'
          : 'Define un hábito y empieza a seguirlo.'
      }
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear hábito'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="habit-name" required error={nameError ?? undefined}>
            Nombre
          </Label>
          <Input
            id="habit-name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            maxLength={80}
            placeholder="Ej. Hacer ejercicio"
            invalid={!!nameError}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="habit-desc">Descripción</Label>
          <Textarea
            id="habit-desc"
            value={draft.description ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            maxLength={500}
            placeholder="Opcional. Añade contexto o motivación."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Color</Label>
          <ColorPicker
            value={draft.color}
            onChange={(color) => setDraft({ ...draft, color })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Icono</Label>
          <IconPicker
            value={draft.icon}
            onChange={(icon) => setDraft({ ...draft, icon })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Frecuencia</Label>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {(['daily', 'weekly'] as Frequency[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    frequency: f,
                    days_of_week: f === 'daily' ? [] : draft.days_of_week,
                  })
                }
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition',
                  draft.frequency === f
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {f === 'daily' ? 'Diaria' : 'Semanal'}
              </button>
            ))}
          </div>
        </div>

        {draft.frequency === 'weekly' ? (
          <div className="space-y-1.5">
            <Label error={daysError ?? undefined}>Días de la semana</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, idx) => {
                const active = draft.days_of_week.includes(idx)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        days_of_week: active
                          ? draft.days_of_week.filter((d) => d !== idx)
                          : [...draft.days_of_week, idx],
                      })
                    }
                    className={cn(
                      'h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition',
                      active
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}

function habitToDraft(habit?: Habit): HabitDraft {
  if (!habit) return { ...EMPTY }
  return {
    name: habit.name,
    description: habit.description,
    color: habit.color,
    icon: habit.icon,
    frequency: habit.frequency,
    days_of_week: habit.days_of_week ?? [],
  }
}