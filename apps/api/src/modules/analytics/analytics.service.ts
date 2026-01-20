/* eslint-disable */
import { Injectable } from "@nestjs/common"
import { type Repository, In, LessThan, Between } from "typeorm"
import { Task } from "@task-app/database"
import { TaskStatus } from "@task-app/shared"
import { CacheService } from "../cache/cache.service"
import { InjectRepository } from "@nestjs/typeorm"

export interface AnalyticsOverview {
  totalTasks: number
  completedTasks: number
  completedToday: number
  completedThisWeek: number
  completedThisMonth: number
  pendingTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  overdueRate: number
  avgCompletionTimeHours: number
  productivityScore: number
}

export interface TrendData {
  date: string
  created: number
  completed: number
}

export interface Distribution {
  label: string
  value: number
  percentage: number
}

export interface DistributionsResult {
  byStatus: Distribution[]
  byPriority: Distribution[]
}

const CACHE_TTL = 900000 // 15 minutes

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    private readonly cacheService: CacheService,
  ) { }

  async getOverview(userId: string): Promise<AnalyticsOverview> {
    const cacheKey = this.cacheService.generateAnalyticsKey(userId, "overview")

    const cached = await this.cacheService.get<AnalyticsOverview>(cacheKey)
    if (cached) return cached

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const baseWhere = { userId, deletedAt: undefined }

    const [
      totalTasks,
      completedTasks,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
    ] = await Promise.all([
      this.taskRepo.count({ where: baseWhere }),
      this.taskRepo.count({ where: { ...baseWhere, status: TaskStatus.COMPLETED } }),
      this.taskRepo.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: Between(todayStart, now),
        },
      }),
      this.taskRepo.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: Between(weekAgo, now),
        },
      }),
      this.taskRepo.count({
        where: {
          ...baseWhere,
          status: TaskStatus.COMPLETED,
          completedAt: Between(monthAgo, now),
        },
      }),
      this.taskRepo.count({ where: { ...baseWhere, status: TaskStatus.PENDING } }),
      this.taskRepo.count({ where: { ...baseWhere, status: TaskStatus.IN_PROGRESS } }),
      this.taskRepo.count({
        where: {
          userId,
          deletedAt: undefined,
          status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
          dueDate: LessThan(now),
        },
      }),
    ])

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0

    const avgCompletionTimeHours = await this.calculateAvgCompletionTime(userId)
    const productivityScore = this.calculateProductivityScore({
      completionRate,
      overdueRate,
      completedThisWeek,
      avgCompletionTimeHours,
    })

    const result: AnalyticsOverview = {
      totalTasks,
      completedTasks,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      overdueRate: Math.round(overdueRate * 100) / 100,
      avgCompletionTimeHours,
      productivityScore,
    }

    await this.cacheService.set(cacheKey, result, CACHE_TTL)

    return result
  }

  async getTrends(userId: string, days = 30): Promise<TrendData[]> {
    const cacheKey = this.cacheService.generateAnalyticsKey(userId, `trends-${days}`)

    const cached = await this.cacheService.get<TrendData[]>(cacheKey)
    if (cached) return cached

    console.log(`Calculating trends for user ${userId} over last ${days} days`)

    const result = await this.taskRepo
      .createQueryBuilder("task")
      .select("DATE(task.createdAt)", "date")
      .addSelect("COUNT(*)", "created")
      .addSelect(`SUM(CASE WHEN task.status = '${TaskStatus.COMPLETED}' THEN 1 ELSE 0 END)`, "completed")
      .where("task.userId = :userId", { userId })
      .andWhere("task.deletedAt IS NULL")
      .andWhere("task.createdAt >= CURRENT_DATE - :days::int", { days })
      .groupBy("DATE(task.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany()

    const trends: TrendData[] = result.map((row) => ({
      date: row.date,
      created: Number(row.created),
      completed: Number(row.completed),
    }))

    await this.cacheService.set(cacheKey, trends, CACHE_TTL)

    return trends
  }

  async getDistributions(userId: string): Promise<DistributionsResult> {
    const cacheKey = this.cacheService.generateAnalyticsKey(userId, "distributions")

    const cached = await this.cacheService.get<DistributionsResult>(cacheKey)
    if (cached) return cached

    const [byStatus, byPriority] = await Promise.all([
      this.getDistributionByField(userId, "status"),
      this.getDistributionByField(userId, "priority"),
    ])

    const result = { byStatus, byPriority }

    await this.cacheService.set(cacheKey, result, CACHE_TTL)

    return result
  }

  async getProductivityByDay(userId: string): Promise<{ dayOfWeek: string; tasks: number }[]> {
    const cacheKey = this.cacheService.generateAnalyticsKey(userId, "productivity-day")

    const cached = await this.cacheService.get<{ dayOfWeek: string; tasks: number }[]>(cacheKey)
    if (cached) return cached

    const result = await this.taskRepo
      .createQueryBuilder("task")
      .select("EXTRACT(DOW FROM task.completedAt)", "dayOfWeek")
      .addSelect("COUNT(*)", "tasks")
      .where("task.userId = :userId", { userId })
      .andWhere("task.status = :status", { status: TaskStatus.COMPLETED })
      .andWhere("task.completedAt IS NOT NULL")
      .andWhere("task.deletedAt IS NULL")
      .groupBy("EXTRACT(DOW FROM task.completedAt)")
      .orderBy("dayOfWeek", "ASC")
      .getRawMany()

    const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    const productivity = result.map((row) => ({
      dayOfWeek: daysMap[Number(row.dayOfWeek)] || "Unknown",
      tasks: Number(row.tasks),
    }))

    await this.cacheService.set(cacheKey, productivity, CACHE_TTL)

    return productivity
  }

  async getTagsAnalytics(userId: string): Promise<{ tag: string; count: number }[]> {
    const cacheKey = this.cacheService.generateAnalyticsKey(userId, "tags")

    const cached = await this.cacheService.get<{ tag: string; count: number }[]>(cacheKey)
    if (cached) return cached

    const tasks = await this.taskRepo.find({
      where: { userId, deletedAt: undefined },
      select: ["tags"],
    })

    const tagCounts: Record<string, number> = {}
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const result = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    await this.cacheService.set(cacheKey, result, CACHE_TTL)

    return result
  }

  private async getDistributionByField(userId: string, field: "status" | "priority"): Promise<Distribution[]> {
    const data = await this.taskRepo
      .createQueryBuilder("task")
      .select(`task.${field}`, "label")
      .addSelect("COUNT(*)", "value")
      .where("task.userId = :userId", { userId })
      .andWhere("task.deletedAt IS NULL")
      .groupBy(`task.${field}`)
      .getRawMany()

    const total = data.reduce((sum, item) => sum + Number(item.value), 0)

    return data.map((item) => ({
      label: item.label,
      value: Number(item.value),
      percentage: total > 0 ? Math.round((Number(item.value) / total) * 100) : 0,
    }))
  }

  private async calculateAvgCompletionTime(userId: string): Promise<number> {
    const result = await this.taskRepo
      .createQueryBuilder("task")
      .select("AVG(EXTRACT(EPOCH FROM (task.completedAt - task.createdAt)) / 3600)", "avg")
      .where("task.userId = :userId", { userId })
      .andWhere("task.status = :status", { status: TaskStatus.COMPLETED })
      .andWhere("task.completedAt IS NOT NULL")
      .andWhere("task.deletedAt IS NULL")
      .getRawOne()

    return Math.round(Number(result?.avg || 0) * 100) / 100
  }

  private calculateProductivityScore(data: {
    completionRate: number
    overdueRate: number
    completedThisWeek: number
    avgCompletionTimeHours: number
  }): number {
    let score = 0

    // 40% weight - completion rate
    score += data.completionRate * 0.4

    // 30% weight - inverse of overdue rate
    score += (100 - data.overdueRate) * 0.3

    // 20% weight - weekly productivity (max 100 for 20+ tasks)
    score += Math.min(data.completedThisWeek * 5, 100) * 0.2

    // 10% weight - speed (lower avg time = higher score)
    const speedScore = data.avgCompletionTimeHours > 0 ? Math.max(100 - data.avgCompletionTimeHours, 0) : 50
    score += speedScore * 0.1

    return Math.round(Math.min(score, 100))
  }
}
