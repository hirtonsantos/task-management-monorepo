"use client"

import { CheckCircle2, Clock, AlertTriangle, TrendingUp, ListTodo, PlayCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    complete: number
    overdue: number
    completionRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: "Total de Tarefas",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Em Progresso",
      value: stats.inProgress,
      icon: PlayCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Concluídas",
      value: stats.complete,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Atrasadas",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  console.log(stats.completionRate)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        {items.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2 ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-green-500/10 p-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium">Taxa de Conclusão</p>
              <p className="text-sm font-bold">{stats.completionRate.toFixed(2)}%</p>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
