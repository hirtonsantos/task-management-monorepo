import apiClient from "./client"

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  color?: string
}

export const categoriesService = {
  getAll: () => apiClient.get<{ data: Category[] }>("/categories"),

  getById: (id: string) => apiClient.get<{ data: Category }>(`/categories/${id}`),

  create: (data: CreateCategoryDto) => apiClient.post<{ data: Category }>("/categories", data),

  update: (id: string, data: Partial<CreateCategoryDto>) =>
    apiClient.patch<{ data: Category }>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`),
}
