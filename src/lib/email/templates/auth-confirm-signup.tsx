import React from 'react'
import { EmailLayout, emailStyles } from './_layout'

interface AuthConfirmSignupProps {
  confirmUrl: string
}

export function AuthConfirmSignupEmail({ confirmUrl }: AuthConfirmSignupProps) {
  return (
    <EmailLayout
      title="Confirm your email"
      headline="Welcome to ToolShare!"
      footerNote="You received this email because you signed up for a ToolShare account. If you did not sign up, you can safely ignore this email."
    >
      <p style={emailStyles.paragraph}>
        Thanks for signing up! Please confirm your email address by clicking the button below.
      </p>
      <a href={confirmUrl} style={emailStyles.button}>
        Confirm Email
      </a>
      <p style={{ ...emailStyles.paragraph, marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </p>
      <p style={{ ...emailStyles.paragraph, fontSize: '13px', wordBreak: 'break-all', color: '#6b7280' }}>
        {confirmUrl}
      </p>
    </EmailLayout>
  )
}

export default AuthConfirmSignupEmail
