/* eslint-disable react-hooks/rules-of-hooks */
import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import helmet from "helmet"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { TransformInterceptor } from "./common/interceptors/transform.interceptor"
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor"

async function bootstrap() {
  const logger = new Logger("Bootstrap")
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // só warnings e erros
  })

  // Security
  app.use(helmet())
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })

  // Global pipes
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
  app.useGlobalPipes(validationPipe)

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || "api/v1"
  app.setGlobalPrefix(apiPrefix)

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor())

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Task Management API")
    .setDescription("API de gerenciamento de tarefas")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth", "Autenticação e autorização")
    .addTag("Users", "Gerenciamento de usuários")
    .addTag("Tasks", "Gerenciamento de tarefas")
    .addTag("Categories", "Gerenciamento de categorias")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, document)
  logger.log(`Swagger disponível em /${apiPrefix}/docs`)

  const port = process.env.API_PORT || 3001
  await app.listen(port)
  logger.log(`API rodando em http://localhost:${port}/${apiPrefix}`)
}

bootstrap()
