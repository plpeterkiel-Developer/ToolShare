import { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarSkeleton } from '@/components/layout/SidebarSkeleton'
import { ToastProvider } from '@/components/ui/Toast'
import { getUser } from '@/lib/supabase/server'

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

  const [messages, user] = await Promise.all([getMessages(), getUser()])

  return (
    <NextIntlClientProvider messages={messages}>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Suspense fallback={<SidebarSkeleton />}>
            <Sidebar user={user} locale={locale} />
          </Suspense>
          <div className="flex flex-1 flex-col min-w-0 bg-[#fafaf5]">
            <main id="main-content" className="flex-1 pt-14 md:pt-0">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  )
}
