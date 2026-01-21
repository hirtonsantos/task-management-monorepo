#!/bin/sh
set -e

echo "Instalando dependências do sistema..."
apt-get update && apt-get install -y python3 make g++ postgresql-client

echo "Instalando pnpm..."
npm install -g pnpm

echo "Instalando dependências do projeto..."
pnpm install --no-optional

echo "🔧 Criando arquivo .env para o seed..."
cat > /app/packages/database/.env << EOF
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskdb
NODE_ENV=development
EOF

cat > /app/.env << EOF
DATABASE_URL=postgresql://taskuser:taskpass@postgres:5432/taskdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskdb
NODE_ENV=development
EOF

echo "=== DEBUG: Variáveis de ambiente ==="
echo "DATABASE_URL: $DATABASE_URL"
echo "POSTGRES_HOST: $POSTGRES_HOST"
echo "POSTGRES_PORT: $POSTGRES_PORT"
echo "==================================="

echo "Aguardando PostgreSQL ficar disponível..."
until pg_isready -h postgres -U taskuser -d taskdb; do
  echo "PostgreSQL ainda não está pronto - aguardando..."
  sleep 2
done

echo "✅ PostgreSQL está pronto!"

echo "🧪 Testando conexão direta ao banco..."
PGPASSWORD=taskpass psql -h postgres -U taskuser -d taskdb -c "SELECT 'Conexão OK!' as status;"

echo "📦 Rodando migrations..."
cd /app/packages/database
pnpm build
npx typeorm migration:run -d dist/data-source.js || echo "⚠️  Nenhuma migration para rodar ou erro"

echo "🌱 Executando seeds..."
cd /app
pnpm db:seed

echo "✨ Seeds concluídos com sucesso!"