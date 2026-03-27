import { redirect } from 'next/navigation'

// Root page — redirects to the default locale (Danish)
export default function RootPage() {
  redirect('/da')
}
