import { setRequestLocale } from 'next-intl/server'
import LoginForm from '@/components/auth/LoginForm'

interface LoginPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params
  const { next, error } = await searchParams
  setRequestLocale(locale)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <LoginForm next={next} initialError={error} />
    </div>
  )
}
