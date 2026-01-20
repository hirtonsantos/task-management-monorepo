/* eslint-disable */
import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TasksService } from "./tasks.service"
import { Task, type User } from "@task-app/database"
import { CacheService } from "../cache/cache.service"
import { QueueService } from "../queue/queue.service"
import { TaskStatus, Priority, UserRole } from "@task-app/shared"

describe("TasksService", () => {
  let service: TasksService
  let taskRepository: any
  let cacheService: any
  let queueService: any

  const mockUser: User = {
    id: "user-123",
    email: "test@test.com",
    name: "Test User",
    role: UserRole.USER,
  } as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            invalidateTaskCache: jest.fn().mockResolvedValue(undefined),
            invalidateUserTasksCache: jest.fn().mockResolvedValue(undefined),
            invalidateAnalyticsCache: jest.fn().mockResolvedValue(undefined),
            generateTasksKey: jest.fn().mockReturnValue("tasks:user-123"),
            generateTaskKey: jest.fn().mockReturnValue("task:task-123"),
            generateAnalyticsKey: jest.fn().mockReturnValue("analytics:user-123"),
          },
        },
        {
          provide: QueueService,
          useValue: {
            sendHighPriorityNotification: jest.fn().mockResolvedValue(undefined),
            sendCompletedNotification: jest.fn().mockResolvedValue(undefined),
            shouldNotifyHighPriority: jest.fn().mockImplementation((p) => p === "HIGH" || p === "URGENT"),
          },
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    taskRepository = module.get(getRepositoryToken(Task))
    cacheService = module.get(CacheService)
    queueService = module.get(QueueService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a task successfully", async () => {
      const dto = {
        title: "Test Task",
        description: "Test Description",
        priority: Priority.MEDIUM,
        dueDate: new Date(),
      }

      const mockTask = { id: "task-123", ...dto, userId: mockUser.id }

      taskRepository.create.mockReturnValue(mockTask)
      taskRepository.save.mockResolvedValue(mockTask)

      const result = await service.create(dto as any, mockUser)

      expect(result).toEqual(mockTask)
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId: mockUser.id,
      })
      expect(taskRepository.save).toHaveBeenCalled()
      expect(cacheService.invalidateUserTasksCache).toHaveBeenCalledWith(mockUser.id)
    })

    it("should send notification for high priority tasks", async () => {
      const dto = {
        title: "Urgent Task",
        description: "Very important",
        priority: Priority.HIGH,
        dueDate: new Date(),
      }

      const mockTask = { id: "task-123", ...dto, userId: mockUser.id }

      taskRepository.create.mockReturnValue(mockTask)
      taskRepository.save.mockResolvedValue(mockTask)

      await service.create(dto as any, mockUser)

      expect(queueService.sendHighPriorityNotification).toHaveBeenCalledWith(mockTask)
    })

    it("should NOT send notification for normal priority tasks", async () => {
      const dto = {
        title: "Normal Task",
        description: "Regular task",
        priority: Priority.LOW,
      }

      const mockTask = { id: "task-123", ...dto, userId: mockUser.id }

      taskRepository.create.mockReturnValue(mockTask)
      taskRepository.save.mockResolvedValue(mockTask)

      await service.create(dto as any, mockUser)

      expect(queueService.sendHighPriorityNotification).not.toHaveBeenCalled()
    })
  })

  describe("findAll", () => {
    it("should return cached data if available", async () => {
      const cachedData = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }

      cacheService.get.mockResolvedValue(cachedData)

      const result = await service.findAll({ page: 1, limit: 10 }, mockUser)

      expect(result).toEqual(cachedData)
      expect(cacheService.get).toHaveBeenCalled()
    })

    it("should query database and cache result when cache miss", async () => {
      cacheService.get.mockResolvedValue(null)

      const result = await service.findAll({ page: 1, limit: 10 }, mockUser)

      expect(result.items).toEqual([])
      expect(cacheService.set).toHaveBeenCalled()
    })
  })

  describe("update", () => {
    it("should update task and invalidate cache", async () => {
      const taskId = "task-123"
      const dto = { title: "Updated Title" }

      const mockTask = {
        id: taskId,
        title: "Old Title",
        userId: mockUser.id,
        status: TaskStatus.PENDING,
      }

      taskRepository.findOne.mockResolvedValue(mockTask)
      taskRepository.save.mockResolvedValue({ ...mockTask, ...dto })

      const result = await service.update(taskId, dto as any, mockUser)

      expect(result.title).toBe("Updated Title")
      expect(cacheService.invalidateTaskCache).toHaveBeenCalledWith(taskId)
      expect(cacheService.invalidateUserTasksCache).toHaveBeenCalledWith(mockUser.id)
    })

    it("should send notification when task is completed", async () => {
      const taskId = "task-123"
      const dto = { status: TaskStatus.COMPLETED }

      const mockTask = {
        id: taskId,
        title: "Test Task",
        userId: mockUser.id,
        status: TaskStatus.IN_PROGRESS,
      }

      taskRepository.findOne.mockResolvedValue(mockTask)
      taskRepository.save.mockResolvedValue({ ...mockTask, ...dto })

      await service.update(taskId, dto as any, mockUser)

      expect(queueService.sendCompletedNotification).toHaveBeenCalled()
    })
  })

  describe("getStats", () => {
    it("should return task statistics", async () => {
      cacheService.get.mockResolvedValue(null)
      taskRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // pending
        .mockResolvedValueOnce(20) // inProgress
        .mockResolvedValueOnce(45) // done
        .mockResolvedValueOnce(5) // overdue

      const result: any = await service.getStats(mockUser)

      expect(result.total).toBe(100)
      expect(result.pending).toBe(30)
      expect(result.inProgress).toBe(20)
      expect(result.done).toBe(45)
      expect(result.overdue).toBe(5)
      expect(result.completionRate).toBe(45)
    })
  })
})
