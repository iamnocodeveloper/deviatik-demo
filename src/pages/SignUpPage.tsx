import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

type Stage = 'register' | 'verify'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, verify, resendVerification, user, loading } = useAuth()
  const toast = useToast()

  const [stage, setStage] = useState<Stage>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    navigate('/', { replace: true })
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error, requireEmailVerification } = await signUp(
      email.trim(),
      password,
      name.trim() || undefined,
    )
    setSubmitting(false)
    if (error) {
      toast.show(error, 'error')
      return
    }
    if (requireEmailVerification) {
      setStage('verify')
      toast.show('Te enviamos un código a tu correo.', 'info')
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await verify(email.trim(), otp.trim())
    setSubmitting(false)
    if (error) {
      toast.show(error, 'error')
      return
    }
    navigate('/', { replace: true })
  }

  const handleResend = async () => {
    const { error } = await resendVerification(email.trim())
    if (error) toast.show(error, 'error')
    else toast.show('Código reenviado.', 'success')
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
            Empieza hoy tu próximo hábito.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Crea una cuenta gratuita, define tus hábitos y deja que la constancia
            haga el resto.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">Gratis</p>
            <p className="text-white/70">Sin tarjeta</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">Seguro</p>
            <p className="text-white/70">RLS por usuario</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-lg font-semibold">Rápido</p>
            <p className="text-white/70">Listo en 1 min</p>
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

          {stage === 'register' ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Crea tu cuenta</h2>
              <p className="mt-1 text-sm text-slate-500">Solo necesitas tu correo.</p>
              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
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
                  <Label htmlFor="password" hint="Mínimo 6 caracteres">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" loading={submitting}>
                  Crear cuenta
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Verifica tu correo</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ingresa el código de 6 dígitos que enviamos a{' '}
                <span className="font-medium text-slate-700">{email}</span>.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleVerify}>
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Código de verificación</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoComplete="one-time-code"
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </div>
                <Button type="submit" className="w-full" loading={submitting}>
                  Verificar y entrar
                </Button>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    className="hover:text-slate-700"
                    onClick={() => setStage('register')}
                  >
                    ← Cambiar correo
                  </button>
                  <button
                    type="button"
                    className="font-medium text-brand-600 hover:text-brand-700"
                    onClick={handleResend}
                  >
                    Reenviar código
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/sign-in" className="font-medium text-brand-600 hover:text-brand-700">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}