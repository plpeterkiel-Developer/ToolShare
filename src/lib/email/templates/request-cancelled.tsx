import React from 'react'

interface RequestCancelledProps {
  ownerName: string
  borrowerName: string
  toolName: string
}

export function RequestCancelledEmail({
  ownerName,
  borrowerName,
  toolName,
}: RequestCancelledProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Request Cancelled – {toolName}</title>
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
                      <td style={{ backgroundColor: '#2563eb', padding: '24px 32px' }}>
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
                        <h1 style={{ fontSize: '20px', margin: '0 0 16px' }}>
                          Borrow Request Cancelled
                        </h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{ownerName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          <strong>{borrowerName}</strong> has cancelled their request to borrow your{' '}
                          <strong>{toolName}</strong>. No further action is required on your part.
                        </p>

                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 24px' }}>
                                <table width="100%" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td style={{ paddingBottom: '8px' }}>
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                          }}
                                        >
                                          Tool
                                        </span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
                                          {toolName}
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                          }}
                                        >
                                          Cancelled By
                                        </span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
                                          {borrowerName}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ margin: 0, lineHeight: '1.6' }}>
                          Your tool is now available for other requests. Thank you for using
                          ToolShare!
                        </p>
                      </td>
                    </tr>
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
                          You received this email because a borrow request for one of your tools on
                          ToolShare was cancelled.
                        </p>
                      </td>
                    </tr>
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

export default RequestCancelledEmail
