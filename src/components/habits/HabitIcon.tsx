import {
  Apple,
  Bike,
  Brain,
  Book,
  Circle,
  Coffee,
  Dumbbell,
  Droplet,
  Footprints,
  Heart,
  Leaf,
  type LucideIcon,
  Moon,
  Music,
  Pencil,
  Smile,
  Sun,
} from 'lucide-react'
import { HABIT_ICONS } from '../../types/habit'

const ICON_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  dumbbell: Dumbbell,
  book: Book,
  droplet: Droplet,
  apple: Apple,
  moon: Moon,
  sun: Sun,
  music: Music,
  pencil: Pencil,
  heart: Heart,
  bike: Bike,
  coffee: Coffee,
  leaf: Leaf,
  brain: Brain,
  footprints: Footprints,
  smile: Smile,
}

export function HabitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Circle
  return <Icon className={className} />
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {HABIT_ICONS.map((icon) => {
        const isSelected = icon === value
        return (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              isSelected
                ? 'border-brand-400 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
            aria-label={`Icono ${icon}`}
          >
            <HabitIcon name={icon} className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}