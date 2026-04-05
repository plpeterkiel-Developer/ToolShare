import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityJoinDeniedProps {
  requesterName: string
  communityName: string
  reason?: string | null
}

export function CommunityJoinDeniedEmail({
  requesterName,
  communityName,
  reason,
}: CommunityJoinDeniedProps) {
  return (
    <EmailLayout
      title={`Join request – ${communityName}`}
      headline="Join Request Update"
      headerColor="#dc2626"
      footerNote="You received this email because of a ToolShare community join request."
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{requesterName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        Your request to join <strong>{communityName}</strong> was not approved at this time.
      </p>
      {reason ? (
        <div style={emailStyles.infoBox}>
          <span style={emailStyles.label}>Reason</span>
          <p style={{ ...emailStyles.value, whiteSpace: 'pre-wrap' }}>{reason}</p>
        </div>
      ) : null}
      <p style={emailStyles.paragraphSpaced}>
        You can search for other communities or request a new one on ToolShare.
      </p>
    </EmailLayout>
  )
}

export default CommunityJoinDeniedEmail
