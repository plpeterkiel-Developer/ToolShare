import React from 'react'

interface LoanReturnedProps {
  recipientName: string
  toolName: string
  reviewUrl: string
}

export function LoanReturnedEmail({ recipientName, toolName, reviewUrl }: LoanReturnedProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{toolName} Has Been Returned</title>
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
                      <td style={{ backgroundColor: '#16a34a', padding: '24px 32px' }}>
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
                        <h1 style={{ fontSize: '20px', margin: '0 0 16px', color: '#16a34a' }}>
                          Loan Complete
                        </h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{recipientName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          The loan of <strong>{toolName}</strong> is now complete. We hope
                          everything went well!
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          Please consider sharing your experience by leaving a review.
                        </p>

                        <a
                          href={reviewUrl}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                          }}
                        >
                          Leave a Review
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
                          You received this email because a tool loan you were involved in on
                          ToolShare has been marked as returned.
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

export default LoanReturnedEmail
