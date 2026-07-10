import { createClient } from '@insforge/sdk'

const url = import.meta.env.VITE_INSFORGE_URL
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_INSFORGE_URL o VITE_INSFORGE_ANON_KEY. Revisa tu archivo .env.',
  )
}

export const insforge = createClient({
  baseUrl: url,
  anonKey,
})