import { useMemo } from 'react'
import { lastNDays, todayISO, isHabitExpectedOn, completionPercent, longestStreak } from '../lib/date'
import type { Habit, HabitCompletion } from '../types/habit'

export interface DashboardStats {
  activeHabits: number
  completedToday: number
  expectedToday: number
  longestStreak: number
  windowDays: number
}

export function useStats(habits: Habit[], completions: HabitCompletion[]): DashboardStats {
  return useMemo(() => {
    const window = lastNDays(30)
    const today = todayISO()
    const expectedToday = habits.filter((h) =>
      isHabitExpectedOn(h.frequency, h.days_of_week, today),
    )

    const completionsByHabit = new Map<string, Set<string>>()
    for (const c of completions) {
      const set = completionsByHabit.get(c.habit_id) ?? new Set<string>()
      set.add(c.completed_on)
      completionsByHabit.set(c.habit_id, set)
    }

    const completedToday = expectedToday.filter((h) =>
      completionsByHabit.get(h.id)?.has(today),
    ).length

    let bestStreak = 0
    for (const h of habits) {
      const set = completionsByHabit.get(h.id) ?? new Set<string>()
      const streak = longestStreak(set, h.frequency, h.days_of_week, window)
      if (streak > bestStreak) bestStreak = streak
    }

    return {
      activeHabits: habits.length,
      completedToday,
      expectedToday: expectedToday.length,
      longestStreak: bestStreak,
      windowDays: 30,
    }
  }, [habits, completions])
}

export function habitStats(
  habit: Habit,
  completions: HabitCompletion[],
  window: string[],
) {
  const set = new Set(
    completions.filter((c) => c.habit_id === habit.id).map((c) => c.completed_on),
  )
  return {
    percent: completionPercent(set, habit.frequency, habit.days_of_week, window),
    completions: set,
    completedToday: set.has(window[window.length - 1]),
  }
}