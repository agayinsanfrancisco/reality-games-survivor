import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Client for authenticated user requests (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create a client with user's auth token from request
export function createUserClient(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  })
}

// Get user from request
export async function getUser(req: Request) {
  const client = createUserClient(req)
  if (!client) return null

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return null

  return user
}
