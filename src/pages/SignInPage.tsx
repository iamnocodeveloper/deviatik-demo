import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function SignInPage() {
  const navigate = useNavigate()
  const { signIn, user, loading } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    navigate('/', { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (error) {
      toast.show(error, 'error')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold tracking-wide">Hábitos</p>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Construye mejores rutinas, un día a la vez.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Lleva el seguimiento de tus hábitos diarios y semanales, visualiza tu racha
            y celebra tu consistencia.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">30d</p>
            <p className="text-white/70">Historial</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">Rachas</p>
            <p className="text-white/70">Visualizadas</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">Privado</p>
            <p className="text-white/70">Tus datos</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">Hábitos</p>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Inicia sesión</h2>
          <p className="mt-1 text-sm text-slate-500">
            Continúa desde donde lo dejaste.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="[email protected]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" loading={submitting}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/sign-up" className="font-medium text-brand-600 hover:text-brand-700">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}