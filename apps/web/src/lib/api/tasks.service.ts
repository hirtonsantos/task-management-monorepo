import apiClient from "./client"

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  categoryId?: string
  category?: { id: string; name: string; color: string }
  userId: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  priority?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
  categoryId?: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: string
  actualHours?: number
}

export interface TaskFilters {
  page?: number
  limit?: number
  status?: string[]
  priority?: string[]
  search?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const tasksService = {
  getAll: (filters?: TaskFilters) => apiClient.get<{ data: PaginatedResponse<Task> }>("/tasks", { params: filters }),

  getById: (id: string) => apiClient.get<{ data: Task }>(`/tasks/${id}`),

  create: (data: CreateTaskDto) => apiClient.post<{ data: Task }>("/tasks", data),

  update: (id: string, data: UpdateTaskDto) => apiClient.patch<{ data: Task }>(`/tasks/${id}`, data),

  delete: (id: string) => apiClient.delete(`/tasks/${id}`),

  complete: (id: string) => apiClient.patch<{ data: Task }>(`/tasks/${id}`, { status: "COMPLETED" }),

  getStats: () =>
    apiClient.get<{
      data: {
        total: number
        pending: number
        inProgress: number
        complete: number
        overdue: number
        completionRate: number
      }
    }>("/tasks/stats"),
}
