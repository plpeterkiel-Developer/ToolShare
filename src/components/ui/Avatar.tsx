import Image from 'next/image'

export interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<
  NonNullable<AvatarProps['size']>,
  { px: number; className: string; text: string }
> = {
  sm: { px: 32, className: 'h-8 w-8', text: 'text-xs' },
  md: { px: 40, className: 'h-10 w-10', text: 'text-sm' },
  lg: { px: 56, className: 'h-14 w-14', text: 'text-lg' },
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  const { px, className, text } = sizeMap[size]
  const initials = getInitials(name)

  if (avatarUrl) {
    return (
      <div className={['relative rounded-full overflow-hidden shrink-0', className].join(' ')}>
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      aria-label={name}
      className={[
        'inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold shrink-0 select-none',
        className,
        text,
      ].join(' ')}
    >
      {initials}
    </div>
  )
}
