import React from 'react'
import './globals.css'
import EnvBanner from '../components/EnvBanner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body>
        <EnvBanner />
        <div>
          {children}
        </div>
      </body>
    </html>
  )
}
