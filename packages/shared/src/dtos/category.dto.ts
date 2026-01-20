export interface CreateCategoryDto {
  name: string
  description?: string
  color: string
  icon?: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  color?: string
  icon?: string
}
