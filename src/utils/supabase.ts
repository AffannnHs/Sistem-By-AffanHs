import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function isValidSupabaseUrl(value: string | undefined) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

function isUnsafeSupabaseKey(value: string | undefined) {
  if (!value) return true
  return value.startsWith('sb_secret_')
}

export const hasSupabaseEnv = isValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL) && !isUnsafeSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null

