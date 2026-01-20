"use client"

import { Header } from "@/components/layouts/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsOverview, useAnalyticsTrends, useProductivityByDay } from "@/lib/hooks/use-analytics"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview()
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends(30)
  const { data: productivity, isLoading: productivityLoading } = useProductivityByDay()

  const trendsChartData = trends?.map((item) => ({
    ...item,
    date: format(new Date(item.date), "dd/MM", { locale: ptBR }),
  }))

  const productivityChartData = productivity?.map((item) => ({
    ...item,
    day: DAYS[Number.parseInt(item.day)],
  }))

  const categoriesChartData = overview?.categories?.map((cat, index) => ({
    name: cat.categoryName || "Sem categoria",
    value: cat.count,
    color: COLORS[index % COLORS.length],
  }))

  const isLoading = overviewLoading || trendsLoading || productivityLoading

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Analytics" subtitle="Visualize métricas e insights sobre suas tarefas" />

      <div className="flex-1 space-y-6 p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-green-500">
                {overview?.productivity?.completionRate?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tempo Médio (horas)</p>
              <p className="text-3xl font-bold">{overview?.productivity?.avgCompletionTime?.toFixed(1) || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Esta Semana</p>
              <p className="text-3xl font-bold text-blue-500">{overview?.productivity?.tasksCompletedThisWeek || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Semana Passada</p>
              <p className="text-3xl font-bold">{overview?.productivity?.tasksCompletedLastWeek || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Tarefas (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {trendsChartData && trendsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Criadas"
                      dot={false}
                    />
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
                  Dados insuficientes
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtividade por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              {productivityChartData && productivityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productivityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tarefas Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Dados insuficientes
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesChartData && categoriesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriesChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhuma categoria encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
