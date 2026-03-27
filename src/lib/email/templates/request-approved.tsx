import React from 'react'

interface RequestApprovedProps {
  borrowerName: string
  ownerName: string
  toolName: string
  startDate: string
  endDate: string
  pickupAddress: string
  requestsUrl: string
}

export function RequestApprovedEmail({
  borrowerName,
  ownerName,
  toolName,
  startDate,
  endDate,
  pickupAddress,
  requestsUrl,
}: RequestApprovedProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Request Approved – {toolName}</title>
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
                          Your Request Has Been Approved!
                        </h1>
                        <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                          Hi <strong>{borrowerName}</strong>,
                        </p>
                        <p style={{ margin: '0 0 24px', lineHeight: '1.6' }}>
                          Great news! <strong>{ownerName}</strong> has approved your request to
                          borrow <strong>{toolName}</strong>.
                        </p>

                        {/* Pickup address — prominent */}
                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            backgroundColor: '#f0fdf4',
                            border: '2px solid #16a34a',
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
                                    color: '#15803d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Pickup Address
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: '17px',
                                    fontWeight: 'bold',
                                    color: '#14532d',
                                  }}
                                >
                                  {pickupAddress}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

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
                                      <td style={{ paddingBottom: '8px' }}>
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                          }}
                                        >
                                          Owner
                                        </span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
                                          {ownerName}
                                        </p>
                                      </td>
                                    </tr>
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
                                          Start Date
                                        </span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
                                          {startDate}
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
                                          End Date
                                        </span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
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
                          Please arrange pickup with <strong>{ownerName}</strong> at the address
                          above. Remember to return the tool by <strong>{endDate}</strong>.
                        </p>

                        <a
                          href={requestsUrl}
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
                          You received this email because your borrow request on ToolShare was
                          approved. If you have any issues, please contact the owner directly.
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

export default RequestApprovedEmail
