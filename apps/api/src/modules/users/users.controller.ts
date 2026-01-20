/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger"
import { UsersService } from "./users.service"
import type { UpdateUserDto, ChangePasswordDto } from "./dto"
import { Roles } from "../../common/decorators"
import { RolesGuard } from "../../common/guards"
import type { User } from "@task-app/database"
import { UserRole } from "@task-app/shared"

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Listar todos os usuários (Admin)" })
  @ApiResponse({ status: 200, description: "Lista de usuários" })
  findAll() {
    return this.usersService.findAll()
  }

  @Get("profile")
  @ApiOperation({ summary: "Obter perfil do usuário logado" })
  @ApiResponse({ status: 200, description: "Dados do perfil" })
  getProfile(user: User) {
    return this.usersService.findOne(user.id)
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Obter usuário por ID (Admin)" })
  @ApiResponse({ status: 200, description: "Dados do usuário" })
  @ApiResponse({ status: 404, description: "Usuário não encontrado" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id)
  }

  @Patch("profile")
  @ApiOperation({ summary: "Atualizar perfil do usuário logado" })
  @ApiResponse({ status: 200, description: "Perfil atualizado" })
  updateProfile(user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto)
  }

  @Patch("profile/password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Alterar senha do usuário logado" })
  @ApiResponse({ status: 200, description: "Senha alterada" })
  @ApiResponse({ status: 400, description: "Senha atual incorreta" })
  changePassword(user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto)
  }

  @Delete("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Desativar conta do usuário logado" })
  @ApiResponse({ status: 200, description: "Conta desativada" })
  deactivateProfile(user: User) {
    return this.usersService.deactivate(user.id)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remover usuário (Admin)" })
  @ApiResponse({ status: 200, description: "Usuário removido" })
  @ApiResponse({ status: 404, description: "Usuário não encontrado" })
  deleteUser(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.delete(id)
  }
}
