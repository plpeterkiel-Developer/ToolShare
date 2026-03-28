import { ToolCard } from '@/components/tools/ToolCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ToolWithOwner } from '@/types/database.types'

interface ToolGridProps {
  tools: ToolWithOwner[]
  locale: string
  emptyTitle?: string
  emptyDescription?: string
}

export function ToolGrid({ tools, locale, emptyTitle, emptyDescription }: ToolGridProps) {
  if (tools.length === 0) {
    return <EmptyState title={emptyTitle ?? ''} description={emptyDescription} />
  }

  return (
    <div data-testid="tool-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} locale={locale} />
      ))}
    </div>
  )
}
