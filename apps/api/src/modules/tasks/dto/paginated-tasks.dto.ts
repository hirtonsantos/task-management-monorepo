import { ApiProperty } from "@nestjs/swagger"
import { Task } from "@task-app/database"

export class PaginationMeta {
  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number

  @ApiProperty()
  totalPages!: number

  @ApiProperty()
  hasNextPage!: boolean

  @ApiProperty()
  hasPreviousPage!: boolean
}

export class PaginatedTasksDto {
  @ApiProperty({ type: [Task] })
  items!: Task[]

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta
}
