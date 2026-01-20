"use client"

import { MoreVertical, Calendar, Tag } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Task } from "@/lib/api/tasks.service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const priorityStyles: Record<string, string> = {
  LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  IN_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ARCHIVED: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Progresso",
  IN_REVIEW: "Em Revisão",
  COMPLETED: "Concluída",
  ARCHIVED: "Arquivada",
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED"
  const isOverdue = !isCompleted && new Date(task.dueDate) < new Date()

  return (
    <Card className={cn("p-4 transition-shadow hover:shadow-md", isOverdue && "border-red-300")}>
      <div className="flex items-start gap-3">
        <Checkbox checked={isCompleted} onCheckedChange={() => onComplete(task.id)} className="mt-1" />

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className={cn("font-semibold", isCompleted && "text-muted-foreground line-through")}>{task.title}</h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={priorityStyles[task.priority]}>{priorityLabels[task.priority]}</Badge>
            <Badge className={statusStyles[task.status]}>{statusLabels[task.status]}</Badge>
            {task.category && (
              <Badge variant="outline" style={{ borderColor: task.category.color }}>
                {task.category.name}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className={cn(isOverdue && "text-red-500 font-medium")}>
                {format(new Date(task.dueDate), "dd 'de' MMM", { locale: ptBR })}
              </span>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>{task.tags.slice(0, 2).join(", ")}</span>
                {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
