import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Task, Category } from "@task-app/database"
import { TasksController } from "./tasks.controller"
import { TasksService } from "./tasks.service"
import { QueueModule } from "../queue/queue.module"
import { CacheModule } from "../cache/cache.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Category]),
    QueueModule,   // ✅ agora TasksService consegue injetar QueueService
    CacheModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

