export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export const PriorityLabels: Record<Priority, string> = {
  [Priority.LOW]: "Baixa",
  [Priority.MEDIUM]: "Média",
  [Priority.HIGH]: "Alta",
  [Priority.URGENT]: "Urgente",
}

export const PriorityColors: Record<Priority, string> = {
  [Priority.LOW]: "#22C55E",
  [Priority.MEDIUM]: "#3B82F6",
  [Priority.HIGH]: "#F59E0B",
  [Priority.URGENT]: "#EF4444",
}

export const PriorityOrder: Record<Priority, number> = {
  [Priority.LOW]: 1,
  [Priority.MEDIUM]: 2,
  [Priority.HIGH]: 3,
  [Priority.URGENT]: 4,
}
