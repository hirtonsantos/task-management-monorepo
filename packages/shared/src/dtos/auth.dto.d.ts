export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}
export interface RefreshTokenDto {
    refreshToken: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export interface ForgotPasswordDto {
    email: string;
}
export interface ResetPasswordDto {
    token: string;
    password: string;
}
//# sourceMappingURL=auth.dto.d.ts.map