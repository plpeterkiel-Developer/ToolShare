import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface CommunityJoinApprovedProps {
  requesterName: string
  communityName: string
  communityUrl: string
}

export function CommunityJoinApprovedEmail({
  requesterName,
  communityName,
  communityUrl,
}: CommunityJoinApprovedProps) {
  return (
    <EmailLayout
      title={`Welcome to ${communityName}`}
      headline={`Welcome to ${communityName}!`}
      footerNote="You received this email because your ToolShare community join request was approved."
    >
      <p style={emailStyles.paragraph}>
        Hi <strong>{requesterName}</strong>,
      </p>
      <p style={emailStyles.paragraphSpaced}>
        Your request to join <strong>{communityName}</strong> has been approved. You can now browse
        and share tools with everyone in the community.
      </p>
      <a href={communityUrl} style={emailStyles.button}>
        Browse Community Tools
      </a>
    </EmailLayout>
  )
}

export default CommunityJoinApprovedEmail
