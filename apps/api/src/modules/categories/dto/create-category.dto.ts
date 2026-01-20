import { IsString, IsOptional, MinLength, MaxLength } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateCategoryDto {
  @ApiProperty({ example: "Trabalho" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string

  @ApiPropertyOptional({ example: "#3B82F6" })
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional({ example: "📋" })
  @IsOptional()
  @IsString()
  icon?: string

  @ApiPropertyOptional({ example: "Tarefas relacionadas ao trabalho" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string
}
