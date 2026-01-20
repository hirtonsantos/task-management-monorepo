import type { MigrationInterface, QueryRunner } from "typeorm"

export class InitialSchema1704067200000 implements MigrationInterface {
  name = "InitialSchema1704067200000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'MANAGER', 'USER')
    `)

    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM ('PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED', 'CANCELLED')
    `)

    await queryRunner.query(`
      CREATE TYPE "priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `)

    await queryRunner.query(`
      CREATE TYPE "audit_action_enum" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')
    `)

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "name" varchar NOT NULL,
        "avatar" varchar,
        "role" "user_role_enum" NOT NULL DEFAULT 'USER',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" timestamp,
        "refresh_token" varchar,
        "password_reset_token" varchar,
        "password_reset_expires" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      )
    `)

    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`)

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" varchar,
        "color" varchar NOT NULL DEFAULT '#3B82F6',
        "icon" varchar,
        "user_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_categories_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_categories_user_name" ON "categories" ("user_id", "name")`)

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "status" "task_status_enum" NOT NULL DEFAULT 'PENDING',
        "priority" "priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "due_date" timestamp NOT NULL,
        "estimated_hours" decimal(5,2),
        "actual_hours" decimal(5,2),
        "tags" text NOT NULL DEFAULT '',
        "user_id" uuid NOT NULL,
        "assignee_id" uuid,
        "category_id" uuid,
        "parent_task_id" uuid,
        "completed_at" timestamp,
        "archived_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_tasks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_parent" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`CREATE INDEX "IDX_tasks_user_status" ON "tasks" ("user_id", "status")`)
    await queryRunner.query(`CREATE INDEX "IDX_tasks_due_date_status" ON "tasks" ("due_date", "status")`)
    await queryRunner.query(`CREATE INDEX "IDX_tasks_due_date" ON "tasks" ("due_date")`)

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "action" "audit_action_enum" NOT NULL,
        "entity_type" varchar NOT NULL,
        "entity_id" varchar,
        "changes" jsonb,
        "metadata" jsonb,
        "ip_address" varchar,
        "user_agent" varchar,
        "user_id" uuid,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `)

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entity_type", "entity_id")`)
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_created" ON "audit_logs" ("user_id", "created_at")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`)
    await queryRunner.query(`DROP TABLE "tasks"`)
    await queryRunner.query(`DROP TABLE "categories"`)
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TYPE "audit_action_enum"`)
    await queryRunner.query(`DROP TYPE "priority_enum"`)
    await queryRunner.query(`DROP TYPE "task_status_enum"`)
    await queryRunner.query(`DROP TYPE "user_role_enum"`)
  }
}
