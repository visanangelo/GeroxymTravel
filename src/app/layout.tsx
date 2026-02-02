import type React from "react"
import type { Metadata } from "next"
import { Syne, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ToasterPortal } from "@/components/ToasterPortal"
import "./globals.css"
import { Suspense } from "react"

/** Premium display font – Marcelo Design X style: bold sans, cinematic headlines */
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Geroxym Travel - Călătorește cu Confort și Siguranță",
  description: "Companie de transport și turism din Drobeta-Turnu Severin. Descoperă lumea într-un mod nou.",
  keywords: ["travel", "călătorii", "destinații", "aventuri", "vacanțe", "transport", "autocare"],
  authors: [{ name: "Geroxym Travel" }],
  openGraph: {
    title: "Geroxym Travel - Călătorește cu Confort și Siguranță",
    description: "Companie de transport și turism din Drobeta-Turnu Severin. Descoperă lumea într-un mod nou.",
    type: "website",
    locale: "ro_RO",
    alternateLocale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ro" className={`${syne.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <ToasterPortal />
        <Analytics />
      </body>
    </html>
  )
}
