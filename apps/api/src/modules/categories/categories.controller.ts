import { Controller, Get, Post, Patch, Delete, Param, ParseUUIDPipe, HttpCode, HttpStatus, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger"
import { CategoriesService } from "./categories.service"
import { CreateCategoryDto, UpdateCategoryDto } from "./dto"
import { CurrentUser } from "../../common/decorators"
import type { User } from "@task-app/database"

@ApiTags("Categories")
@ApiBearerAuth()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @ApiOperation({ summary: "Criar nova categoria" })
  @ApiResponse({ status: 201, description: "Categoria criada" })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.create(dto, user)
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async findAll(@CurrentUser() user: User) {
    return this.categoriesService.findAll(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obter categoria por ID" })
  @ApiResponse({ status: 200, description: "Dados da categoria" })
  @ApiResponse({ status: 404, description: "Categoria não encontrada" })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.categoriesService.findOne(id, user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar categoria" })
  @ApiResponse({ status: 200, description: "Categoria atualizada" })
  @ApiResponse({ status: 404, description: "Categoria não encontrada" })
  async update(@Param('id', ParseUUIDPipe) id: string, dto: UpdateCategoryDto, @CurrentUser() user: User) {
    return this.categoriesService.update(id, dto, user)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remover categoria" })
  @ApiResponse({ status: 200, description: "Categoria removida" })
  @ApiResponse({ status: 404, description: "Categoria não encontrada" })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.categoriesService.remove(id, user)
  }
}
