/* eslint-disable */
import { Injectable } from "@nestjs/common"
import { EmailService } from "./email.service"
import { LoggerService } from "./logger.service"
import type { TaskNotification } from "../types"

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async processHighPriority(data: TaskNotification): Promise<void> {
    this.logger.log("Processing high priority task notification", { taskId: data.task.id })

    const priorityEmoji = data.task.priority === "URGENT" ? "🔴" : "🟠"
    const dueDate = data.task.dueDate ? new Date(data.task.dueDate).toLocaleDateString("pt-BR") : "Não definido"

    await this.emailService.send({
      to: `user-${data.task.userId}@taskapp.local`,
      subject: `${priorityEmoji} Nova tarefa de alta prioridade: ${data.task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">${priorityEmoji} Tarefa de Alta Prioridade</h2>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${data.task.title}</h3>
            <p style="margin: 0; color: #666;">
              <strong>Prioridade:</strong> ${data.task.priority}<br>
              <strong>Vencimento:</strong> ${dueDate}
            </p>
          </div>
          <p>Esta tarefa requer sua atenção imediata.</p>
          <a href="#" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Tarefa
          </a>
        </div>
      `,
    })

    this.logger.log("High priority notification sent successfully")
  }

  async processDueSoon(data: TaskNotification): Promise<void> {
    this.logger.log("Processing due soon notification", { taskId: data.task.id })

    const dueDate = data.task.dueDate ? new Date(data.task.dueDate).toLocaleDateString("pt-BR") : "Em breve"

    await this.emailService.send({
      to: `user-${data.task.userId}@taskapp.local`,
      subject: `⏰ Lembrete: "${data.task.title}" vence em breve`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⏰ Tarefa Vencendo em Breve</h2>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${data.task.title}</h3>
            <p style="margin: 0; color: #666;">
              <strong>Vencimento:</strong> ${dueDate}
            </p>
          </div>
          <p>Não esqueça de completar esta tarefa antes do prazo.</p>
          <a href="#" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Tarefa
          </a>
        </div>
      `,
    })
  }

  async processOverdue(data: TaskNotification): Promise<void> {
    this.logger.log("Processing overdue notification", { taskId: data.task.id })

    const dueDate = data.task.dueDate ? new Date(data.task.dueDate).toLocaleDateString("pt-BR") : "Passado"

    await this.emailService.send({
      to: `user-${data.task.userId}@taskapp.local`,
      subject: `⚠️ Tarefa atrasada: "${data.task.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">⚠️ Tarefa Atrasada</h2>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${data.task.title}</h3>
            <p style="margin: 0; color: #666;">
              <strong>Vencimento:</strong> ${dueDate}<br>
              <strong>Status:</strong> <span style="color: #ef4444;">ATRASADA</span>
            </p>
          </div>
          <p>Esta tarefa já passou do prazo. Por favor, atualize o status ou conclua-a.</p>
          <a href="#" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Tarefa
          </a>
        </div>
      `,
    })
  }

  async processCompleted(data: TaskNotification): Promise<void> {
    this.logger.log("Processing completed notification", { taskId: data.task.id })

    await this.emailService.send({
      to: `user-${data.task.userId}@taskapp.local`,
      subject: `✅ Tarefa concluída: "${data.task.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Tarefa Concluída</h2>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${data.task.title}</h3>
            <p style="margin: 0; color: #666;">
              <strong>Concluída em:</strong> ${new Date(data.timestamp).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <p>Parabéns! Você completou mais uma tarefa.</p>
        </div>
      `,
    })
  }

  async processAssigned(data: TaskNotification): Promise<void> {
    this.logger.log("Processing assigned notification", { taskId: data.task.id, assigneeId: data.task.assigneeId })

    await this.emailService.send({
      to: `user-${data.task.assigneeId}@taskapp.local`,
      subject: `📋 Nova tarefa atribuída: "${data.task.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📋 Nova Tarefa Atribuída</h2>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${data.task.title}</h3>
            <p style="margin: 0; color: #666;">
              <strong>Prioridade:</strong> ${data.task.priority}<br>
              <strong>Vencimento:</strong> ${data.task.dueDate ? new Date(data.task.dueDate).toLocaleDateString("pt-BR") : "Não definido"}
            </p>
          </div>
          <p>Uma nova tarefa foi atribuída a você.</p>
          <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Ver Tarefa
          </a>
        </div>
      `,
    })
  }
}
