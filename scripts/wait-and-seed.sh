#!/bin/sh
set -e

echo "=== Instalando dependências do sistema ==="
apt-get update && apt-get install -y python3 make g++ postgresql-client

echo "=== Instalando pnpm globalmente ==="
npm install -g pnpm

echo "=== Instalando dependências do projeto ==="
CI=true pnpm install --frozen-lockfile

# ===========================================
# Criar arquivo .env completo no pacote e na raiz
# ===========================================
echo "=== Criando arquivos .env completos ==="
cat > /app/packages/database/.env << EOF
# Database
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskdb
NODE_ENV=development

# Redis
REDIS_HOST=taskredis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://taskredis:6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=taskuser
RABBITMQ_PASSWORD=taskpass
RABBITMQ_URL=amqp://taskuser:taskpass@localhost:5672

# JWT / Auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
API_PORT=3001
API_PREFIX=api/v1

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
EOF

cat > /app/.env << EOF
# Database
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskdb
NODE_ENV=development

# Redis
REDIS_HOST=taskredis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://taskredis:6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=taskuser
RABBITMQ_PASSWORD=taskpass
RABBITMQ_URL=amqp://taskuser:taskpass@localhost:5672

# JWT / Auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
API_PORT=3001
API_PREFIX=api/v1

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
EOF

echo "=== Debug: Variáveis de ambiente ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "POSTGRES_HOST: $POSTGRES_HOST"
echo "POSTGRES_PORT: $POSTGRES_PORT"
echo "==================================="

# ===========================================
# Aguardar PostgreSQL
# ===========================================
echo "=== Aguardando PostgreSQL ficar disponível ==="
until pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB; do
  echo "PostgreSQL ainda não está pronto - aguardando..."
  sleep 2
done

echo "✅ PostgreSQL está pronto!"

# ===========================================
# Teste de conexão direta
# ===========================================
echo "=== Testando conexão direta ao banco ==="
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 'Conexão OK!' as status;"

# ===========================================
# Build do TypeScript
# ===========================================
echo "=== Compilando TypeScript ==="
cd /app/packages/database
pnpm build

# ===========================================
# Rodar migrations
# ===========================================
echo "=== Rodando migrations ==="
npx typeorm migration:run -d dist/data-source.js || echo "⚠️ Nenhuma migration para rodar ou erro"

# ===========================================
# Limpar dados existentes (mantém estrutura)
# ===========================================
echo "=== Limpando dados existentes ==="
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB << 'EOF' || echo "⚠️ Limpeza falhou ou tabelas não existem"
DO $$ 
BEGIN
  -- Desabilita foreign keys temporariamente
  EXECUTE 'SET session_replication_role = replica';
  
  -- Limpa todas as tabelas se existirem
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
    TRUNCATE TABLE tasks CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
    TRUNCATE TABLE categories CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    TRUNCATE TABLE users CASCADE;
  END IF;
  
  -- Reabilita foreign keys
  EXECUTE 'SET session_replication_role = DEFAULT';
END $$;
EOF

# ===========================================
# Rodar seeds
# ===========================================
echo "=== Executando seeds ==="
node dist/seeds/dev-seed.js

echo "✨ Seeds concluídos com sucesso!"