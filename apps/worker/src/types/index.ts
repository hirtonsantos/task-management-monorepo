export interface TaskNotification {
  type: "high_priority" | "due_soon" | "overdue" | "completed" | "assigned"
  task: {
    id: string
    title: string
    priority: string
    userId: string
    dueDate?: Date
    assigneeId?: string
  }
  timestamp: Date
  metadata?: Record<string, unknown>
}
