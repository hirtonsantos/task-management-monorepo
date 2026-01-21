/* eslint-disable */
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"

// Modules
import { AuthModule } from "./modules/auth/auth.module"
import { UsersModule } from "./modules/users/users.module"
import { TasksModule } from "./modules/tasks/tasks.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { HealthModule } from "./modules/health/health.module"
import { CacheModule } from "./modules/cache/cache.module"
import { AnalyticsModule } from "./modules/analytics/analytics.module"
import { QueueModule } from "./modules/queue/queue.module"

// Guards
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard"

// Entities
import { User, Task, Category, AuditLog } from "@task-app/database"

console.log("JWT_SECRET:", process.env.JWT_SECRET)

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST", "localhost"),
        port: configService.get("POSTGRES_PORT", 5432),
        username: configService.get("POSTGRES_USER", "taskuser"),
        password: configService.get("POSTGRES_PASSWORD", "taskpass"),
        database: configService.get("POSTGRES_DB", "taskdb"),
        entities: [User, Task, Category, AuditLog],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
        logger: "debug",
      }),
    }),

    CacheModule,
    QueueModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get("THROTTLE_TTL", 60) * 1000,
          limit: configService.get("THROTTLE_LIMIT", 100),
        },
      ],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    HealthModule,
    AnalyticsModule,
  ],
  providers: [
    // Global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
