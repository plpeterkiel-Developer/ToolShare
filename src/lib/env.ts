type AppEnv = 'development' | 'test' | 'production'

function getAppEnv(): AppEnv {
  const value = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development'
  if (value === 'development' || value === 'test' || value === 'production') {
    return value
  }
  return 'development'
}

export const APP_ENV = getAppEnv()
export const isDev = APP_ENV === 'development'
export const isTest = APP_ENV === 'test'
export const isProd = APP_ENV === 'production'
