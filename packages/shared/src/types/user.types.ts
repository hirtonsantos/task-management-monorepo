import type { UserRole } from "../enums"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserWithPassword extends User {
  password: string
}

export interface UserProfile extends Omit<User, "isActive"> {
  tasksCount: number
  completedTasksCount: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
