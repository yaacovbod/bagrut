import { ClerkProvider } from '@clerk/nextjs'
import { Rubik } from 'next/font/google'
import './globals.css'

const rubik = Rubik({ subsets: ['latin', 'hebrew'], weight: ['400', '500', '700'] })

export const metadata = {
  title: 'דשבורד הכנה לבגרות בהיסטוריה',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="he" dir="rtl">
        <body className={rubik.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
