import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
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
    <html lang="ro" className={`${poppins.variable} ${inter.variable} dark`}>
      <body className="font-sans antialiased bg-[#111111] text-white">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
