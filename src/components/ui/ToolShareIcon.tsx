interface ToolShareIconProps {
  size?: number
  className?: string
  variant?: 'circle' | 'rounded'
}

export function ToolShareIcon({
  size = 40,
  className = '',
  variant = 'circle',
}: ToolShareIconProps) {
  if (variant === 'rounded') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="none"
        width={size}
        height={size}
        className={className}
        aria-label="ToolShare"
        role="img"
      >
        <rect x="16" y="16" width="480" height="480" rx="96" fill="#166534" />
        <g transform="translate(256,256)">
          <path
            d="M0,-140 C-50,-140 -80,-100 -80,-50 C-80,10 -40,60 0,80 C40,60 80,10 80,-50 C80,-100 50,-140 0,-140Z"
            fill="white"
            opacity="0.95"
          />
          <rect x="-10" y="60" width="20" height="100" rx="4" fill="white" opacity="0.9" />
          <rect x="-36" y="152" width="72" height="20" rx="10" fill="white" opacity="0.9" />
        </g>
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="ToolShare"
      role="img"
    >
      <defs>
        <linearGradient id="toolshare-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="256" fill="url(#toolshare-bg)" />
      <g transform="translate(256,220) rotate(-30)">
        <path
          d="M-20,-80 L-30,-60 L-10,-40 L10,-40 L30,-60 L20,-80 L10,-70 C4,-64 -4,-64 -10,-70 Z"
          fill="white"
        />
        <rect x="-10" y="-44" width="20" height="140" rx="6" fill="white" />
        <path
          d="M-20,96 L-30,116 L-10,136 L10,136 L30,116 L20,96 L10,106 C4,112 -4,112 -10,106 Z"
          fill="white"
        />
      </g>
      <path
        d="M320 120 A140 140 0 0 1 400 256"
        stroke="white"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <polygon points="395,250 415,270 385,270" fill="white" opacity="0.75" />
      <path
        d="M192 392 A140 140 0 0 1 112 256"
        stroke="white"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <polygon points="117,262 97,242 127,242" fill="white" opacity="0.75" />
    </svg>
  )
}
