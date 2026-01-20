/* eslint-disable */
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { NotificationController } from "./controllers/notification.controller"
import { NotificationService } from "./services/notification.service"
import { EmailService } from "./services/email.service"
import { LoggerService } from "./services/logger.service"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, LoggerService],
})
export class WorkerModule {}
