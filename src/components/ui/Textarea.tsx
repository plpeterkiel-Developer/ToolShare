import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  id: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        rows={4}
        className={[
          'block w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 resize-y',
          error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
