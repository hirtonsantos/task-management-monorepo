/* eslint-disable */
import { Module, Global } from "@nestjs/common"
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { redisStore } from "cache-manager-redis-store"
import { CacheService } from "./cache.service"

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>("REDIS_HOST") || "redis";
        const port = configService.get<string>("REDIS_PORT") || "6379";
        const password = configService.get<string>("REDIS_PASSWORD") || "";

        const url = `redis://${password ? password + "@" : ""}${host}:${port}`;

        console.log("=== CacheModule Initialization ===");
        console.log("Connecting Redis at:", url);
        console.log("=================================");

        return {
          store: redisStore as any,
          url,
          ttl: 300,
          max: 100,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}


