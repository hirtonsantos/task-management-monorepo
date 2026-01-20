import type { AuthUser } from "./user.types";
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    expiresIn: number;
}
export interface TokenPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}
//# sourceMappingURL=auth.types.d.ts.map