export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MANAGER]: "Gerente",
  [UserRole.USER]: "Usuário",
}

export const UserRolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ["*"],
  [UserRole.MANAGER]: [
    "task:create",
    "task:read",
    "task:update",
    "task:delete",
    "category:create",
    "category:read",
    "category:update",
    "category:delete",
    "user:read",
    "report:read",
  ],
  [UserRole.USER]: ["task:create", "task:read", "task:update", "category:read"],
}
