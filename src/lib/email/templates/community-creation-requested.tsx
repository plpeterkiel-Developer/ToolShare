import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityCreationRequestedProps {
  adminName: string
  requesterName: string
  requesterEmail: string
  requestedName: string
  description?: string | null
  address?: string | null
  adminUrl: string
}

export function CommunityCreationRequestedEmail({
  adminName,
  requesterName,
  requesterEmail,
  requestedName,
  description,
  address,
  adminUrl,
}: CommunityCreationRequestedProps) {
  return (
    <EmailLayout
      title="New community request"
      headline="New Community Request"
      footerNote="You received this email because you are a super admin of ToolShare."
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{adminName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        <strong>{requesterName}</strong> ({requesterEmail}) has requested the creation of a new
        community.
      </p>
      <div style={emailStyles.infoBox}>
        <span style={emailStyles.label}>Requested Name</span>
        <p style={emailStyles.value}>{requestedName}</p>
        {description ? (
          <>
            <span style={emailStyles.label}>Description</span>
            <p style={{ ...emailStyles.value, whiteSpace: 'pre-wrap' }}>{description}</p>
          </>
        ) : null}
        {address ? (
          <>
            <span style={emailStyles.label}>Address</span>
            <p style={emailStyles.value}>{address}</p>
          </>
        ) : null}
        <span style={emailStyles.label}>Requested By</span>
        <p style={emailStyles.value}>
          {requesterName} &lt;{requesterEmail}&gt;
        </p>
      </div>
      <a href={adminUrl} style={emailStyles.button}>
        Review Request
      </a>
    </EmailLayout>
  )
}

export default CommunityCreationRequestedEmail
