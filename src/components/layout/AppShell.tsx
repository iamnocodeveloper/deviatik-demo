import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { CalendarCheck, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { cn, getErrorMessage } from '../../lib/utils'
import { todayLabel } from '../../lib/date'
import { useToast } from '../../context/ToastContext'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/sign-in', { replace: true })
    } catch (e) {
      toast.show(getErrorMessage(e), 'error')
    }
  }

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Hábitos</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Habit Tracker</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Hábitos
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs text-slate-500 md:hidden">Hábitos</p>
            <p className="hidden text-sm font-medium capitalize text-slate-700 md:block">
              {todayLabel()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-xs font-medium text-slate-700">
                {user?.profile?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {(user?.profile?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}