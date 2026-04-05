import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityCreationApprovedProps {
  requesterName: string
  communityName: string
  communityUrl: string
}

export function CommunityCreationApprovedEmail({
  requesterName,
  communityName,
  communityUrl,
}: CommunityCreationApprovedProps) {
  return (
    <EmailLayout
      title={`Community created – ${communityName}`}
      headline={`${communityName} is live!`}
      footerNote="You received this email because you requested a new community on ToolShare."
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{requesterName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        Your requested community <strong>{communityName}</strong> has been approved and created. You
        have been added as an admin of the community.
      </p>
      <a href={communityUrl} style={emailStyles.button}>
        Open Community
      </a>
    </EmailLayout>
  )
}

export default CommunityCreationApprovedEmail
