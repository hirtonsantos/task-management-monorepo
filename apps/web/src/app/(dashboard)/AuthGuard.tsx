"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
// import { Loader2 } from "lucide-react"

// const Loader = Loader2 as unknown as React.ComponentType<
//   React.SVGProps<SVGSVGElement> & { className?: string }
// >

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isLoading = useAuthStore(s => s.isLoading)
  const hydrated = useAuthStore(s => s._hasHydrated)
  const checkAuth = useAuthStore(s => s.checkAuth)

  useEffect(() => {
    if (!hydrated) return
    checkAuth()
  }, [hydrated, checkAuth])

  useEffect(() => {
    if (!hydrated) return
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [hydrated, isLoading, isAuthenticated, router])

  // // 🔒 SSR-safe: server e client renderizam a MESMA coisa
  // if (!hydrated || isLoading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <Loader className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   )
  // }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
