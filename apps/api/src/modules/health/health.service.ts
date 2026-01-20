/* eslint-disable */
import { Inject, Injectable } from "@nestjs/common"
import type { DataSource } from "typeorm"
import type { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { InjectDataSource } from "@nestjs/typeorm"

export interface HealthStatus {
  status: "healthy" | "unhealthy"
  timestamp: string
  uptime: number
  version: string
}

export interface DetailedHealthStatus extends HealthStatus {
  services: {
    database: { status: "up" | "down"; latency?: number }
    cache: { status: "up" | "down"; latency?: number }
  }
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
}

@Injectable()
export class HealthService {
  private readonly startTime: number

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    this.startTime = Date.now()
  }

  check(): HealthStatus {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || "1.0.0",
    }
  }

  async checkDetailed(): Promise<DetailedHealthStatus> {
    const [dbStatus, cacheStatus] = await Promise.all([this.checkDatabase(), this.checkCache()])

    const memory = process.memoryUsage()

    return {
      status: dbStatus.status === "up" && cacheStatus.status === "up" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: dbStatus,
        cache: cacheStatus,
      },
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
      },
    }
  }

  private async checkDatabase(): Promise<{ status: "up" | "down"; latency?: number }> {
    try {
      const start = Date.now()
      await this.dataSource.query("SELECT 1")
      return { status: "up", latency: Date.now() - start }
    } catch {
      return { status: "down" }
    }
  }

  private async checkCache(): Promise<{ status: "up" | "down"; latency?: number }> {
    try {
      const start = Date.now()
      const testKey = "health-check-test"
      await this.cacheManager.set(testKey, "ok", 1000)
      await this.cacheManager.get(testKey)
      await this.cacheManager.del(testKey)
      return { status: "up", latency: Date.now() - start }
    } catch {
      return { status: "down" }
    }
  }
}
