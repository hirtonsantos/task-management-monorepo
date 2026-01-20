import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

@Entity("audit_logs")
@Index(["entityType", "entityId"])
@Index(["userId", "createdAt"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action!: AuditAction

  @Column({ name: "entity_type" })
  entityType!: string

  @Column({ name: "entity_id", nullable: true })
  entityId?: string

  @Column({ type: "jsonb", nullable: true })
  changes?: Record<string, { old: unknown; new: unknown }>

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>

  @Column({ name: "ip_address", nullable: true })
  ipAddress?: string

  @Column({ name: "user_agent", nullable: true })
  userAgent?: string

  @Column({ name: "user_id", nullable: true })
  userId?: string

  @ManyToOne(
    () => User,
    (user) => user.auditLogs,
    { onDelete: "SET NULL" },
  )
  @JoinColumn({ name: "user_id" })
  user?: User

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date
}
