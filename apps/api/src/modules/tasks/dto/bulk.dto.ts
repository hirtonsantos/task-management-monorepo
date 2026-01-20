/* eslint-disable */
import { IsArray, IsUUID, IsOptional, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { TaskStatus, Priority } from "@task-app/shared"

export class BulkUpdateDto {
  @ApiProperty({ description: "IDs das tarefas", type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  ids!: string[]

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID("4")
  categoryId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID("4")
  assigneeId?: string
}

export class BulkDeleteDto {
  @ApiProperty({ description: "IDs das tarefas", type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  ids!: string[]
}
