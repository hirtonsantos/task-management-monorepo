import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import type { User } from "@task-app/database"

export const CurrentUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext): User | any => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as User

  return data ? user?.[data] : user
})
