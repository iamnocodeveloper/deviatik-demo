import { useCallback, useEffect, useMemo, useState } from 'react'
import { insforge } from '../lib/insforge'
import { getErrorMessage } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { daysAgoISO } from '../lib/date'
import type { HabitCompletion } from '../types/habit'

const WINDOW_DAYS = 30

interface State {
  completions: HabitCompletion[]
  loading: boolean
  error: string | null
}

export function useCompletions() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ completions: [], loading: true, error: null })

  const windowStart = useMemo(() => daysAgoISO(WINDOW_DAYS - 1), [])

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ completions: [], loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await insforge.database
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_on', windowStart)
    if (error) {
      setState({ completions: [], loading: false, error: getErrorMessage(error) })
      return
    }
    setState({ completions: (data as HabitCompletion[]) ?? [], loading: false, error: null })
  }, [user, windowStart])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setCompletion = useCallback(
    async (habitId: string, dateISO: string, done: boolean): Promise<{ error?: string }> => {
      if (!user) return { error: 'No autenticado.' }
      if (done) {
        const { data, error } = await insforge.database
          .from('habit_completions')
          .insert([{ habit_id: habitId, user_id: user.id, completed_on: dateISO }])
          .select()
        if (error) return { error: getErrorMessage(error) }
        const created = (data as HabitCompletion[] | null)?.[0]
        if (created) {
          setState((s) => ({ ...s, completions: [...s.completions, created] }))
        } else {
          await refresh()
        }
        return {}
      }
      const existing = state.completions.find(
        (c) => c.habit_id === habitId && c.completed_on === dateISO,
      )
      if (!existing) return {}
      const { error } = await insforge.database
        .from('habit_completions')
        .delete()
        .eq('id', existing.id)
      if (error) return { error: getErrorMessage(error) }
      setState((s) => ({
        ...s,
        completions: s.completions.filter((c) => c.id !== existing.id),
      }))
      return {}
    },
    [user, state.completions, refresh],
  )

  const byHabitAndDate = useMemo(() => {
    const map = new Map<string, HabitCompletion>()
    for (const c of state.completions) {
      map.set(`${c.habit_id}|${c.completed_on}`, c)
    }
    return map
  }, [state.completions])

  return {
    completions: state.completions,
    loading: state.loading,
    error: state.error,
    refresh,
    setCompletion,
    byHabitAndDate,
    windowStart,
    windowDays: WINDOW_DAYS,
  }
}