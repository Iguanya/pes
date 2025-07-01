import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PES Tournament Platform - Kenya's Premier eFootball Competition Hub",
  description:
    "Join Kenya's most competitive PES tournaments. Compete, win prizes, and climb the leaderboards. Powered by Iguanya Labs.",
  keywords: ["PES", "eFootball", "tournament", "Kenya", "gaming", "competition", "prizes"],
  authors: [{ name: "Iguanya Labs" }],
  creator: "Iguanya Labs",
  publisher: "Iguanya Labs",
  openGraph: {
    title: "PES Tournament Platform - Kenya's Premier eFootball Competition Hub",
    description: "Join Kenya's most competitive PES tournaments. Compete, win prizes, and climb the leaderboards.",
    url: "https://pestournament.ke",
    siteName: "PES Tournament Platform",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PES Tournament Platform",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PES Tournament Platform - Kenya's Premier eFootball Competition Hub",
    description: "Join Kenya's most competitive PES tournaments. Compete, win prizes, and climb the leaderboards.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
