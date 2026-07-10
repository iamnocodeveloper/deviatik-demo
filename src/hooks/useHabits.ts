import { useCallback, useEffect, useState } from 'react'
import { insforge } from '../lib/insforge'
import { getErrorMessage } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import type { Habit, HabitDraft } from '../types/habit'

interface State {
  habits: Habit[]
  loading: boolean
  error: string | null
}

export function useHabits() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ habits: [], loading: true, error: null })

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ habits: [], loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await insforge.database
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: true })
    if (error) {
      setState({ habits: [], loading: false, error: getErrorMessage(error) })
      return
    }
    setState({ habits: (data as Habit[]) ?? [], loading: false, error: null })
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (draft: HabitDraft): Promise<{ error?: string }> => {
      const { data, error } = await insforge.database
        .from('habits')
        .insert([
          {
            ...draft,
            description: draft.description?.trim() ? draft.description.trim() : null,
          },
        ])
        .select()
      if (error) return { error: getErrorMessage(error) }
      const created = (data as Habit[] | null)?.[0]
      if (created) {
        setState((s) => ({ ...s, habits: [...s.habits, created] }))
      } else {
        await refresh()
      }
      return {}
    },
    [refresh],
  )

  const update = useCallback(
    async (id: string, patch: Partial<HabitDraft>): Promise<{ error?: string }> => {
      const { data, error } = await insforge.database
        .from('habits')
        .update({
          ...patch,
          description:
            patch.description !== undefined
              ? patch.description?.trim()
                ? patch.description.trim()
                : null
              : undefined,
        })
        .eq('id', id)
        .select()
      if (error) return { error: getErrorMessage(error) }
      const updated = (data as Habit[] | null)?.[0]
      if (updated) {
        setState((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? updated : h)),
        }))
      } else {
        await refresh()
      }
      return {}
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      const { error } = await insforge.database.from('habits').update({ archived: true }).eq('id', id)
      if (error) return { error: getErrorMessage(error) }
      setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }))
      return {}
    },
    [],
  )

  return {
    habits: state.habits,
    loading: state.loading,
    error: state.error,
    refresh,
    create,
    update,
    remove,
  }
}