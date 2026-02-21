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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!isValidSupabaseUrl(supabaseUrl) || isUnsafeSupabaseKey(supabaseAnonKey)) {
  throw new Error('Konfigurasi Supabase belum benar. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terisi (ANON, bukan SERVICE_ROLE).')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

