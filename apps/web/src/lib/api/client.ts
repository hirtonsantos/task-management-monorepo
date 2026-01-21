import axios from "axios"

const isBrowser = typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined"

console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token
apiClient.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = (globalThis as any).localStorage.getItem("accessToken")
      if (token) {
        if (!config.headers) {
          config.headers = {} as any;
        }
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = isBrowser
          ? (globalThis as any).localStorage.getItem("refreshToken")
          : null

        if (!refreshToken) {
          throw new Error("No refresh token")
        }

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        )

        // support responses that either return tokens directly or under a `data` field
        const newAccessToken =
          data?.data?.accessToken ?? data?.accessToken ?? null
        const newRefreshToken =
          data?.data?.refreshToken ?? data?.refreshToken ?? null

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh")
        }

        if (isBrowser) {
          (globalThis as any).localStorage.setItem("accessToken", newAccessToken)
          if (newRefreshToken) {
            (globalThis as any).localStorage.setItem("refreshToken", newRefreshToken)
          }
        }

        if (!originalRequest.headers) originalRequest.headers = {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return apiClient(originalRequest)
      } catch (err) {
        if (isBrowser) {
          if (isBrowser) {
            (globalThis as any).localStorage.removeItem("accessToken");
            (globalThis as any).localStorage.removeItem("refreshToken");
            (globalThis as any).location.href = "/login";
          }
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
