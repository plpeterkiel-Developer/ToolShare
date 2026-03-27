import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'da' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar user={user} locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  )
}
