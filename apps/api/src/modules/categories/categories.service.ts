import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Category, User } from "@task-app/database"
import { UserRole } from "@task-app/shared"
import { CreateCategoryDto, UpdateCategoryDto } from "./dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(dto: CreateCategoryDto, user: User): Promise<Category> {
    // Check for duplicate name for same user
    const exists = await this.categoryRepository.findOne({
      where: { name: dto.name, userId: user.id },
    })

    if (exists) {
      throw new ConflictException("Categoria com esse nome já existe")
    }

    const category = this.categoryRepository.create({
      ...dto,
      userId: user.id,
    })

    return this.categoryRepository.save(category)
  }

  async findAll(user: User): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId: user.id },
      order: { name: "ASC" },
      relations: ["tasks"],
    })
  }

  async findOne(id: string, user: User): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["tasks"],
    })

    if (!category) {
      throw new NotFoundException("Categoria não encontrada")
    }

    if (category.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Acesso negado")
    }

    return category
  }

  async update(id: string, dto: UpdateCategoryDto, user: User): Promise<Category> {
    const category = await this.findOne(id, user)

    if (dto.name && dto.name !== category.name) {
      const exists = await this.categoryRepository.findOne({
        where: { name: dto.name, userId: user.id },
      })

      if (exists) {
        throw new ConflictException("Categoria com esse nome já existe")
      }
    }

    Object.assign(category, dto)
    return this.categoryRepository.save(category)
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const category = await this.findOne(id, user)
    await this.categoryRepository.remove(category)
    return { message: "Categoria removida com sucesso" }
  }
}
