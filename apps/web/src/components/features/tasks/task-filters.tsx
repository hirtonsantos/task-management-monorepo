"use client"

import { Search, X, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TaskFilters as TaskFiltersType } from "@/lib/api/tasks.service"

interface TaskFiltersProps {
  filters: TaskFiltersType
  onChange: (filters: TaskFiltersType) => void
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const hasActiveFilters = filters.search || filters.status?.length || filters.priority?.length

  const clearFilters = () => {
    onChange({ page: 1, limit: filters.limit })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="pl-9"
          />
        </div>

        <Select
          value={(filters.status || filters.status?.[0]) || "all"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value === "all" ? undefined : value as unknown as string[],
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
            <SelectItem value="IN_REVIEW">Em Revisão</SelectItem>
            <SelectItem value="COMPLETED">Concluída</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={(filters.priority || filters.priority?.[0]) || "all"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              priority: value === "all" ? undefined : value as unknown as string[],
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="LOW">Baixa</SelectItem>
            <SelectItem value="MEDIUM">Média</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => onChange({ ...filters, sortBy: value, page: 1 })}
        >
          <SelectTrigger className="w-[160px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Data de Criação</SelectItem>
            <SelectItem value="dueDate">Data de Vencimento</SelectItem>
            <SelectItem value="priority">Prioridade</SelectItem>
            <SelectItem value="title">Título</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
