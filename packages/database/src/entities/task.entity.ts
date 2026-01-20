import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm"
import { BaseEntity } from "./base.entity"
import { User } from "./user.entity"
import { Category } from "./category.entity"
import { Priority, TaskStatus } from "@task-app/shared"

@Entity("tasks")
@Index(["userId", "status"])
@Index(["dueDate", "status"])
export class Task extends BaseEntity {
  @Column()
  title!: string

  @Column("text")
  description!: string

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus

  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority!: Priority

  @Index()
  @Column({ name: "due_date", type: "timestamp" })
  dueDate!: Date

  @Column({
    name: "estimated_hours",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  estimatedHours?: number

  @Column({
    name: "actual_hours",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  actualHours?: number

  @Column("simple-array", { default: "" })
  tags!: string[]

  // Relations
  @Column({ name: "user_id" })
  userId!: string

  @ManyToOne(
    () => User,
    (user) => user.tasks,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user!: User

  @Column({ name: "assignee_id", nullable: true })
  assigneeId?: string

  @ManyToOne(
    () => User,
    (user) => user.assignedTasks,
    { onDelete: "SET NULL" },
  )
  @JoinColumn({ name: "assignee_id" })
  assignee?: User

  @Column({ name: "category_id", nullable: true })
  categoryId?: string

  @ManyToOne(
    () => Category,
    (category) => category.tasks,
    {
      onDelete: "SET NULL",
    },
  )
  @JoinColumn({ name: "category_id" })
  category?: Category

  @Column({ name: "parent_task_id", nullable: true })
  parentTaskId?: string

  @ManyToOne(
    () => Task,
    (task) => task.subtasks,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "parent_task_id" })
  parentTask?: Task

  @OneToMany(
    () => Task,
    (task) => task.parentTask,
  )
  subtasks!: Task[]

  // Timestamps
  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt?: Date

  @Column({ name: "archived_at", type: "timestamp", nullable: true })
  archivedAt?: Date
}
