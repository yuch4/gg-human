import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '人事情報管理システム',
  description: 'グループ企業の人事情報を一元管理するシステムです',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}