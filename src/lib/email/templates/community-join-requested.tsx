import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityJoinRequestedProps {
  adminName: string
  communityName: string
  requesterName: string
  requesterEmail: string
  message?: string | null
  adminUrl: string
}

export function CommunityJoinRequestedEmail({
  adminName,
  communityName,
  requesterName,
  requesterEmail,
  message,
  adminUrl,
}: CommunityJoinRequestedProps) {
  return (
    <EmailLayout
      title={`New join request – ${communityName}`}
      headline="New Join Request"
      footerNote={`You received this email because you are a community admin of ${communityName} on ToolShare.`}
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{adminName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        <strong>{requesterName}</strong> ({requesterEmail}) has requested to join{' '}
        <strong>{communityName}</strong>.
      </p>
      <div style={emailStyles.infoBox}>
        <span style={emailStyles.label}>Requester</span>
        <p style={emailStyles.value}>{requesterName}</p>
        <span style={emailStyles.label}>Email</span>
        <p style={emailStyles.value}>{requesterEmail}</p>
        {message ? (
          <>
            <span style={emailStyles.label}>Message</span>
            <p style={{ ...emailStyles.value, whiteSpace: 'pre-wrap' }}>{message}</p>
          </>
        ) : null}
      </div>
      <a href={adminUrl} style={emailStyles.button}>
        Review Request
      </a>
    </EmailLayout>
  )
}

export default CommunityJoinRequestedEmail
