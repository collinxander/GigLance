import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GigLance - Turn Your Skills Into Paychecks",
  description: "Get Found, Get Hired, Get Paid. Connect with freelance gigs and side jobs that match your skills and schedule.",
  keywords: ["freelance", "gigs", "jobs", "remote work", "side hustle", "freelancer", "hiring", "talent"],
  authors: [{ name: "GigLance Team" }],
  creator: "GigLance",
  publisher: "GigLance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://giglance.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://giglance.com",
    title: "GigLance - Turn Your Skills Into Paychecks",
    description: "Get Found, Get Hired, Get Paid. Connect with freelance gigs and side jobs that match your skills and schedule.",
    siteName: "GigLance",
  },
  twitter: {
    card: "summary_large_image",
    title: "GigLance - Turn Your Skills Into Paychecks",
    description: "Get Found, Get Hired, Get Paid. Connect with freelance gigs and side jobs that match your skills and schedule.",
    creator: "@giglance",
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
    google: "your-google-site-verification",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}