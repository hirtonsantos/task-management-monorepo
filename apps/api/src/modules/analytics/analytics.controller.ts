/* eslint-disable */
import { Controller, Get } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from "@nestjs/swagger"
import { AnalyticsService } from "./analytics.service"
import type { User } from "@task-app/database"
import { CurrentUser } from "@/common/decorators"

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get("overview")
  @ApiOperation({ summary: "Visão geral das métricas" })
  @ApiResponse({ status: 200, description: "Métricas gerais" })
  getOverview(
    @CurrentUser() user: User) {
    return this.analyticsService.getOverview(user.id)
  }

  @Get("trends")
  @ApiOperation({ summary: "Tendências temporais" })
  @ApiQuery({ name: "days", required: false, type: Number, description: "Número de dias (default: 30)" })
  @ApiResponse({ status: 200, description: "Dados de tendências" })
  async getTrends(@CurrentUser() user: User, days: number | undefined) {
    const daysNum = days || 30
    const result = await this.analyticsService.getTrends(user.id, daysNum)
    console.log("Trends result:", result)
    return result
  }

  @Get("distributions")
  @ApiOperation({ summary: "Distribuições por status e prioridade" })
  @ApiResponse({ status: 200, description: "Dados de distribuição" })
  getDistributions(@CurrentUser() user: User) {
    return this.analyticsService.getDistributions(user.id)
  }

  @Get("productivity-by-day")
  @ApiOperation({ summary: "Produtividade por dia da semana" })
  @ApiResponse({ status: 200, description: "Tarefas concluídas por dia" })
  getProductivityByDay(@CurrentUser() user: User) {
    return this.analyticsService.getProductivityByDay(user.id)
  }

  @Get("tags")
  @ApiOperation({ summary: "Análise de tags mais usadas" })
  @ApiResponse({ status: 200, description: "Top 10 tags" })
  getTagsAnalytics(@CurrentUser() user: User) {
    return this.analyticsService.getTagsAnalytics(user.id)
  }
}
