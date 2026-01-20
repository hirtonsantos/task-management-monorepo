/* eslint-disable */
import { Controller, Get } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { Public } from "../../common/decorators"
import type { DetailedHealthStatus } from "./health.service"
import type { HealthStatus } from "./health.service"
import { HealthService } from "./health.service"

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check básico" })
  check(): HealthStatus {
    return this.healthService.check()
  }

  @Public()
  @Get("detailed")
  @ApiOperation({ summary: "Health check detalhado" })
  checkDetailed(): Promise<DetailedHealthStatus> {
    return this.healthService.checkDetailed()
  }
}
