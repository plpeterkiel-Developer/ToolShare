export const TOOL_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Gardening',
  'Measuring',
  'Cleaning',
  'Automotive',
  'Other',
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export const TOOL_CONDITIONS = [
  { value: 'good', labelKey: 'tools.condition.good' },
  { value: 'fair', labelKey: 'tools.condition.fair' },
  { value: 'worn', labelKey: 'tools.condition.worn' },
] as const

export const TOOL_AVAILABILITIES = ['available', 'on_loan', 'unavailable'] as const

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'denied',
  'cancelled',
  'returned',
  'overdue',
] as const

export const LOCALES = ['da', 'en'] as const
export const DEFAULT_LOCALE = 'da' as const

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
