import type { ReactNode } from 'react'
import { Card, CardBody } from '../ui/Card'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ReactNode
  tone?: 'brand' | 'success' | 'warn'
}

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-emerald-50 text-emerald-600',
  warn: 'bg-amber-50 text-amber-600',
} as const

export function StatCard({ label, value, hint, icon, tone = 'brand' }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold leading-tight text-slate-900">{value}</p>
          {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
        </div>
      </CardBody>
    </Card>
  )
}