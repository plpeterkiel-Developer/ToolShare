import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface AuthResetPasswordProps {
  resetUrl: string
}

export function AuthResetPasswordEmail({ resetUrl }: AuthResetPasswordProps) {
  return (
    <EmailLayout
      title="Reset your password"
      headline="Reset your password"
      footerNote="You received this email because a password reset was requested for your ToolShare account. If you did not request this, you can safely ignore this email."
    >
      <p style={emailStyles.paragraph}>
        Click the button below to reset your password.
      </p>
      <a href={resetUrl} style={emailStyles.button}>
        Reset Password
      </a>
      <p style={{ ...emailStyles.paragraph, marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </p>
      <p style={{ ...emailStyles.paragraph, fontSize: '13px', wordBreak: 'break-all', color: '#6b7280' }}>
        {resetUrl}
      </p>
    </EmailLayout>
  )
}

export default AuthResetPasswordEmail
