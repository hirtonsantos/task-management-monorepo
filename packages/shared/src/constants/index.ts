// Pagination defaults
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const

// Queue names
export const QUEUES = {
  NOTIFICATIONS: "notifications",
  EMAILS: "emails",
  TASKS: "tasks",
  AUDIT: "audit",
} as const

// Event names
export const EVENTS = {
  TASK_CREATED: "task.created",
  TASK_UPDATED: "task.updated",
  TASK_DELETED: "task.deleted",
  TASK_COMPLETED: "task.completed",
  TASK_ASSIGNED: "task.assigned",
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
} as const

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 10,
  TAG_MAX_LENGTH: 50,
} as const
