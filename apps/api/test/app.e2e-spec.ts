import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import request from "supertest"  // ← MUDANÇA AQUI: remover o * as
import { AppModule } from "../src/app.module"

describe("AppController (e2e)", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    app.setGlobalPrefix("api/v1")  // ← ADICIONE ISSO
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it("/api/v1/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("healthy")
      })
  })

  describe("Auth", () => {
    const testUser = {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,  // ← Email único
      password: "Test@123",
    }

    it("/api/v1/auth/register (POST)", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe(testUser.email)
          expect(res.body.accessToken).toBeDefined()
          expect(res.body.refreshToken).toBeDefined()
        })
    })
  })
})