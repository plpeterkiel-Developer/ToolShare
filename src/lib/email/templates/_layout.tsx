import React from 'react'

interface EmailLayoutProps {
  title: string
  headline: string
  children: React.ReactNode
  footerNote?: string
  headerColor?: string
}

/**
 * Shared wrapper for community-related email templates. Matches the visual
 * style of the existing request-* templates (green header, white card,
 * 600px width, table-based layout for email-client compatibility).
 */
export function EmailLayout({
  title,
  headline,
  children,
  footerNote,
  headerColor = '#16a34a',
}: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body
        style={{
          fontFamily: 'Arial, sans-serif',
          color: '#1a1a1a',
          backgroundColor: '#f5f5f5',
          margin: 0,
          padding: 0,
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: '#f5f5f5', padding: '32px 0' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: headerColor, padding: '24px 32px' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                          }}
                        >
                          ToolShare
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '32px' }}>
                        <h1
                          style={{
                            fontSize: '20px',
                            margin: '0 0 16px',
                            color: headerColor,
                          }}
                        >
                          {headline}
                        </h1>
                        {children}
                      </td>
                    </tr>
                    {footerNote ? (
                      <tr>
                        <td style={{ padding: '16px 32px', borderTop: '1px solid #e5e7eb' }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '12px',
                              color: '#9ca3af',
                              lineHeight: '1.6',
                            }}
                          >
                            {footerNote}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export const emailStyles = {
  paragraph: { margin: '0 0 12px', lineHeight: '1.6' } as React.CSSProperties,
  paragraphSpaced: { margin: '0 0 24px', lineHeight: '1.6' } as React.CSSProperties,
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px 20px',
    marginBottom: '24px',
  } as React.CSSProperties,
  label: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  value: { margin: '2px 0 12px', fontWeight: 'bold' } as React.CSSProperties,
  button: {
    display: 'inline-block',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '15px',
  } as React.CSSProperties,
}
