import { render, screen } from "@testing-library/react"
import { TaskCard } from "@/components/features/tasks/task-card"
import { Task } from "@/lib/api/tasks.service"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

describe("TaskCard", () => {
  const mockOnComplete = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    status: "PENDING",
    priority: "HIGH",
    userId: "user-1",
    dueDate: "2026-01-20T00:00:00.000Z",
    tags: ["test", "unit"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders task title and description", () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText("Test Task")).toBeInTheDocument()
    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })

  it("renders status and priority badges", () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText("Pendente")).toBeInTheDocument()
    expect(screen.getByText("Alta")).toBeInTheDocument()
  })

  it("renders due date", () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    const expectedDate = format(
      new Date(mockTask.dueDate),
      "dd 'de' MMM",
      { locale: ptBR },
    )

    expect(screen.getByText(expectedDate)).toBeInTheDocument()
  })

  it("renders tags correctly", () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText("test, unit")).toBeInTheDocument()
  })
})
