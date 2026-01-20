import { Injectable, Inject } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import type { Cache } from "cache-manager"

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key)
    return value ?? null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl)
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async delByPattern(pattern: string): Promise<void> {
    const store = this.cacheManager.store as any
    if (store.keys) {
      const keys = await store.keys(pattern)
      await Promise.all(keys.map((key: string) => this.cacheManager.del(key)))
    }
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset()
  }

  generateTasksKey(userId: string, filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : ""
    return `tasks:user:${userId}:${filterStr}`
  }

  generateTaskKey(taskId: string): string {
    return `task:${taskId}`
  }

  generateAnalyticsKey(userId: string, type: string): string {
    return `analytics:${type}:${userId}`
  }

  async invalidateUserTasksCache(userId: string): Promise<void> {
    await this.delByPattern(`tasks:user:${userId}:*`)
  }

  async invalidateTaskCache(taskId: string): Promise<void> {
    await this.del(this.generateTaskKey(taskId))
  }

  async invalidateAnalyticsCache(userId: string): Promise<void> {
    await this.delByPattern(`analytics:*:${userId}`)
  }
}
