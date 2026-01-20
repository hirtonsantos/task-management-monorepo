import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "@/styles/globals.css"
import { ClientOnly } from "./clientOnly"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskApp - Gestão de Tarefas",
  description: "Sistema de gestão de tarefas empresarial",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientOnly>
          <Providers>
            {children}
          </Providers>
        </ClientOnly>
      </body>
    </html>
  )
}
