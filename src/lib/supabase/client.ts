import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => {
  // Check if we have the required environment variables (client-side)
  if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.warn('Supabase environment variables not configured. Using mock client.')
    // Return a mock client for when env vars are not available
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], count: 0 })
            }),
            single: () => Promise.resolve({ data: null, count: 0 }),
            then: () => Promise.resolve({ data: [], count: 0 })
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], count: 0 })
          }),
          limit: () => Promise.resolve({ data: [], count: 0 }),
          single: () => Promise.resolve({ data: null, count: 0 }),
          then: () => Promise.resolve({ data: [], count: 0 })
        }),
        insert: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } })
      }
    } as any
  }
  
  return createClientComponentClient<Database>()
}