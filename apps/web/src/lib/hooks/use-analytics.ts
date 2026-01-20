import { useQuery } from "@tanstack/react-query"
import { analyticsService } from "../api/analytics.service"

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.getOverview().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAnalyticsTrends(days = 30) {
  return useQuery({
    queryKey: ["analytics", "trends", days],
    queryFn: () => analyticsService.getTrends(days).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductivityByDay() {
  return useQuery({
    queryKey: ["analytics", "productivity-by-day"],
    queryFn: () => analyticsService.getProductivityByDay().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}
