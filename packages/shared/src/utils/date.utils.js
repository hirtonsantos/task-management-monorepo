"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOverdue = isOverdue;
exports.getDaysUntilDue = getDaysUntilDue;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.formatRelativeTime = formatRelativeTime;
function isOverdue(dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
}
function getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
function formatDate(date, locale = "pt-BR") {
    return new Date(date).toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
function formatDateTime(date, locale = "pt-BR") {
    return new Date(date).toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function formatRelativeTime(date, locale = "pt-BR") {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = (target.getTime() - now.getTime()) / 1000;
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
    ];
    for (const [unit, seconds] of units) {
        if (Math.abs(diffInSeconds) >= seconds) {
            const value = Math.round(diffInSeconds / seconds);
            return rtf.format(value, unit);
        }
    }
    return rtf.format(0, "second");
}
