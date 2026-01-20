"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Task, CreateTaskDto } from "@/lib/api/tasks.service"
import type { Category } from "@/lib/api/categories.service"

const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
  dueDate: z.string().min(1, "Data obrigatória"),
  estimatedHours: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  categories: Category[]
  onSubmit: (data: CreateTaskDto) => void
  isLoading?: boolean
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  categories,
  onSubmit,
  isLoading,
}: TaskFormDialogProps) {
  const isEditing = !!task
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      estimatedHours: undefined,
      categoryId: "",
      tags: "",
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority as any,
        status: task.status as any,
        dueDate: format(new Date(task.dueDate), "yyyy-MM-dd"),
        estimatedHours: task.estimatedHours,
        categoryId: task.categoryId || "",
        tags: task.tags?.join(", ") || "",
      })
    } else {
      reset()
    }
    setStep(1)
  }, [task, reset])

  const handleFormSubmit = (data: TaskFormData) => {
    const submitData: CreateTaskDto & { status?: string } = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: new Date(data.dueDate).toISOString(),
      estimatedHours: data.estimatedHours,
      categoryId: data.categoryId || undefined,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    }

    if (isEditing && data.status) {
      submitData.status = data.status
    }

    onSubmit(submitData)
  }

  const priority = watch("priority")
  const status = watch("status")
  const categoryId = watch("categoryId")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Etapa {step} de {totalSteps}
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* STEP 1 — Básico */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setValue("priority", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setValue("status", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          Em Progresso
                        </SelectItem>
                        <SelectItem value="IN_REVIEW">
                          Em Revisão
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          Concluída
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 2 — Planejamento */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    {...register("dueDate")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">
                  Horas Estimadas
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  {...register("estimatedHours", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) =>
                    setValue("categoryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: cat.color,
                            }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 3 — Organização */}
          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="ex: frontend, urgente"
              />
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
            >
              ← Voltar
            </Button>

            {step <= totalSteps ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
              >
                Próximo →
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar"
                  : "Criar"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
