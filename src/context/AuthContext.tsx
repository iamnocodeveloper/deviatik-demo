import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { insforge } from '../lib/insforge'
import { getErrorMessage } from '../lib/utils'

export interface AuthUser {
  id: string
  email: string
  profile?: { name?: string; avatar_url?: string }
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{
    error?: string
    requireEmailVerification?: boolean
  }>
  verify: (email: string, otp: string) => Promise<{ error?: string }>
  resendVerification: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const { data, error } = await insforge.auth.getCurrentUser()
      if (cancelled) return
      if (error || !data?.user) {
        setUser(null)
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email,
          profile: data.user.profile ?? undefined,
        })
      }
      setLoading(false)
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password })
      if (error) return { error: getErrorMessage(error) }
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          profile: data.user.profile ?? undefined,
        })
      }
      return {}
    } catch (e) {
      return { error: getErrorMessage(e) }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
      })
      if (error) return { error: getErrorMessage(error) }
      if (data?.requireEmailVerification) {
        return { requireEmailVerification: true }
      }
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          profile: data.user.profile ?? undefined,
        })
      }
      return {}
    } catch (e) {
      return { error: getErrorMessage(e) }
    }
  }, [])

  const verify = useCallback(async (email: string, otp: string) => {
    try {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp })
      if (error) return { error: getErrorMessage(error) }
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          profile: data.user.profile ?? undefined,
        })
      }
      return {}
    } catch (e) {
      return { error: getErrorMessage(e) }
    }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    try {
      const { error } = await insforge.auth.resendVerificationEmail({ email })
      if (error) return { error: getErrorMessage(error) }
      return {}
    } catch (e) {
      return { error: getErrorMessage(e) }
    }
  }, [])

  const signOut = useCallback(async () => {
    await insforge.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, verify, resendVerification, signOut }),
    [user, loading, signIn, signUp, verify, resendVerification, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}