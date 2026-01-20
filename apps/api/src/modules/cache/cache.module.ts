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
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD", ""),
        ttl: 300, // 5 minutes default
        max: 100, // Maximum number of items in cache
      }),
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
