export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
  CANCELLED = "CANCELLED",
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Pendente",
  [TaskStatus.IN_PROGRESS]: "Em Progresso",
  [TaskStatus.IN_REVIEW]: "Em Revisão",
  [TaskStatus.COMPLETED]: "Concluída",
  [TaskStatus.ARCHIVED]: "Arquivada",
  [TaskStatus.CANCELLED]: "Cancelada",
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "#FFA500",
  [TaskStatus.IN_PROGRESS]: "#3B82F6",
  [TaskStatus.IN_REVIEW]: "#8B5CF6",
  [TaskStatus.COMPLETED]: "#22C55E",
  [TaskStatus.ARCHIVED]: "#6B7280",
  [TaskStatus.CANCELLED]: "#EF4444",
}
