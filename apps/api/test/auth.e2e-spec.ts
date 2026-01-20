import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import request from "supertest"
import { AppModule } from "../src/app.module"

describe("Auth (e2e)", () => {
  let app: INestApplication
  let accessToken: string
  let refreshToken: string

  const testUser = {
    name: "Auth Test User",
    email: `authtest-${Date.now()}@example.com`,
    password: "Test@123",
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    app.setGlobalPrefix("api/v1")
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(201)

      // A API retorna { user, accessToken, refreshToken, expiresIn }
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.user.name).toBe(testUser.name)
      expect(response.body.user.password).toBeUndefined()
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.expiresIn).toBeDefined()
    })

    it("should fail with duplicate email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(409)
    })

    it("should fail with weak password", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          name: "Weak",
          email: "weak@example.com",
          password: "123",
        })
        .expect(400)
    })

    it("should fail with invalid email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          name: "Invalid",
          email: "not-an-email",
          password: "Test@123",
        })
        .expect(400)
    })
  })

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      // A API retorna { user, accessToken, refreshToken, expiresIn }
      expect(response.body.user).toBeDefined()
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()

      // Salvar tokens para próximos testes
      accessToken = response.body.accessToken
      refreshToken = response.body.refreshToken
    })

    it("should fail with wrong password", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123",
        })
        .expect(401)
    })

    it("should fail with non-existent user", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Test@123",
        })
        .expect(401)
    })
  })

  describe("POST /api/v1/auth/me", () => {
    it("should return current user profile", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.email).toBe(testUser.email)
      expect(response.body.name).toBe(testUser.name)
      expect(response.body.id).toBeDefined()
      expect(response.body.password).toBeUndefined()
    })

    it("should fail without token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/me")
        .expect(401)
    })

    it("should fail with invalid token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)
    })
  })

  describe("POST /api/v1/auth/refresh", () => {
    // it("should refresh tokens", async () => {
    //   console.log("Sending refresh token:", refreshToken.substring(0, 50) + "...")
      
    //   const response = await request(app.getHttpServer())
    //     .post("/api/v1/auth/refresh")
    //     .set("Authorization", `Bearer ${refreshToken}`)
      
    //   console.log("Refresh response status:", response.status)
    //   console.log("Refresh response body:", JSON.stringify(response.body, null, 2))

    //   expect(response.status).toBe(200)
    //   expect(response.body.accessToken).toBeDefined()
    //   expect(response.body.refreshToken).toBeDefined()

    //   accessToken = response.body.accessToken
    //   refreshToken = response.body.refreshToken
    // })

    it("should fail with invalid refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)
    })
  })

  describe("POST /api/v1/auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toBeDefined()
    })
  })
})