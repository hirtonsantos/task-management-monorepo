/* eslint-disable */
import { Controller } from "@nestjs/common"
import { EventPattern, type RmqContext } from "@nestjs/microservices"
import { NotificationService } from "../services/notification.service"
import { LoggerService } from "../services/logger.service"
import type { TaskNotification } from "../types"

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) { }

  @EventPattern("task.created.high_priority")
  async handleHighPriority(data: TaskNotification) {
    try {
      this.logger.log("Processing high priority task notification", { taskId: data.task.id })
      await this.notificationService.processHighPriority(data)
      this.logger.log("High priority notification processed successfully")
    } catch (error) {
      this.logger.error("Error processing high priority notification", error)
    }
  }


  @EventPattern("task.due_soon")
  async handleDueSoon(data: TaskNotification, context: RmqContext) {
    // const channel = context.getChannelRef()
    // const originalMsg = context.getMessage()

    try {
      this.logger.log("Processing due soon notification", { taskId: data.task.id })
      await this.notificationService.processDueSoon(data)
      // channel.ack(originalMsg)
    } catch (error) {
      this.logger.error("Error processing due soon notification", error)
      // this.handleRetry(channel, originalMsg, data)
    }
  }

  @EventPattern("task.overdue")
  async handleOverdue(data: TaskNotification, context: RmqContext) {
    // const channel = context.getChannelRef()
    // const originalMsg = context.getMessage()

    try {
      this.logger.log("Processing overdue notification", { taskId: data.task.id })
      await this.notificationService.processOverdue(data)
      // channel.ack(originalMsg)
    } catch (error) {
      this.logger.error("Error processing overdue notification", error)
      // this.handleRetry(channel, originalMsg, data)
    }
  }

  @EventPattern("task.completed")
  async handleCompleted(data: TaskNotification, context: RmqContext) {
    // const channel = context.getChannelRef()
    // const originalMsg = context.getMessage()

    try {
      this.logger.log("Processing completed notification", { taskId: data.task.id })
      await this.notificationService.processCompleted(data)
      // channel.ack(originalMsg)
    } catch (error) {
      this.logger.error("Error processing completed notification", error)
      // this.handleRetry(channel, originalMsg, data)
    }
  }

  @EventPattern("task.assigned")
  async handleAssigned(data: TaskNotification, context: RmqContext) {
    // const channel = context.getChannelRef()
    // const originalMsg = context.getMessage()

    try {
      this.logger.log("Processing assigned notification", { taskId: data.task.id })
      await this.notificationService.processAssigned(data)
      // channel.ack(originalMsg)
    } catch (error) {
      this.logger.error("Error processing assigned notification", error)
      // this.handleRetry(channel, originalMsg, data)
    }
  }

  private handleRetry(channel: any, message: any, data: TaskNotification) {
    const retryCount = (message.properties.headers?.["x-retry-count"] || 0) + 1
    const maxRetries = 3

    if (retryCount >= maxRetries) {
      this.logger.error(`Max retries (${maxRetries}) exceeded for task ${data.task.id}, sending to DLQ`)
      channel.nack(message, false, false) // Send to DLQ
    } else {
      this.logger.warn(`Retry ${retryCount}/${maxRetries} for task ${data.task.id}`)
      channel.nack(message, false, true) // Requeue for retry
    }
  }
}
