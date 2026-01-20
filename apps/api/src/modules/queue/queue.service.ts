/* eslint-disable */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { ClientProxy, ClientProxyFactory, Transport, RmqOptions } from "@nestjs/microservices"
import type { Task } from "@task-app/database"
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
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name)
  private client: ClientProxy
  private readonly queue = "task_notifications"
  private isConnected = false

  constructor() {
    // Configuração básica do RabbitMQ
    const options: RmqOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
        queue: this.queue,
        queueOptions: {
          durable: true,
        },
      },
    }

    this.client = ClientProxyFactory.create(options)
  }

  async onModuleInit() {
    try {
      await this.client.connect()
      this.isConnected = true
      this.logger.log(`Connected to RabbitMQ at ${process.env.RABBITMQ_URL || "amqp://localhost:5672"}`)
    } catch (error) {
      this.logger.warn("Failed to connect to RabbitMQ, notifications will be disabled")
      this.isConnected = false
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.close()
      this.logger.log("Disconnected from RabbitMQ")
    }
  }

  private async emit(pattern: string, data: TaskNotification) {
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

  // Métodos de envio para cada tipo de notificação
  async sendHighPriorityNotification(task: Task) {
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

  async sendDueSoonNotification(task: Task) {
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

  async sendOverdueNotification(task: Task) {
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

  async sendCompletedNotification(task: Task) {
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

  async sendAssignedNotification(task: Task, assigneeId: string) {
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
    return priority === "HIGH" || priority === "URGENT"
  }
}
