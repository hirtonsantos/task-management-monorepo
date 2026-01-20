import { render, screen } from "@testing-library/react"
import { KPICard } from "@/components/features/analytics/kpi-card"
import { CheckCircle2 } from "lucide-react"

describe("KPICard", () => {
  it("renders title and value correctly", () => {
    render(<KPICard title="Total Tasks" value={42} icon={CheckCircle2} />)

    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("displays positive trend", () => {
    render(<KPICard title="Completed" value={100} icon={CheckCircle2} trend={15} />)

    expect(screen.getByText("15%")).toBeInTheDocument()
    expect(screen.getByText("vs último período")).toBeInTheDocument()
  })

  it("displays negative trend", () => {
    render(<KPICard title="Pending" value={50} icon={CheckCircle2} trend={-10} />)

    expect(screen.getByText("10%")).toBeInTheDocument()
  })

  it("displays description when provided", () => {
    render(<KPICard title="Score" value={85} icon={CheckCircle2} description="Based on multiple factors" />)

    expect(screen.getByText("Based on multiple factors")).toBeInTheDocument()
  })
})
