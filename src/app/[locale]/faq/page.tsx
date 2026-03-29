import { getTranslations, setRequestLocale } from 'next-intl/server'

interface FaqPageProps {
  params: Promise<{ locale: string }>
}

interface FaqItem {
  question: string
  answer: string
}

function FaqSection({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-stone-200 bg-white transition-colors duration-150 open:border-green-200 open:bg-green-50/30"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-stone-900 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-xl">
              {item.question}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-stone-600 leading-relaxed">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('faq')

  const sections = [
    {
      title: t('gettingStartedTitle'),
      items: [
        { question: t('q1'), answer: t('a1') },
        { question: t('q2'), answer: t('a2') },
        { question: t('q3'), answer: t('a3') },
      ],
    },
    {
      title: t('borrowingTitle'),
      items: [
        { question: t('q4'), answer: t('a4') },
        { question: t('q5'), answer: t('a5') },
        { question: t('q6'), answer: t('a6') },
      ],
    },
    {
      title: t('lendingTitle'),
      items: [
        { question: t('q7'), answer: t('a7') },
        { question: t('q8'), answer: t('a8') },
        { question: t('q9'), answer: t('a9') },
      ],
    },
    {
      title: t('trustTitle'),
      items: [
        { question: t('q10'), answer: t('a10') },
        { question: t('q11'), answer: t('a11') },
        { question: t('q12'), answer: t('a12') },
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t('pageTitle')}</h1>
        <p className="mt-2 text-sm text-stone-600">{t('pageDescription')}</p>
      </div>

      {sections.map((section) => (
        <FaqSection key={section.title} title={section.title} items={section.items} />
      ))}
    </div>
  )
}
