export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_LIMIT = 10;
export declare const MAX_LIMIT = 100;
export declare const CACHE_TTL: {
    readonly SHORT: 60;
    readonly MEDIUM: 300;
    readonly LONG: 3600;
    readonly DAY: 86400;
};
export declare const QUEUES: {
    readonly NOTIFICATIONS: "notifications";
    readonly EMAILS: "emails";
    readonly TASKS: "tasks";
    readonly AUDIT: "audit";
};
export declare const EVENTS: {
    readonly TASK_CREATED: "task.created";
    readonly TASK_UPDATED: "task.updated";
    readonly TASK_DELETED: "task.deleted";
    readonly TASK_COMPLETED: "task.completed";
    readonly TASK_ASSIGNED: "task.assigned";
    readonly USER_REGISTERED: "user.registered";
    readonly USER_LOGGED_IN: "user.logged_in";
};
export declare const VALIDATION: {
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly NAME_MIN_LENGTH: 2;
    readonly NAME_MAX_LENGTH: 100;
    readonly TITLE_MIN_LENGTH: 3;
    readonly TITLE_MAX_LENGTH: 200;
    readonly DESCRIPTION_MAX_LENGTH: 5000;
    readonly TAGS_MAX_COUNT: 10;
    readonly TAG_MAX_LENGTH: 50;
};
//# sourceMappingURL=index.d.ts.map