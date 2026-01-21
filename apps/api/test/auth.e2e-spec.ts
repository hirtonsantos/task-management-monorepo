jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

import { Test, type TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import * as bcrypt from "bcrypt";

import { User, Task } from "@task-app/database";
import { AuthModule } from "../src/modules/auth/auth.module";
import { HealthController, HealthService } from "../src/modules/health";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

const testUser = {
  id: 1,
  name: "Auth Test User",
  email: `authtest-${Date.now()}@example.com`,
  password: "Test@123",
};

describe("Auth (e2e) with full mocks", () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let jwtService: JwtService;

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

  beforeAll(async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashedpassword");
    (bcrypt.genSalt as jest.Mock).mockResolvedValue("$2b$10$");

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Task))
      .useValue(mockTaskRepository)
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
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
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
    );
    app.setGlobalPrefix("api/v1");
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) await app.close();
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashedpassword");
    });

    it("should register a new user", async () => {
      const savedUser = { 
        id: 1,
        name: testUser.name,
        email: testUser.email,
        password: "$2b$10$hashedpassword", 
        createdAt: new Date(), 
        updatedAt: new Date(),
        refreshToken: null,
      };
      
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it("should fail with duplicate email", async () => {
      mockUserRepository.findOne.mockResolvedValue({ 
        id: 1, 
        email: testUser.email,
        name: "Existing User",
        password: "$2b$10$hashedpassword",
      });
      
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        })
        .expect(409);
        
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should fail with weak password", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ name: "Weak", email: "weak@example.com", password: "123" })
        .expect(400);
    });

    it("should fail with invalid email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ name: "Invalid", email: "not-an-email", password: "Test@123" })
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it("should fail with wrong password", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const existingUser = {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        password: "$2b$10$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "WrongPassword123" })
        .expect(401);
    });

    it("should fail with non-existent user", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: "nonexistent@example.com", password: "Test@123" })
        .expect(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should fail with invalid refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});