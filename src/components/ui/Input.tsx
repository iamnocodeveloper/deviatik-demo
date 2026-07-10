import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn('input-base', invalid && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100', className)}
      {...rest}
    />
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'input-base min-h-[80px] resize-y',
        invalid && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
        className,
      )}
      {...rest}
    />
  )
})

export function Label({
  htmlFor,
  children,
  hint,
  error,
  required,
}: {
  htmlFor?: string
  children: React.ReactNode
  hint?: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
        {children}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </label>
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
      {error ? <p className="text-[11px] text-rose-500">{error}</p> : null}
    </div>
  )
}