/* eslint-disable */
import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AnalyticsService } from "./analytics.service"
import { Task, type User } from "@task-app/database"
import { CacheService } from "../cache/cache.service"
import { UserRole } from "@task-app/shared"

describe("AnalyticsService", () => {
  let service: AnalyticsService
  let taskRepository: any
  let cacheService: any

  const mockUser: User = {
    id: "user-123",
    email: "test@test.com",
    name: "Test User",
    role: UserRole.USER,
  } as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            generateAnalyticsKey: jest.fn().mockReturnValue("analytics:user-123:overview"),
          },
        },
      ],
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
    taskRepository = module.get(getRepositoryToken(Task))
    cacheService = module.get(CacheService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("getOverview", () => {
    it("should return overview with correct completion rate", async () => {
      taskRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60) // completed
        .mockResolvedValueOnce(5) // completedToday
        .mockResolvedValueOnce(20) // completedThisWeek
        .mockResolvedValueOnce(45) // completedThisMonth
        .mockResolvedValueOnce(10) // overdue

      const result = await service.getOverview(mockUser.id)

      expect(result.totalTasks).toBe(100)
      expect(result.completedTasks).toBe(60)
      expect(result.completionRate).toBe(60)
      expect(result.overdueTasks).toBe(10)
    })

    it("should return cached data if available", async () => {
      const cachedData = {
        totalTasks: 50,
        completedTasks: 25,
        completionRate: 50,
      }

      cacheService.get.mockResolvedValue(cachedData)

      const result = await service.getOverview(mockUser.id)

      expect(result).toEqual(cachedData)
      expect(taskRepository.count).not.toHaveBeenCalled()
    })

    it("should handle zero tasks gracefully", async () => {
      taskRepository.count.mockResolvedValue(0)

      const result = await service.getOverview(mockUser.id)

      expect(result.totalTasks).toBe(0)
      expect(result.completionRate).toBe(0)
    })
  })
})
