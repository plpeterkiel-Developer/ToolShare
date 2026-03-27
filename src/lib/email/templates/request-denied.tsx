import React from 'react'

interface RequestDeniedProps {
  borrowerName: string
  toolName: string
  reason: string
}

export function RequestDeniedEmail({ borrowerName, toolName, reason }: RequestDeniedProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Request Denied – {toolName}</title>
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
                        <h1 style={{ fontSize: '20px', margin: '0 0 16px', color: '#dc2626' }}>
                          Request Not Approved
                        </h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{borrowerName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          Unfortunately, your request to borrow <strong>{toolName}</strong> was not
                          approved at this time.
                        </p>

                        {reason && (
                          <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              marginBottom: '24px',
                            }}
                          >
                            <tbody>
                              <tr>
                                <td style={{ padding: '20px 24px' }}>
                                  <p
                                    style={{
                                      margin: '0 0 4px',
                                      fontSize: '12px',
                                      color: '#b91c1c',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Reason
                                  </p>
                                  <p style={{ margin: 0, lineHeight: '1.6', color: '#7f1d1d' }}>
                                    {reason}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          You can browse other available tools on ToolShare or reach out to the
                          owner directly if you believe this was a mistake.
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
                          You received this email because your borrow request on ToolShare was
                          reviewed. We hope to help you find the right tool soon.
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

export default RequestDeniedEmail
