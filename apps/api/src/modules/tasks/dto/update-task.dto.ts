import { PartialType } from "@nestjs/swagger"
import { CreateTaskDto } from "./create-task.dto"
import { IsNumber, IsOptional, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: 6.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number
}
