# DEPLOY NO VERCEL - GUIA COMPLETO

## ⚠️ IMPORTANTE: Limitações do Vercel

O Vercel é **serverless** - otimizado para frontends. Para este projeto, algumas adaptações são necessárias:

### ✅ O que FUNCIONA no Vercel
- API REST completa (rotas, controllers, autenticação)
- Frontend React (deploy automático)
- Banco PostgreSQL (via Neon/Supabase)
- OpenAI API calls
- Webhooks (receber mensagens do WhatsApp)
- Cron jobs (Vercel Cron - plano Pro+)
- Upload de arquivos (limitado a 4.5MB)

### ❌ O que NÃO FUNCIONA no Vercel
- Redis/BullMQ (sem persistência entre requests)
- WebSockets (não suportado nativamente)
- Evolution API (precisa rodar em servidor dedicado)
- Processos background (sem filas persistentes)
- Backup automático (precisa de servidor dedicado)

---

## 🚀 PASSO A PASSO - DEPLOY BACKEND NO VERCEL

### 1. Preparação do Projeto
```bash
cd backend

# Renomear package.json para versão Vercel
mv package.json package-original.json
mv package-vercel.json package.json

# Renomear server.ts para versão Vercel
mv src/server.ts src/server-original.ts
mv src/server-vercel.ts src/server.ts

# Renomear serviços
mv src/services/aiService.ts src/services/aiService-original.ts
mv src/services/aiService-vercel.ts src/services/aiService.ts

mv src/services/whatsappService.ts src/services/whatsappService-original.ts
mv src/services/whatsappService-vercel.ts src/services/whatsappService.ts

# Instalar dependências
npm install
```

### 2. Configurar Banco de Dados (Neon PostgreSQL)
1. Acesse [Neon](https://neon.tech) e crie uma conta
2. Crie um novo projeto/banco
3. Copie a **Connection String** (ex: `postgresql://user:pass@host:5432/vetclinic?schema=public`)

### 3. Configurar Variáveis de Ambiente no Vercel
No dashboard do Vercel, vá em **Settings > Environment Variables**:

```
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/vetclinic?schema=public
OPENAI_API_KEY=sk-... (sua chave da OpenAI)
JWT_SECRET=super-secret-key-minimo-32-caracteres
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-evolution
EVOLUTION_INSTANCE=vetclinic
AI_GREETING=Olá! Seja bem-vindo(a) à nossa clínica veterinária. Como posso ajudar você e seu pet hoje?
AI_FALLBACK_MESSAGE=Não encontrei essa informação em nossa base. Um recepcionista dará continuidade ao atendimento em breve.
EMERGENCY_MESSAGE=Seu caso pode exigir atendimento veterinário imediato. Recomendamos procurar uma clínica ou hospital veterinário o mais rápido possível.
NO_RESPONSE_HOURS=48
FOLLOW_UP_HOURS=24
```

### 4. Deploy do Backend
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Deploy (primeira vez - vai criar o projeto)
vercel

# Deploy em produção
vercel --prod
```

### 5. Configurar Build no Vercel
No dashboard do Vercel:
1. Vá em **Settings > General**
2. Em **Build & Development Settings**:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 6. Rodar Migrations
```bash
# Localmente (com DATABASE_URL apontando para Neon)
npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull .env
npx prisma migrate deploy
```

---

## 🚀 DEPLOY DO FRONTEND NO VERCEL

### 1. Preparação
```bash
cd frontend

# Criar .env.local
VITE_API_URL=https://seu-backend.vercel.app/api
```

### 2. Deploy
```bash
vercel

# Ou deploy em produção
vercel --prod
```

O Vercel detecta automaticamente que é um projeto React/Vite e faz o deploy.

---

## 🔧 CONFIGURAR EVOLUTION API (FORA DO VERCEL)

A Evolution API **precisa rodar em servidor dedicado** porque:
- Mantém conexão persistente com WhatsApp
- Não funciona em ambiente serverless
- Precisa de WebSockets

### Opção 1: Railway (Mais Fácil)
1. Acesse [Railway](https://railway.app)
2. Deploy do template da Evolution API
3. Configure as variáveis de ambiente
4. Copie a URL gerada

### Opção 2: VPS (DigitalOcean, Linode, AWS EC2)
```bash
# SSH na VPS
ssh root@seu-vps

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Rodar Evolution API
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e SERVER_URL=http://seu-vps-ip:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-secreta \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=postgresql \
  -e DATABASE_CONNECTION_URI=postgresql://user:pass@neon-host:5432/vetclinic?schema=evolution \
  -e CACHE_REDIS_ENABLED=true \
  -e CACHE_REDIS_URI=redis://redis-host:6379 \
  atendai/evolution-api:latest
```

### 3. Configurar Webhook no Evolution API
1. Acesse o painel da Evolution API: `http://seu-vps:8080/manager`
2. Crie uma instância com nome "vetclinic"
3. Vá em **Webhooks** e configure:
   - **URL**: `https://seu-backend.vercel.app/api/webhooks/evolution`
   - **Events**: `messages.upsert`, `connection.update`
4. Escaneie o QR Code com seu WhatsApp Business

---

## 📋 ARQUITETURA NO VERCEL

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FRONTEND      │────▶│   BACKEND       │────▶│   EVOLUTION API │
│   (Vercel)      │     │   (Vercel)      │     │   (VPS/Railway) │
│   React App     │     │   Serverless    │     │   WhatsApp      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │   NEON/Supabase  │
         │              │   PostgreSQL     │
         │              └─────────────────┘
         │
         │              ┌─────────────────┐
         └─────────────▶│   OPENAI GPT-4  │
                        └─────────────────┘
```

---

## 💰 CUSTO ESTIMADO (VERCEL)

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| Vercel (Frontend) | Hobby (Free) | **$0** |
| Vercel (Backend) | Hobby (Free) | **$0** |
| Vercel Cron | Pro | $20 |
| Neon PostgreSQL | Free Tier | **$0** (até 500MB) |
| OpenAI API | Pay-per-use | **~$10-50** |
| Evolution API | VPS/Railway | **$5-20** |
| **TOTAL** | | **$35-90/mês** |

> **Dica**: Comece com o plano Hobby (gratuito) do Vercel. Se precisar de mais performance, upgrade para Pro ($20/mês).

---

## ⚡ PERFORMANCE NO VERCEL

| Métrica | Hobby | Pro |
|---------|-------|-----|
| Cold starts | 500ms-2s | 100ms |
| Max execution time | 5 min | 13 min |
| Max payload | 4.5MB | 4.5MB |
| Concurrent requests | 1000 | Ilimitado |
| Bandwidth | 100GB/mês | 1TB/mês |

---

## 🔄 ALTERNATIVA: DEPLOY COMPLETO COM DOCKER

Se precisar de **TODAS as funcionalidades** (Redis, filas, backup automático, etc.), use Docker em um VPS:

```bash
# VPS com 2GB RAM, 20GB SSD
docker-compose up -d
```

Veja `docs/DEPLOY.md` para instruções completas de deploy Docker.

---

## 🐛 TROUBLESHOOTING

### Erro: "Prisma Client could not locate the Query Engine"
```bash
# Adicionar ao package.json scripts:
"postinstall": "prisma generate"
```

### Erro: "Database connection failed"
- Verifique se a DATABASE_URL está correta
- Certifique-se que o Neon permite conexões externas
- Adicione o IP do Vercel na whitelist do Neon

### Erro: "Function timed out"
- Aumente o timeout no Vercel (Settings > Functions)
- Ou use plano Pro para 13 min

### Erro: "Payload too large"
- Vercel limita a 4.5MB
- Para uploads maiores, use serviço externo (S3, Supabase Storage)

---

## 📞 SUPORTE

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Evolution API**: https://github.com/EvolutionAPI/evolution-api
- **Prisma**: https://prisma.io/docs
