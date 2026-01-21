import "reflect-metadata"
import { DataSource } from "typeorm"

const CliDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["dist/database/src/entities/*.js"],
  migrations: ["dist/database/src/migrations/*.js"],
})

module.exports = CliDataSource
