import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ToolShare',
  description: 'Community tool sharing platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
