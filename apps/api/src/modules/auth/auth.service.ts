import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import * as bcrypt from "bcrypt"
import type { RegisterDto, LoginDto } from "./dto"
import type { AuthResponseDto, TokensDto } from "./dto/auth-response.dto"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { Repository } from "typeorm"
import { User } from "@task-app/database"
import { InjectRepository } from "@nestjs/typeorm"


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { 
    console.log('JWT_SECRET inside service:', this.configService.get('JWT_SECRET'))
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    })

    if (existingUser) {
      throw new ConflictException("Email já cadastrado")
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(dto.password, salt)

    // Create user
    const user = this.userRepository.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    })

    await this.userRepository.save(user)

    // Generate tokens
    const tokens = await this.generateTokens(user)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    })

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Conta desativada")
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    })

    // Generate tokens
    const tokens = await this.generateTokens(user)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("Acesso negado")
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken)

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException("Acesso negado")
    }

    const tokens = await this.generateTokens(user)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: undefined,
    })
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    })
  }

  private async generateTokens(user: User): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: this.configService.get("JWT_EXPIRES_IN", "15m"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "7d"),
      }),
    ])

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiresInSeconds(this.configService.get("JWT_EXPIRES_IN", "15m")),
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    }
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) return 900 // default 15 minutes

    const [, value, unit] = match
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }

    return Number.parseInt(value) * (multipliers[unit] || 60)
  }
}
