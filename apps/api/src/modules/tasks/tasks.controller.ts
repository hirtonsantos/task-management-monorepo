/* eslint-disable */
import { Controller, Get, Post, Patch, Delete, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from "@nestjs/swagger"
import { TasksService } from "./tasks.service"
import type { User } from "@task-app/database"
import { CurrentUser } from "@/common/decorators/current-user.decorator"
import { BulkDeleteDto, BulkUpdateDto, CreateTaskDto, TaskQueryDto, UpdateTaskDto } from "./dto"
import { JwtAuthGuard } from "../auth/guards"

@ApiTags("Tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @ApiOperation({ summary: "Criar nova tarefa" })
  @ApiResponse({ status: 201, description: "Tarefa criada" })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(dto, user)
  }

  @Get()
  @ApiOperation({ summary: "Listar tarefas com filtros" })
  @ApiResponse({ status: 200, description: "Lista paginada de tarefas" })
  async findAll(
    @Query() query: TaskQueryDto,
    @CurrentUser() user: User,
  ) {
    console.log("Fetching tasks with query findAll:", query, "for user:", user.id)
    const result = await this.tasksService.findAll(query, user)
    return result
  }

  @Get("stats")
  @ApiOperation({ summary: "Estatísticas das tarefas" })
  @ApiResponse({ status: 200, description: "Estatísticas" })
  getStats(@CurrentUser() user: User) {
    return this.tasksService.getStats(user)
  }

  @Get(":id")
  @ApiOperation({ summary: "Obter tarefa por ID" })
  @ApiResponse({ status: 200, description: "Dados da tarefa" })
  @ApiResponse({ status: 404, description: "Tarefa não encontrada" })
  findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar tarefa" })
  @ApiResponse({ status: 200, description: "Tarefa atualizada" })
  @ApiResponse({ status: 404, description: "Tarefa não encontrada" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.update(id, dto, user)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remover tarefa (soft delete)" })
  @ApiResponse({ status: 200, description: "Tarefa removida" })
  @ApiResponse({ status: 404, description: "Tarefa não encontrada" })
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user)
  }

  @Post(":id/complete")
  @ApiOperation({ summary: "Marcar tarefa como concluída" })
  @ApiResponse({ status: 200, description: "Tarefa concluída" })
  complete(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.tasksService.complete(id, user)
  }

  @Patch("bulk/update")
  @ApiOperation({ summary: "Atualizar múltiplas tarefas" })
  @ApiBody({ type: BulkUpdateDto })
  @ApiResponse({ status: 200, description: "Tarefas atualizadas" })
  bulkUpdate(@Body() dto: BulkUpdateDto, @CurrentUser() user: User) {
    const { ids, ...updateData } = dto
    return this.tasksService.bulkUpdate(ids, updateData, user)
  }

  @Delete("bulk/delete")
  @ApiOperation({ summary: "Remover múltiplas tarefas" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({ status: 200, description: "Tarefas removidas" })
  bulkDelete(@Body() dto: BulkDeleteDto, @CurrentUser() user: User) {
    return this.tasksService.bulkDelete(dto.ids, user)
  }
}
