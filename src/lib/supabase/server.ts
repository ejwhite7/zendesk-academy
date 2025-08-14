import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  // Check if we have the required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return a mock client for build time when env vars are not available
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
        getSession: () => Promise.resolve({ data: { session: null }, error: null })
      }
    } as any
  }
  
  return createServerComponentClient<Database>({ cookies })
}

export const createServerActionClient = () => {
  // Check if we have the required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createServerClient()
  }
  
  return createServerComponentClient<Database>({ cookies })
}