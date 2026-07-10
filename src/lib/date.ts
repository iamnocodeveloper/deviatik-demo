import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns'

export function todayISO(): string {
  return format(startOfDay(new Date()), 'yyyy-MM-dd')
}

export function formatDateLabel(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  return format(d, 'd MMM')
}

export function lastNDays(n: number, from: Date = new Date()): string[] {
  const dates: string[] = []
  const today = startOfDay(from)
  for (let i = n - 1; i >= 0; i--) {
    dates.push(format(addDays(today, -i), 'yyyy-MM-dd'))
  }
  return dates
}

export function daysAgoISO(n: number): string {
  return format(addDays(startOfDay(new Date()), -n), 'yyyy-MM-dd')
}

export function getWeekdayIndex(dateISO: string): number {
  // 0 = Sunday ... 6 = Saturday (matches the JS Date.getDay convention used in days_of_week)
  return new Date(dateISO + 'T00:00:00').getDay()
}

export function isHabitExpectedOn(
  frequency: 'daily' | 'weekly',
  daysOfWeek: number[],
  dateISO: string,
): boolean {
  if (frequency === 'daily') return true
  return daysOfWeek.includes(getWeekdayIndex(dateISO))
}

export function completionPercent(
  completions: Set<string>,
  frequency: 'daily' | 'weekly',
  daysOfWeek: number[],
  window: string[],
): number {
  const expectedDays = window.filter((d) => isHabitExpectedOn(frequency, daysOfWeek, d))
  if (expectedDays.length === 0) return 0
  const done = expectedDays.filter((d) => completions.has(d)).length
  return Math.round((done / expectedDays.length) * 100)
}

export function longestStreak(
  completions: Set<string>,
  frequency: 'daily' | 'weekly',
  daysOfWeek: number[],
  window: string[],
): number {
  let best = 0
  let current = 0
  for (const d of window) {
    if (!isHabitExpectedOn(frequency, daysOfWeek, d)) continue
    if (completions.has(d)) {
      current += 1
      if (current > best) best = current
    } else {
      current = 0
    }
  }
  return best
}

export function currentStreak(
  completions: Set<string>,
  frequency: 'daily' | 'weekly',
  daysOfWeek: number[],
  window: string[],
): number {
  let streak = 0
  // Walk backward from today
  for (let i = window.length - 1; i >= 0; i--) {
    const d = window[i]
    if (!isHabitExpectedOn(frequency, daysOfWeek, d)) continue
    if (completions.has(d)) {
      streak += 1
    } else {
      break
    }
  }
  return streak
}

export function todayLabel(): string {
  return format(new Date(), "EEEE, d 'de' MMMM")
}

export function dayDiff(aISO: string, bISO: string): number {
  return differenceInCalendarDays(
    new Date(aISO + 'T00:00:00'),
    new Date(bISO + 'T00:00:00'),
  )
}

export const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']