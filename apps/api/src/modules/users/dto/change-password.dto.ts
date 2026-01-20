import { IsString, MinLength, MaxLength, Matches } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ChangePasswordDto {
  @ApiProperty({ example: "SenhaAtual@123" })
  @IsString()
  @MinLength(1)
  currentPassword!: string

  @ApiProperty({ example: "NovaSenha@456" })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número ou caractere especial",
  })
  newPassword!: string
}
