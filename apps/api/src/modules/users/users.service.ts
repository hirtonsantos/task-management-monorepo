import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "@task-app/database"
import type { UpdateUserDto, ChangePasswordDto } from "./dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Nest agora sabe o que injetar
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ["id", "email", "name", "avatar", "role", "isActive", "createdAt"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ["id", "email", "name", "avatar", "role", "isActive", "createdAt", "lastLoginAt"],
    })

    if (!user) {
      throw new NotFoundException("Usuário não encontrado")
    }

    return user
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      })

      if (exists) {
        throw new ConflictException("Email já está em uso")
      }

      dto.email = dto.email.toLowerCase()
    }

    Object.assign(user, dto)
    return this.userRepository.save(user)
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException("Usuário não encontrado")
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Senha atual incorreta")
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt)

    await this.userRepository.update(id, {
      password: hashedPassword,
      refreshToken: () => "NULL", // Invalidate all sessions
    })

    return { message: "Senha alterada com sucesso" }
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id)

    if (!user.isActive) {
      throw new BadRequestException("A conta já está desativada")
    }

    await this.userRepository.update(id, {
      isActive: false,
      refreshToken: () => "NULL",
    })

    return { message: "Conta desativada com sucesso" }
  }

  async delete(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id)
    await this.userRepository.remove(user)
    return { message: "Usuário removido com sucesso" }
  }
}
