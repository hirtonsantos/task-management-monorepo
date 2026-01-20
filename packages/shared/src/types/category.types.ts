export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  userId: string
  tasksCount?: number
  createdAt: Date
  updatedAt: Date
}
