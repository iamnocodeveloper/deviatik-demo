export type Frequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  icon: string
  frequency: Frequency
  days_of_week: number[]
  archived: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completed_on: string
  created_at: string
}

export type HabitDraft = {
  name: string
  description?: string | null
  color: string
  icon: string
  frequency: Frequency
  days_of_week: number[]
}

export const HABIT_COLORS: string[] = [
  '#0ea5e9', // sky
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#eab308', // yellow
  '#14b8a6', // teal
  '#ec4899', // pink
  '#6366f1', // indigo
  '#64748b', // slate
]

export const HABIT_ICONS: string[] = [
  'circle',
  'dumbbell',
  'book',
  'droplet',
  'apple',
  'moon',
  'sun',
  'music',
  'pencil',
  'heart',
  'bike',
  'coffee',
  'leaf',
  'brain',
  'footprints',
  'smile',
]