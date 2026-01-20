import { Entity, Column, OneToMany, Index } from "typeorm"
import { BaseEntity } from "./base.entity"
import { Task } from "./task.entity"
import { Category } from "./category.entity"
import { AuditLog } from "./audit-log.entity"
import { UserRole } from "@task-app/shared"

@Entity("users")
export class User extends BaseEntity {
  @Index()
  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  avatar?: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole

  @Column({ name: "is_active", default: true })
  isActive!: boolean

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt?: Date

  @Column({ name: "refresh_token", nullable: true })
  refreshToken?: string

  @Column({ name: "password_reset_token", nullable: true })
  passwordResetToken?: string

  @Column({ name: "password_reset_expires", type: "timestamp", nullable: true })
  passwordResetExpires?: Date

  @OneToMany(
    () => Task,
    (task) => task.user,
  )
  tasks!: Task[]

  @OneToMany(
    () => Task,
    (task) => task.assignee,
  )
  assignedTasks!: Task[]

  @OneToMany(
    () => Category,
    (category) => category.user,
  )
  categories!: Category[]

  @OneToMany(
    () => AuditLog,
    (auditLog) => auditLog.user,
  )
  auditLogs!: AuditLog[]
}
