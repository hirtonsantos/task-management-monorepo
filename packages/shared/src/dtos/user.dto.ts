import type { UserRole } from "../enums"

export interface CreateUserDto {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface UpdateUserDto {
  name?: string
  avatar?: string
  role?: UserRole
  isActive?: boolean
}

export interface UpdateProfileDto {
  name?: string
  avatar?: string
}

export interface UserFilterDto {
  role?: UserRole
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: "name" | "email" | "createdAt" | "lastLoginAt"
  sortOrder?: "ASC" | "DESC"
}
