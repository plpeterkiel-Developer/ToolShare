import React from 'react'

interface LoanOverdueProps {
  recipientName: string
  toolName: string
  endDate: string
  requestsUrl: string
}

export function LoanOverdueEmail({
  recipientName,
  toolName,
  endDate,
  requestsUrl,
}: LoanOverdueProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Loan Overdue – {toolName}</title>
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
                      <td style={{ backgroundColor: '#b45309', padding: '24px 32px' }}>
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
                        <h1 style={{ fontSize: '20px', margin: '0 0 16px', color: '#b45309' }}>
                          Loan Overdue
                        </h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{recipientName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          This is a reminder that the loan for <strong>{toolName}</strong> is now
                          overdue. The agreed return date was <strong>{endDate}</strong>.
                        </p>

                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: '#fffbeb',
                            border: '2px solid #f59e0b',
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
                                            color: '#92400e',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          Tool
                                        </span>
                                        <p
                                          style={{
                                            margin: '2px 0 0',
                                            fontWeight: 'bold',
                                            color: '#78350f',
                                          }}
                                        >
                                          {toolName}
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#92400e',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          Due Date
                                        </span>
                                        <p
                                          style={{
                                            margin: '2px 0 0',
                                            fontWeight: 'bold',
                                            color: '#dc2626',
                                          }}
                                        >
                                          {endDate}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          Please coordinate with the other party to arrange the return of the tool
                          as soon as possible. View the loan details for contact information.
                        </p>

                        <a
                          href={requestsUrl}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#b45309',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                          }}
                        >
                          View Loan Details
                        </a>
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
                          You received this email because a tool loan you are involved in on
                          ToolShare is past its return date. Please resolve this promptly.
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

export default LoanOverdueEmail
