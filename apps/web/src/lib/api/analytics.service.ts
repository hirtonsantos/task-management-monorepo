import apiClient from "./client"

export interface AnalyticsOverview {
  tasks: {
    total: number
    completed: number
    pending: number
    inProgress: number
    overdue: number
  }
  productivity: {
    completionRate: number
    avgCompletionTime: number
    tasksCompletedThisWeek: number
    tasksCompletedLastWeek: number
  }
  categories: {
    categoryId: string
    categoryName: string
    count: number
  }[]
}

export interface TrendData {
  date: string
  created: number
  completed: number
}

export const analyticsService = {
  getOverview: () => apiClient.get<{ data: AnalyticsOverview }>("/analytics/overview"),

  getTrends: (days?: number) =>
    apiClient.get<{ data: TrendData[] }>("/analytics/trends", {
      params: { days },
    }),

  getProductivityByDay: () =>
    apiClient.get<{ data: { day: string; count: number }[] }>("/analytics/productivity-by-day"),
}
