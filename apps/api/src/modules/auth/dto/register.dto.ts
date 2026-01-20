import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class RegisterDto {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  @MaxLength(100, { message: "Nome deve ter no máximo 100 caracteres" })
  name!: string

  @ApiProperty({ example: "joao@email.com" })
  @IsEmail({}, { message: "Email inválido" })
  email!: string

  @ApiProperty({ example: "Senha@123" })
  @IsString()
  @MinLength(8, { message: "Senha deve ter pelo menos 8 caracteres" })
  @MaxLength(32, { message: "Senha deve ter no máximo 32 caracteres" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número ou caractere especial",
  })
  password!: string
}
