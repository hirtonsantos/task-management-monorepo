"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRolePermissions = exports.UserRoleLabels = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["USER"] = "USER";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.UserRoleLabels = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.MANAGER]: "Gerente",
    [UserRole.USER]: "Usuário",
};
exports.UserRolePermissions = {
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
};
