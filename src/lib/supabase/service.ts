import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

/**
 * Creates a Supabase client with service role key.
 * This bypasses RLS and should ONLY be used for trusted server-side operations.
 * 
 * ⚠️ WARNING: Never expose this client to the client-side or use it for user-facing operations.
 * Only use for:
 * - Creating customers (guest checkout)
 * - Admin operations
 * - Webhook handlers
 */
function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  return { url, key }
}

export function createServiceClient() {
  const { url, key } = getServiceEnv()
  return createClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

