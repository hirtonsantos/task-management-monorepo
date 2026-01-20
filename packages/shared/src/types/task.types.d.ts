import type { TaskStatus, Priority } from "../enums";
import type { User } from "./user.types";
import type { Category } from "./category.types";
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags: string[];
    categoryId?: string;
    category?: Category;
    userId: string;
    user?: User;
    assigneeId?: string;
    assignee?: User;
    parentTaskId?: string;
    subtasks?: Task[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    archivedAt?: Date;
}
export interface TaskSummary {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date;
    tags: string[];
}
export interface TaskStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
}
//# sourceMappingURL=task.types.d.ts.map