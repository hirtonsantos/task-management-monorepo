/* eslint-disable */
import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy, Inject } from "@nestjs/common"
import type { ClientProxy } from "@nestjs/microservices"
import type { Task } from "@task-app/database"
import { Priority } from "@task-app/shared"
import { firstValueFrom, timeout, catchError, of } from "rxjs"

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

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name)
  private isConnected = false

  constructor(
    @Inject("TASK_SERVICE") private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect()
      this.isConnected = true
      this.logger.log("Connected to RabbitMQ")
    } catch (error) {
      this.logger.warn("Failed to connect to RabbitMQ, notifications will be disabled")
      this.isConnected = false
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.close()
    }
  }

  private async emit(pattern: string, data: TaskNotification): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`RabbitMQ not connected, skipping notification: ${pattern}`)
      return
    }

    try {
      await firstValueFrom(
        this.client.emit(pattern, data).pipe(
          timeout(5000),
          catchError((err) => {
            this.logger.error(`Failed to emit ${pattern}:`, err)
            return of(null)
          }),
        ),
      )
      this.logger.debug(`Notification sent: ${pattern}`)
    } catch (error) {
      this.logger.error(`Error sending notification ${pattern}:`, error)
    }
  }

  async sendHighPriorityNotification(task: Task): Promise<void> {
    const notification: TaskNotification = {
      type: "high_priority",
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        userId: task.userId,
        dueDate: task.dueDate ?? undefined,
      },
      timestamp: new Date(),
    }

    await this.emit("task.created.high_priority", notification)
  }

  async sendDueSoonNotification(task: Task): Promise<void> {
    const notification: TaskNotification = {
      type: "due_soon",
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        userId: task.userId,
        dueDate: task.dueDate ?? undefined,
      },
      timestamp: new Date(),
    }

    await this.emit("task.due_soon", notification)
  }

  async sendOverdueNotification(task: Task): Promise<void> {
    const notification: TaskNotification = {
      type: "overdue",
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        userId: task.userId,
        dueDate: task.dueDate ?? undefined,
      },
      timestamp: new Date(),
    }

    await this.emit("task.overdue", notification)
  }

  async sendCompletedNotification(task: Task): Promise<void> {
    const notification: TaskNotification = {
      type: "completed",
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        userId: task.userId,
      },
      timestamp: new Date(),
    }

    await this.emit("task.completed", notification)
  }

  async sendAssignedNotification(task: Task, assigneeId: string): Promise<void> {
    const notification: TaskNotification = {
      type: "assigned",
      task: {
        id: task.id,
        title: task.title,
        priority: task.priority,
        userId: task.userId,
        assigneeId,
      },
      timestamp: new Date(),
    }

    await this.emit("task.assigned", notification)
  }

  shouldNotifyHighPriority(priority?: string): boolean {
    return priority === Priority.HIGH || priority === Priority.URGENT
  }
}
