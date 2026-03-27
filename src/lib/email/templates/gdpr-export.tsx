import React from 'react'

interface GdprExportProps {
  userName: string
  exportJson: string
}

export function GdprExportEmail({ userName, exportJson }: GdprExportProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Your ToolShare Data Export</title>
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
                        <h1 style={{ fontSize: '20px', margin: '0 0 16px' }}>Your Data Export</h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{userName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          As requested, your personal data export from ToolShare is included below
                          as plain text. This export contains all data we hold about your account in
                          JSON format.
                        </p>

                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '16px 20px' }}>
                                <p
                                  style={{
                                    margin: '0 0 8px',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Data Export (JSON)
                                </p>
                                <pre
                                  style={{
                                    margin: 0,
                                    fontFamily: 'Courier New, Courier, monospace',
                                    fontSize: '12px',
                                    color: '#1a1a1a',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    lineHeight: '1.6',
                                  }}
                                >
                                  {exportJson}
                                </pre>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ margin: '0 0 16px', lineHeight: '1.6' }}>
                          If you have any questions about your data or wish to request deletion,
                          please contact us by replying to this email.
                        </p>
                        <p
                          style={{
                            margin: 0,
                            lineHeight: '1.6',
                            fontSize: '13px',
                            color: '#6b7280',
                          }}
                        >
                          This export was generated in response to a GDPR data access request.
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
                          You received this email because a data export was requested for your
                          ToolShare account. If you did not request this, please contact us
                          immediately.
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

export default GdprExportEmail
