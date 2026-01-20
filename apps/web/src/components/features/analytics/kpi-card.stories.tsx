import { DollarSign, Users, Activity } from 'lucide-react'
import { KPICard } from './kpi-card'

const meta = {
  title: 'Components/KPICard',
  component: KPICard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    trend: { control: 'number' },
    description: { control: 'text' },
    className: { control: false },
    icon: { control: false },
  },
}

export default meta

export const Default = {
  args: {
    title: 'Receita',
    value: 'R$ 12.430',
    icon: DollarSign,
  },
}

export const PositiveTrend = {
  args: {
    title: 'Usuários ativos',
    value: 1280,
    icon: Users,
    trend: 12.4,
    description: 'Crescimento em relação ao mês anterior',
  },
}

export const NegativeTrend = {
  args: {
    title: 'Churn',
    value: '4.2%',
    icon: Activity,
    trend: -2.1,
    description: 'Aumento de cancelamentos',
  },
}

export const WithoutDescription = {
  args: {
    title: 'Sessões',
    value: 8450,
    icon: Activity,
    trend: 3.8,
  },
}

export const GridExample = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <KPICard title="Receita" value="R$ 12.430" icon={DollarSign} trend={8.2} />
      <KPICard title="Usuários" value={1280} icon={Users} trend={12.4} />
      <KPICard title="Churn" value="4.2%" icon={Activity} trend={-2.1} />
    </div>
  ),
}
