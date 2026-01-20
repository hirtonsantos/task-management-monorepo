import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { TaskStatus, Priority } from "@task-app/shared"

export class CreateTaskDto {
  @ApiProperty({ example: "Implementar login" })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string

  @ApiProperty({ example: "Implementar autenticação JWT com refresh token" })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiProperty({ example: "2024-12-31T23:59:59Z" })
  @IsDateString()
  dueDate!: string

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number

  @ApiPropertyOptional({ type: [String], example: ["backend", "auth"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ example: "uuid-category-id" })
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiPropertyOptional({ example: "uuid-user-id" })
  @IsOptional()
  @IsUUID()
  assigneeId?: string

  @ApiPropertyOptional({ example: "uuid-parent-task-id" })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string
}
