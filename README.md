# Task Management - Enterprise Monorepo

Sistema enterprise de gestão de tarefas construído com **Turborepo**, **NestJS**, **Next.js** e **TypeORM**.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- Docker e Docker Compose

### Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>
cd task-management

# 2. Instale as dependências do projeto
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# ⚠️ Edite o arquivo .env caso seja necessário ajustar alguma variável

#4. Faça o build do projeto (Obrigatório)
pnpm build

#5. Rodar testes do front
cd apps/web
pnpm web

#6. Rodar testes do backend
cd apps/api
pnpm test:e2e

# 7. Inicialize os serviços necessários via Docker Compose
# Inclui PostgreSQL, Redis e RabbitMQ, sem necessidade de dependências externas
docker compose up

# 8. Execute o projeto em modo de desenvolvimento
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

## Test credentials (Docker Compose rodando)

- **Admin:** admin@taskapp.com / admin123
- **User:**  demo@taskapp.com / user123

## 📚 Documentação

- [API Docs](http://localhost:3001/api/docs) - Swagger/OpenAPI
- [Storybook](http://localhost:6006) - Design System
