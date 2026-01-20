import { NestFactory } from "@nestjs/core"
import { Transport, MicroserviceOptions } from "@nestjs/microservices"
import { WorkerModule } from "./worker.module"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || "amqp://taskuser:taskpass@localhost:5672"],
        queue: "task_notifications",
        queueOptions: {
          durable: true,
        },
        noAck: false,
        prefetchCount: 10,
      },
    },
  )

  await app.listen()
  console.log("Worker is listening for messages...")
}

bootstrap()
