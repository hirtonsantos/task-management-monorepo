"use client"

import { useTaskStats } from "@/lib/hooks/use-tasks"
import { useAnalyticsTrends } from "@/lib/hooks/use-analytics"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Header } from "@/components/layouts/header"
import { StatsCards } from "@/components/features/tasks/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading: statsLoading } = useTaskStats()
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends(14)

  const chartData = trends?.map((item) => ({
    ...item,
    date: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }))

  return (
    <div className="flex flex-col">
      <Header
        title={`Olá, ${user?.name?.split(" ")[0] || "Usuário"}!`}
        subtitle="Aqui está um resumo das suas tarefas"
      />

      <div className="flex-1 space-y-6 p-6">
        {statsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <StatsCards stats={stats} />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Atividade dos Últimos 14 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Criadas" dot={false} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Concluídas"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
