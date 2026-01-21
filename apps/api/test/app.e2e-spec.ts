import { Test, type TestingModule } from "@nestjs/testing";
import { type INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User, Task } from "@task-app/database";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { AuthModule } from "../src/modules/auth/auth.module";
import { HealthController, HealthService } from "../src/modules/health";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  const mockHealthService = {
    check: jest.fn().mockResolvedValue({ status: "healthy" }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          const config = {
            JWT_SECRET: "fake-jwt-secret-for-testing",
            JWT_REFRESH_SECRET: "fake-jwt-refresh-secret-for-testing",
            JWT_EXPIRATION: "15m",
            JWT_REFRESH_EXPIRATION: "7d",
          };
          return config[key as keyof typeof config] ?? defaultValue;
        }),
      })
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Task))
      .useValue(mockTaskRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  it("/api/v1/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("healthy");
      });
  });

  describe("Auth", () => {
    const testUser = {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "Test@123",
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("/api/v1/auth/register (POST)", async () => {
      const savedUser = {
        id: 1,
        name: testUser.name,
        email: testUser.email,
        password: "$2b$10$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe("string");
      expect(typeof response.body.refreshToken).toBe("string");
      expect(response.body.user.password).toBeUndefined();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: testUser.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("/api/v1/auth/register (POST) - should fail with duplicate email", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: testUser.email,
        name: "Existing User",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(409);

      expect(response.body.message).toBeDefined();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("/api/v1/auth/register (POST) - should fail with invalid email", async () => {
      const invalidUser = {
        ...testUser,
        email: "invalid-email",
      };

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain("Email inválido");
    });

    it("/api/v1/auth/register (POST) - should fail with weak password", async () => {
      const weakPasswordUser = {
        ...testUser,
        password: "123",
      };

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it("/api/v1/auth/register (POST) - should fail without required fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});
