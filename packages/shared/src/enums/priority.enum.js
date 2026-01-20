"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityOrder = exports.PriorityColors = exports.PriorityLabels = exports.Priority = void 0;
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
exports.PriorityLabels = {
    [Priority.LOW]: "Baixa",
    [Priority.MEDIUM]: "Média",
    [Priority.HIGH]: "Alta",
    [Priority.URGENT]: "Urgente",
};
exports.PriorityColors = {
    [Priority.LOW]: "#22C55E",
    [Priority.MEDIUM]: "#3B82F6",
    [Priority.HIGH]: "#F59E0B",
    [Priority.URGENT]: "#EF4444",
};
exports.PriorityOrder = {
    [Priority.LOW]: 1,
    [Priority.MEDIUM]: 2,
    [Priority.HIGH]: 3,
    [Priority.URGENT]: 4,
};
