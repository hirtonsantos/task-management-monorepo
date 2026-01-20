"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Header } from "@/components/layouts/header"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/features/tasks/task-card"
import { TaskFilters } from "@/components/features/tasks/task-filters"
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog"
import { StatsCards } from "@/components/features/tasks/stats-cards"
import {
  useTasks,
  useTaskStats,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
} from "@/lib/hooks/use-tasks"
import { useCategories } from "@/lib/hooks/use-categories"
import type { Task, TaskFilters as TaskFiltersType, CreateTaskDto } from "@/lib/api/tasks.service"

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersType>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { data: tasksData, isLoading: tasksLoading } = useTasks(filters)
  const { data: stats } = useTaskStats()
  const { data: categories = [] } = useCategories()

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const completeTask = useCompleteTask()

  const handleOpenDialog = (task?: Task) => {
    setEditingTask(task || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTask(null)
  }

  const handleSubmit = (data: CreateTaskDto) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data }, { onSuccess: handleCloseDialog })
    } else {
      createTask.mutate(data, { onSuccess: handleCloseDialog })
    }
  }

  const handleComplete = (id: string) => {
    completeTask.mutate(id)
  }

  const handleDelete = (id: string) => {
    deleteTask.mutate(id)
  }

  return (
    <div className="flex flex-col">
      <Header title="Tarefas" subtitle="Gerencie suas tarefas" />

      <div className="flex-1 space-y-6 p-6">
        {stats && <StatsCards stats={stats} />}

        <div className="flex items-center justify-between">
          <TaskFilters filters={filters} onChange={setFilters} />
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {tasksLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasksData && tasksData.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasksData.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <p>Nenhuma tarefa encontrada</p>
            <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2">
              Criar sua primeira tarefa
            </Button>
          </div>
        )}

        {tasksData?.meta && tasksData.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksData.meta.hasPrev}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {tasksData.meta.page} de {tasksData.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!tasksData.meta.hasNext}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <TaskFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        task={editingTask}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={createTask.isPending || updateTask.isPending}
      />
    </div>
  )
}