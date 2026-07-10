import { useMemo } from 'react'
import { lastNDays, WEEKDAY_LABELS, isHabitExpectedOn } from '../../lib/date'
import { cn } from '../../lib/utils'
import type { Habit, HabitCompletion } from '../../types/habit'
import { formatDateLabel } from '../../lib/date'

interface HabitHeatmapProps {
  habit: Habit
  completions: HabitCompletion[]
}

const CELL = 14
const GAP = 3

export function HabitHeatmap({ habit, completions }: HabitHeatmapProps) {
  const days = useMemo(() => lastNDays(30), [])
  const completedSet = useMemo(() => {
    const set = new Set<string>()
    for (const c of completions) {
      if (c.habit_id === habit.id) set.add(c.completed_on)
    }
    return set
  }, [completions, habit.id])

  // Group days by weekday (0=Sun..6=Sat), oldest -> newest left-to-right per row
  const grid = useMemo(() => {
    const rows: { date: string; weekday: number }[][] = [[], [], [], [], [], [], []]
    for (const d of days) {
      const w = new Date(d + 'T00:00:00').getDay()
      rows[w].push({ date: d, weekday: w })
    }
    return rows
  }, [days])

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-3 rounded-xl bg-slate-50 p-3">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-slate-400">
          <div className="w-7" />
          <div className="flex" style={{ gap: GAP }}>
            {Array.from({ length: 5 }).map((_, col) => {
              const cellIdx = col // oldest five columns
              const label = days[cellIdx]
                ? new Date(days[cellIdx] + 'T00:00:00').toLocaleString('es', { month: 'short' })
                : ''
              return (
                <div key={col} className="text-center" style={{ width: CELL }}>
                  {label}
                </div>
              )
            })}
          </div>
        </div>

        {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
          const row = grid[weekday] ?? []
          return (
            <div key={weekday} className="flex items-center gap-3">
              <span className="w-7 text-[10px] font-medium uppercase text-slate-500">
                {WEEKDAY_LABELS[weekday]}
              </span>
              <div className="flex" style={{ gap: GAP }}>
                {Array.from({ length: 30 }).map((_, col) => {
                  const cell = row[col]
                  if (!cell) {
                    return (
                      <div
                        key={col}
                        style={{ width: CELL, height: CELL }}
                        className="rounded-[3px] bg-transparent"
                      />
                    )
                  }
                  const done = completedSet.has(cell.date)
                  const expected = isHabitExpectedOn(
                    habit.frequency,
                    habit.days_of_week,
                    cell.date,
                  )
                  const isToday = cell.date === todayStr
                  return (
                    <div
                      key={cell.date}
                      title={`${formatDateLabel(cell.date)} · ${done ? 'Completado' : expected ? 'Pendiente' : 'No programado'}`}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: done
                          ? habit.color
                          : expected
                            ? '#e2e8f0'
                            : '#f1f5f9',
                        opacity: done ? 1 : 0.7,
                      }}
                      className={cn(
                        'rounded-[3px] transition',
                        isToday && 'ring-2 ring-slate-900 ring-offset-1',
                      )}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-slate-200" /> Pendiente
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-slate-100" /> No programado
        </span>
        <span
          className="inline-flex items-center gap-1"
          style={{ color: habit.color }}
        >
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: habit.color }} />{' '}
          Completado
        </span>
      </div>
    </div>
  )
}