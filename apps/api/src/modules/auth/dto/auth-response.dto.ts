import { ApiProperty } from "@nestjs/swagger"

export class UserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  email!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false })
  avatar?: string

  @ApiProperty()
  role!: string

  @ApiProperty()
  createdAt!: Date
}

export class TokensDto {
  @ApiProperty()
  accessToken!: string

  @ApiProperty()
  refreshToken!: string

  @ApiProperty({ description: "Tempo de expiração em segundos" })
  expiresIn!: number
}

export class AuthResponseDto extends TokensDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto
}
