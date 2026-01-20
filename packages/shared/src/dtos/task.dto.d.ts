import type { TaskStatus, Priority } from "../enums";
export interface CreateTaskDto {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string | Date;
    estimatedHours?: number;
    tags?: string[];
    categoryId?: string;
    assigneeId?: string;
    parentTaskId?: string;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string | Date;
    estimatedHours?: number;
    actualHours?: number;
    tags?: string[];
    categoryId?: string;
    assigneeId?: string;
}
export interface TaskFilterDto {
    status?: TaskStatus | TaskStatus[];
    priority?: Priority | Priority[];
    tags?: string[];
    categoryId?: string;
    assigneeId?: string;
    search?: string;
    dueDateFrom?: string | Date;
    dueDateTo?: string | Date;
    isOverdue?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "dueDate" | "priority" | "title" | "status";
    sortOrder?: "ASC" | "DESC";
}
export interface BulkUpdateTasksDto {
    ids: string[];
    status?: TaskStatus;
    priority?: Priority;
    categoryId?: string;
    assigneeId?: string;
}
export interface BulkDeleteTasksDto {
    ids: string[];
}
//# sourceMappingURL=task.dto.d.ts.map