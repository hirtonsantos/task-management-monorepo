import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { CacheModule } from "../cache/cache.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category, Task, User } from "@task-app/database";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task, Category]),
    CacheModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
