import { z } from "zod"

export const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default("taskdb"),
  POSTGRES_USER: z.string().default("taskuser"),
  POSTGRES_PASSWORD: z.string().default("taskpass"),
  DATABASE_URL: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // RabbitMQ
  RABBITMQ_HOST: z.string().default("localhost"),
  RABBITMQ_PORT: z.coerce.number().default(5672),
  RABBITMQ_USER: z.string().default("taskuser"),
  RABBITMQ_PASSWORD: z.string().default("taskpass"),
  RABBITMQ_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // API
  API_PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default("api/v1"),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(100),
})

export type EnvConfig = z.infer<typeof envSchema>

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(env)

  if (!result.success) {
    console.error("❌ Invalid environment variables:")
    console.error(result.error.format())
    throw new Error("Invalid environment configuration")
  }

  return result.data
}
