import { HABIT_COLORS } from '../../types/habit'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_COLORS.map((color) => {
        const isSelected = color.toLowerCase() === value.toLowerCase()
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-7 w-7 rounded-full border-2 transition ${
              isSelected ? 'border-slate-900 scale-110' : 'border-white shadow-soft'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        )
      })}
    </div>
  )
}