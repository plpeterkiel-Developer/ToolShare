import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  const environment = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  const timestamp = new Date().toISOString()

  let dbStatus: 'ok' | 'error' = 'error'
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.from('profiles').select('id').limit(1)
      dbStatus = error ? 'error' : 'ok'
    }
  } catch {
    dbStatus = 'error'
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded'
  const statusCode = status === 'ok' ? 200 : 503

  return NextResponse.json(
    {
      status,
      environment,
      version: process.env.npm_package_version || '0.1.0',
      timestamp,
      checks: {
        database: dbStatus,
      },
    },
    { status: statusCode }
  )
}
