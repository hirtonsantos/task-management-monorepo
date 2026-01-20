/* eslint-disable */
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { QueueService } from "./queue.service"

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: "TASK_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>("RABBITMQ_URL") ?? "amqp://taskuser:taskpass@localhost:5672"],
            queue: "task_notifications",
            queueOptions: {
              durable: true,
              deadLetterExchange: "task_dlx",
              deadLetterRoutingKey: "task_dead",
            },
          },
        }),
      },
    ]),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
