import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityCreationDeniedProps {
  requesterName: string
  requestedName: string
  reason?: string | null
}

export function CommunityCreationDeniedEmail({
  requesterName,
  requestedName,
  reason,
}: CommunityCreationDeniedProps) {
  return (
    <EmailLayout
      title="Community request update"
      headline="Community Request Update"
      headerColor="#dc2626"
      footerNote="You received this email because you requested a new community on ToolShare."
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{requesterName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        Your request to create the community <strong>{requestedName}</strong> was not approved at
        this time.
      </p>
      {reason ? (
        <div style={emailStyles.infoBox}>
          <span style={emailStyles.label}>Reason</span>
          <p style={{ ...emailStyles.value, whiteSpace: 'pre-wrap' }}>{reason}</p>
        </div>
      ) : null}
      <p style={emailStyles.paragraphSpaced}>
        You can search for an existing community or submit a different request.
      </p>
    </EmailLayout>
  )
}

export default CommunityCreationDeniedEmail
