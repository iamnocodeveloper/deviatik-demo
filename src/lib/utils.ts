import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ha ocurrido un error inesperado.'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const e = error as { message?: string; error_description?: string; error?: string }
    return e.error_description || e.message || e.error || 'Ha ocurrido un error inesperado.'
  }
  return 'Ha ocurrido un error inesperado.'
}