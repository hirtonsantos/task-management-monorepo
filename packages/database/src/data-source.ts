import "reflect-metadata"
import { DataSource, type DataSourceOptions } from "typeorm"

const isProduction = process.env.NODE_ENV === "production"

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432", 10),
  username: process.env.POSTGRES_USER || "taskuser",
  password: process.env.POSTGRES_PASSWORD || "taskpass",
  database: process.env.POSTGRES_DB || "taskdb",

  entities: ["dist/entities/*.js"],
  migrations: ["dist/migrations/*.js"],

  synchronize: false,
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
}

export const AppDataSource = new DataSource(dataSourceOptions)
