/* eslint-disable */
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import { LoggerService } from "./logger.service"

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get("SMTP_HOST")
    const smtpPort = this.configService.get("SMTP_PORT")
    const smtpUser = this.configService.get("SMTP_USER")
    const smtpPass = this.configService.get("SMTP_PASS")

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number.parseInt(smtpPort, 10),
        secure: Number.parseInt(smtpPort, 10) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
      this.isConfigured = true
      this.logger.log("SMTP transporter configured")
    } else {
      this.logger.warn("SMTP not configured, emails will be logged to console")
    }
  }

  async send(data: EmailData): Promise<void> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get("SMTP_FROM", "noreply@taskapp.com"),
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text || this.stripHtml(data.html),
        })
        this.logger.log(`Email sent to ${data.to}`)
      } catch (error) {
        this.logger.error("Failed to send email", error)
        throw error
      }
    } else {
      // Log email to console in development
      console.log("")
      console.log("═══════════════════════════════════════════════════════════")
      console.log("📧 EMAIL (Development Mode)")
      console.log("───────────────────────────────────────────────────────────")
      console.log(`Para: ${data.to}`)
      console.log(`Assunto: ${data.subject}`)
      console.log("───────────────────────────────────────────────────────────")
      console.log(this.stripHtml(data.html))
      console.log("═══════════════════════════════════════════════════════════")
      console.log("")
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }
}
