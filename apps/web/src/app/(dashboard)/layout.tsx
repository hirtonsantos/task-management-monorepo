import { Sidebar } from "@/components/layouts/sidebar";
import { AuthGuard } from "./AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-muted/30">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  )
}
