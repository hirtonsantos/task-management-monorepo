import { IsOptional, IsEnum, IsString, IsUUID, IsInt, Min, Max } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { TaskStatus, Priority } from "@task-app/shared"

export class TaskQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ default: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"

  // Additional filters can be added here as tags, dueDateFrom, dueDateTo, isOverdue, etc.
  @ApiPropertyOptional()
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  dueDateFrom?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  dueDateTo?: Date

  @ApiPropertyOptional()
  @IsOptional()
  isOverdue?: boolean
}
