import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface AuthMagicLinkProps {
  magicLinkUrl: string
}

export function AuthMagicLinkEmail({ magicLinkUrl }: AuthMagicLinkProps) {
  return (
    <EmailLayout
      title="Your login link"
      headline="Login to ToolShare"
      footerNote="You received this email because a login link was requested for your ToolShare account. If you did not request this, you can safely ignore this email."
    >
      <p style={emailStyles.paragraph}>Click the button below to log in to your account.</p>
      <a href={magicLinkUrl} style={emailStyles.button}>
        Log In
      </a>
      <p style={{ ...emailStyles.paragraph, marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </p>
      <p style={{ ...emailStyles.paragraph, fontSize: '13px', wordBreak: 'break-all', color: '#6b7280' }}>
        {magicLinkUrl}
      </p>
    </EmailLayout>
  )
}

export default AuthMagicLinkEmail
