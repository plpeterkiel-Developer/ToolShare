import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import type { ToolWithOwner, ToolAvailability } from '@/types/database.types'

interface ToolCardProps {
  tool: ToolWithOwner
  locale: string
}

function availabilityBadge(availability: ToolAvailability): {
  variant: 'green' | 'yellow' | 'gray'
  label: string
} {
  switch (availability) {
    case 'available':
      return { variant: 'green', label: 'Available' }
    case 'on_loan':
      return { variant: 'yellow', label: 'On Loan' }
    case 'unavailable':
    default:
      return { variant: 'gray', label: 'Unavailable' }
  }
}

export function ToolCard({ tool, locale }: ToolCardProps) {
  const badge = availabilityBadge(tool.availability)

  return (
    <Link
      href={`/${locale}/tools/${tool.id}`}
      data-testid="tool-card"
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {tool.image_url ? (
          <Image
            src={tool.image_url}
            alt={tool.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            data-testid="tool-name"
            className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-green-700"
          >
            {tool.name}
          </h3>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <p className="text-xs text-gray-500">{tool.category}</p>
        {tool.owner && (
          <p className="mt-auto text-xs text-gray-400 truncate">
            {tool.owner.display_name}
            {tool.owner.location ? ` · ${tool.owner.location}` : ''}
          </p>
        )}
      </div>
    </Link>
  )
}
