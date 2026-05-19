import { Inter, Geist } from 'next/font/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import './globals.css'
import { Providers } from './provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${geist.variable} dark`} suppressHydrationWarning>
      <body>
        <Providers>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  )
}