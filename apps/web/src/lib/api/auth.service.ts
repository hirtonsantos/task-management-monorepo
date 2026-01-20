import apiClient from "./client"

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  expiresIn: number
}

export const authService = {
  login: (data: LoginDto) => apiClient.post<{ data: AuthResponse }>("/auth/login", data),

  register: (data: RegisterDto) => apiClient.post<{ data: AuthResponse }>("/auth/register", data),

  logout: () => apiClient.post("/auth/logout"),

  me: () => apiClient.post("/auth/me"),

  refresh: () => apiClient.post("/auth/refresh"),
}
