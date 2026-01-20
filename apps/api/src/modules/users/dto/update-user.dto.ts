import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "João Silva" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: "joao@email.com" })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: "https://avatar.url/image.png" })
  @IsOptional()
  @IsString()
  avatar?: string
}
