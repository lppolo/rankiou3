import { createClient } from '@supabase/supabase-js'

// Use direct access so Next.js substitutes at build time on the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Configure it in .env.local')
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Configure it in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
