import type { Metadata } from 'next'
import './globals.css'
import AgentWidget from '@/components/AgentWidget';

export const metadata: Metadata = {
  title: 'FoundHer Grants — Find & Win Business Grants',
  description: 'The only grant platform built exclusively for women-owned and Indigenous-owned businesses. Find grants, track deadlines, and let AI write your applications.',
  keywords: 'grants for women business owners, Indigenous business grants, WOSB grants, tribal business grants, women entrepreneur funding',
  openGraph: {
    title: 'FoundHer Grants',
    description: 'Find and win grants built for founders like you.',
    type: 'website',
    url: 'https://foundher.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}      <AgentWidget />
    </body>
    </html>
  )
}
