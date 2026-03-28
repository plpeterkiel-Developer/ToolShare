import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import { ToastProvider } from '@/components/ui/Toast'
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
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar user={user} locale={locale} />
          <div className="flex flex-1 flex-col min-w-0 bg-[#fafaf5]">
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer locale={locale} />
          </div>
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  )
}
