"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatusColors = exports.TaskStatusLabels = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["IN_REVIEW"] = "IN_REVIEW";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["ARCHIVED"] = "ARCHIVED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
exports.TaskStatusLabels = {
    [TaskStatus.PENDING]: "Pendente",
    [TaskStatus.IN_PROGRESS]: "Em Progresso",
    [TaskStatus.IN_REVIEW]: "Em Revisão",
    [TaskStatus.COMPLETED]: "Concluída",
    [TaskStatus.ARCHIVED]: "Arquivada",
    [TaskStatus.CANCELLED]: "Cancelada",
};
exports.TaskStatusColors = {
    [TaskStatus.PENDING]: "#FFA500",
    [TaskStatus.IN_PROGRESS]: "#3B82F6",
    [TaskStatus.IN_REVIEW]: "#8B5CF6",
    [TaskStatus.COMPLETED]: "#22C55E",
    [TaskStatus.ARCHIVED]: "#6B7280",
    [TaskStatus.CANCELLED]: "#EF4444",
};
