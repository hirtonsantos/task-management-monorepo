# Task Management - Enterprise Monorepo

Sistema enterprise de gestão de tarefas construído com **Turborepo**, **NestJS**, **Next.js** e **TypeORM**.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- Docker e Docker Compose

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd task-management

# Instale as dependências
pnpm install

# Copie o arquivo de ambiente
cp .env.example .env

# Suba os serviços Docker
pnpm docker:up

# Execute as migrations
pnpm db:migrate

# (Opcional) Seed do banco
pnpm db:seed

# Inicie o desenvolvimento
pnpm dev
```

## 📁 Estrutura do Projeto

```
task-management/
├── apps/
│   ├── web/          # Next.js 14+ App Router
│   ├── api/          # NestJS REST API
│   └── worker/       # NestJS Worker (RabbitMQ)
├── packages/
│   ├── shared/       # Tipos, DTOs compartilhados
│   ├── ui/           # Design System React
│   ├── database/     # TypeORM entities, migrations
│   ├── config/       # Configs compartilhadas
│   └── utils/        # Utilitários
├── docker-compose.yml
└── turbo.json
```

## 🐳 Serviços Docker

| Serviço   | Porta  | Descrição              |
|-----------|--------|------------------------|
| PostgreSQL| 5432   | Banco de dados         |
| Redis     | 6379   | Cache e sessões        |
| RabbitMQ  | 5672   | Message broker         |
| RabbitMQ UI| 15672 | Interface de gestão    |

## 📜 Scripts Disponíveis

```bash
pnpm dev          # Inicia todos os apps em modo dev
pnpm build        # Build de produção
pnpm test         # Executa todos os testes
pnpm lint         # Linting
pnpm docker:up    # Sobe containers Docker
pnpm docker:down  # Para containers
pnpm docker:logs  # Logs dos containers
pnpm db:migrate   # Executa migrations
pnpm db:seed      # Seed do banco
```

## 🔐 Credenciais de Desenvolvimento

- **PostgreSQL:** taskuser / taskpass
- **RabbitMQ:** taskuser / taskpass (UI: http://localhost:15672)
- **Redis:** sem senha em dev

## 📚 Documentação

- [API Docs](http://localhost:3001/api/docs) - Swagger/OpenAPI
- [Storybook](http://localhost:6006) - Design System
