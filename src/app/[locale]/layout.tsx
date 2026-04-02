import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Geist } from 'next/font/google'
import { routing } from '@/i18n/routing'
import Sidebar from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return {
    title: `ToolShare — ${t('hero.title')}`,
    description: t('hero.subtitle'),
  }
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
    <html lang={locale} className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <div className="flex min-h-screen">
              <Sidebar user={user} locale={locale} />
              <div className="flex flex-1 flex-col min-w-0 bg-[#fafaf5]">
                <main id="main-content" className="flex-1 pt-14 md:pt-0">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
