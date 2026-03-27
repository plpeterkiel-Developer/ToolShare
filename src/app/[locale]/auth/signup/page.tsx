import { setRequestLocale } from 'next-intl/server'
import SignUpForm from '@/components/auth/SignUpForm'

interface SignUpPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SignUpForm />
    </div>
  )
}
