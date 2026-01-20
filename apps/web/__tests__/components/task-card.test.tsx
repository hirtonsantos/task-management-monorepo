import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import { TaskCard } from "@/components/features/tasks/task-card"

const mockTask = {
  id: "1",
  title: "Test Task",
  description: "Test Description",
  status: "PENDING",
  priority: "HIGH",
  dueDate: new Date().toISOString(),
  tags: ["test", "unit"],
  userId: "user-1",
  categoryId: undefined,
  category: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe("TaskCard", () => {
  const mockOnComplete = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders task information correctly", () => {
    render(<TaskCard task={mockTask} onComplete={mockOnComplete} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText("Test Task")).toBeInTheDocument()
    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })

  it("displays priority badge", () => {
    render(<TaskCard task={mockTask} onComplete={mockOnComplete} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText("Alta")).toBeInTheDocument()
  })

  it("displays tags", () => {
    render(<TaskCard task={mockTask} onComplete={mockOnComplete} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const tags = screen.getByText(/test, unit/i)

    expect(tags).toHaveTextContent("test")
    expect(tags).toHaveTextContent("unit")
  })
})
