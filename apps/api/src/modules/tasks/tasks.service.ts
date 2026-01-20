/* eslint-disable */
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { type Repository, In, LessThan } from "typeorm"
import { Task, User } from "@task-app/database"
import { TaskStatus, UserRole } from "@task-app/shared"
import { CacheService } from "../cache/cache.service"
import { QueueService } from "../queue/queue.service"
import type { CreateTaskDto, UpdateTaskDto, TaskQueryDto, PaginatedTasksDto } from "./dto"
import { InjectRepository } from "@nestjs/typeorm"

const CACHE_TTL = 300000 // 5 minutes
const TASK_CACHE_TTL = 600000 // 10 minutes

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly cacheService: CacheService, // já é global
    private readonly queueService: QueueService, // agora resolvido
  ) { }


  async create(dto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...dto,
      userId: user.id,
    })

    const saved = await this.taskRepository.save(task)

    // Invalidate user's tasks cache
    await this.cacheService.invalidateUserTasksCache(user.id)
    await this.cacheService.invalidateAnalyticsCache(user.id)

    if (this.queueService.shouldNotifyHighPriority(dto.priority)) {
      console.log("Sending high priority notification for task:", saved.id)
      await this.queueService.sendHighPriorityNotification(saved)
    }

    return saved
  }

  async findAll(query: TaskQueryDto, user: User): Promise<PaginatedTasksDto> {
    console.log("Finding tasks for user:", user, "with query:", query)
    const cacheKey = this.cacheService.generateTasksKey(user.id, query)

    // Try cache first
    const cached = await this.cacheService.get<PaginatedTasksDto>(cacheKey)

    console.log("Cache key:", cacheKey, "Cached result:", cached)
    if (cached) {
      return cached
    }

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      categoryId,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
      tags,
      dueDateFrom,
      dueDateTo,
      isOverdue,
    } = query

    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.category", "category")
      .leftJoinAndSelect("task.assignee", "assignee")
      .where("task.userId = :userId", { userId: user.id })
      .andWhere("task.deletedAt IS NULL")

    // Status filter (supports array)
    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere("task.status IN (:...status)", { status })
      } else {
        queryBuilder.andWhere("task.status = :status", { status })
      }
    }

    // Priority filter (supports array)
    if (priority) {
      if (Array.isArray(priority)) {
        queryBuilder.andWhere("task.priority IN (:...priority)", { priority })
      } else {
        queryBuilder.andWhere("task.priority = :priority", { priority })
      }
    }

    if (categoryId) {
      queryBuilder.andWhere("task.categoryId = :categoryId", { categoryId })
    }

    if (search) {
      queryBuilder.andWhere("(task.title ILIKE :search OR task.description ILIKE :search)", { search: `%${search}%` })
    }

    // Tags filter (PostgreSQL array contains)
    if (tags && tags.length > 0) {
      queryBuilder.andWhere("task.tags && :tags", { tags })
    }

    // Date range filters
    if (dueDateFrom) {
      queryBuilder.andWhere("task.dueDate >= :dueDateFrom", { dueDateFrom })
    }

    if (dueDateTo) {
      queryBuilder.andWhere("task.dueDate <= :dueDateTo", { dueDateTo })
    }

    // Overdue filter
    if (isOverdue === true) {
      queryBuilder.andWhere("task.dueDate < :now", { now: new Date() })
      queryBuilder.andWhere("task.status NOT IN (:...completedStatuses)", {
        completedStatuses: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED],
      })
    }

    const [items, total] = await queryBuilder
      .orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const result: PaginatedTasksDto = {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    }

    // Cache the result
    await this.cacheService.set(cacheKey, result, CACHE_TTL)

    return result
  }

  async findOne(id: string, user: User): Promise<Task> {
    const cacheKey = this.cacheService.generateTaskKey(id)

    // Try cache first
    const cached = await this.cacheService.get<Task>(cacheKey)
    if (cached) {
      // Verify ownership even for cached data
      if (cached.userId !== user.id && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException("Acesso negado")
      }
      return cached
    }

    const task = await this.taskRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ["category", "assignee", "subtasks"],
    })

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada")
    }

    // Check ownership (unless admin)
    if (task.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Acesso negado")
    }

    // Cache the task
    await this.cacheService.set(cacheKey, task, TASK_CACHE_TTL)

    return task
  }

  async update(id: string, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user)
    const previousStatus = task.status

    // Handle status change
    if (dto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      ; (task as any).completedAt = new Date()
    }

    if (dto.status === TaskStatus.ARCHIVED && task.status !== TaskStatus.ARCHIVED) {
      ; (task as any).archivedAt = new Date()
    }

    Object.assign(task, dto)
    const updated = await this.taskRepository.save(task)

    // Invalidate caches
    await this.cacheService.invalidateTaskCache(id)
    await this.cacheService.invalidateUserTasksCache(user.id)
    await this.cacheService.invalidateAnalyticsCache(user.id)

    if (dto.status === TaskStatus.COMPLETED && previousStatus !== TaskStatus.COMPLETED) {
      await this.queueService.sendCompletedNotification(updated)
    }

    return updated
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const task = await this.findOne(id, user)

    // Soft delete
    task.deletedAt = new Date()
    await this.taskRepository.save(task)

    // Invalidate caches
    await this.cacheService.invalidateTaskCache(id)
    await this.cacheService.invalidateUserTasksCache(user.id)
    await this.cacheService.invalidateAnalyticsCache(user.id)

    return { message: "Tarefa removida com sucesso" }
  }

  async complete(id: string, user: User): Promise<Task> {
    return this.update(id, { status: TaskStatus.COMPLETED }, user)
  }

  // Bulk operations
  async bulkUpdate(ids: string[], dto: Partial<UpdateTaskDto>, user: User): Promise<{ updated: number }> {
    const tasks = await this.taskRepository.find({
      where: { id: In(ids), userId: user.id },
    })

    if (tasks.length === 0) {
      throw new NotFoundException("Nenhuma tarefa encontrada")
    }

    await this.taskRepository.update({ id: In(tasks.map((t) => t.id)) }, dto as any)

    // Invalidate caches
    await Promise.all(tasks.map((t) => this.cacheService.invalidateTaskCache(t.id)))
    await this.cacheService.invalidateUserTasksCache(user.id)
    await this.cacheService.invalidateAnalyticsCache(user.id)

    return { updated: tasks.length }
  }

  async bulkDelete(ids: string[], user: User): Promise<{ deleted: number }> {
    const tasks = await this.taskRepository.find({
      where: { id: In(ids), userId: user.id },
    })

    if (tasks.length === 0) {
      throw new NotFoundException("Nenhuma tarefa encontrada")
    }

    // Soft delete
    await this.taskRepository.update({ id: In(tasks.map((t) => t.id)) }, { deletedAt: new Date() })

    // Invalidate caches
    await Promise.all(tasks.map((t) => this.cacheService.invalidateTaskCache(t.id)))
    await this.cacheService.invalidateUserTasksCache(user.id)
    await this.cacheService.invalidateAnalyticsCache(user.id)

    return { deleted: tasks.length }
  }

  async getStats(user: User) {
    const cacheKey = this.cacheService.generateAnalyticsKey(user.id, "stats")


    // Try cache first

    const cached = await this.cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    const [total, pending, inProgress, complete, overdue] = await Promise.all([
      this.taskRepository.count({ where: { userId: user.id, deletedAt: undefined } }),
      this.taskRepository.count({
        where: { userId: user.id, status: TaskStatus.PENDING, deletedAt: undefined },
      }),
      this.taskRepository.count({
        where: { userId: user.id, status: TaskStatus.IN_PROGRESS, deletedAt: undefined },
      }),
      this.taskRepository.count({
        where: { userId: user.id, status: TaskStatus.COMPLETED, deletedAt: undefined },
      }),
      this.taskRepository.count({
        where: {
          userId: user.id,
          status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
          dueDate: LessThan(new Date()),
          deletedAt: undefined,
        },
      }),
    ])

    const result = {
      total,
      pending,
      inProgress,
      complete,
      overdue,
      completionRate: total > 0 ? Math.round((complete / total) * 100) : 0,
      overdueRate: total > 0 ? Math.round((overdue / total) * 100) : 0,
    }

    await this.cacheService.set(cacheKey, result, CACHE_TTL)

    return result
  }
}
