import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm"
import { BaseEntity } from "./base.entity"
import { User } from "./user.entity"
import { Task } from "./task.entity"

@Entity("categories")
@Index(["userId", "name"], { unique: true })
export class Category extends BaseEntity {
  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: "#3B82F6" })
  color!: string

  @Column({ nullable: true })
  icon?: string

  @Column({ name: "user_id" })
  userId!: string

  @ManyToOne(
    () => User,
    (user) => user.categories,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user!: User

  @OneToMany(
    () => Task,
    (task) => task.category,
  )
  tasks!: Task[]
}
