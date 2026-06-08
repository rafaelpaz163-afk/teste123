# DEPLOY NO VERCEL - MONOREPO (PLANO HOBBY/GRÁTIS)

## ⚠️ Limitação do Plano Hobby: 1 Cron Job por Dia

O Vercel Hobby permite **apenas 1 cron job por dia** (a cada 24h).

**Solução**: Consolidamos TODAS as tarefas em **1 único cron job** que roda às 3h da manhã.

---

## 🚀 DEPLOY EM 3 PASSOS (100% GRÁTIS)

### Passo 1: Preparar o Projeto

```bash
# Clone
git clone https://github.com/seu-usuario/vetclinic-ai.git
cd vet-clinic-ai

# Instalar dependências
npm install

# Configurar backend para Vercel
cd backend
mv package-vercel.json package.json
mv src/server-vercel.ts src/server.ts
mv src/services/aiService-vercel.ts src/services/aiService.ts
mv src/services/whatsappService-vercel.ts src/services/whatsappService.ts
cd ..

# Configurar frontend (já está pronto)
# VITE_API_URL=/api (relativo - funciona automaticamente)
```

### Passo 2: Configurar Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings > Environment Variables**:

```env
# === BANCO DE DADOS (Neon - Grátis) ===
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/vetclinic?schema=public

# === OPENAI ===
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4o-mini

# === JWT (mínimo 32 caracteres) ===
JWT_SECRET=sua-chave-super-secreta-com-no-minimo-32-caracteres

# === WHATSAPP (Evolution API - VPS separado) ===
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-evolution
EVOLUTION_INSTANCE=vetclinic

# === MENSAGENS DA IA ===
AI_GREETING=Olá! Seja bem-vindo(a) à nossa clínica veterinária. Como posso ajudar você e seu pet hoje?
AI_FALLBACK_MESSAGE=Não encontrei essa informação em nossa base. Um recepcionista dará continuidade ao atendimento em breve.
EMERGENCY_MESSAGE=Seu caso pode exigir atendimento veterinário imediato. Recomendamos procurar uma clínica ou hospital veterinário o mais rápido possível.

# === CONFIGURAÇÕES DE LEADS ===
NO_RESPONSE_HOURS=48
FOLLOW_UP_HOURS=24

# === FRONTEND (já configurado) ===
VITE_API_URL=/api
```

### Passo 3: Deploy

```bash
# 1 comando só!
vercel --prod
```

O Vercel vai:
1. Detectar o `vercel.json` raiz com `experimentalServices`
2. Fazer build do **frontend** (Vite) → servido em `/`
3. Fazer build do **backend** (Node.js) → servido em `/api`
4. Configurar **1 cron job** que roda às 3h da manhã

---

## ⏰ CRON JOB (1 por dia - Plano Hobby)

### O que roda às 3h da manhã (todos os dias):

```
/api/cron?type=all
```

**Tarefas executadas em sequência:**

| # | Tarefa | Descrição |
|---|--------|-----------|
| 1 | **Limpar conversas inativas** | Encerra conversas sem atividade há 2+ dias |
| 2 | **Verificar leads sem resposta** | Marca leads inativos há 48h como "Sem Resposta" |
| 3 | **Verificar leads perdidos** | Marca leads com follow-up expirado como "Perdido" |
| 4 | **Registrar backup** | Atualiza timestamp do último backup |

### Resposta do Cron:
```json
{
  "success": true,
  "timestamp": "2026-06-09T03:00:00.000Z",
  "results": {
    "cleanup": { "success": true, "cleaned": 5 },
    "noResponse": { "success": true, "updated": 3 },
    "lostLeads": { "success": true, "updated": 1 },
    "backup": { "success": true, "timestamp": "2026-06-09T03:00:00.000Z" }
  }
}
```

---

## 🔄 SOLUÇÕES ALTERNATIVAS (Se precisar de mais frequência)

### Opção A: Cron-Job.org (Grátis)
Se precisar rodar mais de 1x por dia, use serviço externo:

1. Acesse [cron-job.org](https://cron-job.org) (100% grátis)
2. Crie um novo job
3. URL: `https://seu-projeto.vercel.app/api/cron?type=all`
4. Frequência: A cada 6 horas (ou o que precisar)
5. **Desative o cron do Vercel** (remova do vercel.json)

### Opção B: UptimeRobot (Grátis)
1. Acesse [uptimerobot.com](https://uptimerobot.com)
2. Adicione monitor HTTP(s)
3. URL: `https://seu-projeto.vercel.app/api/cron?type=all`
4. Intervalo: 30 minutos (plano gratuito)
5. Configure alerta para chamar URL quando necessário

### Opção C: GitHub Actions (Grátis)
Crie `.github/workflows/cron.yml`:

```yaml
name: Daily Cron Job
on:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X GET "https://seu-projeto.vercel.app/api/cron?type=all"
```

---

## 🗄️ BANCO DE DADOS (Neon PostgreSQL - Grátis)

### 1. Criar conta
- Acesse [neon.tech](https://neon.tech)
- Crie conta (gratuita)
- Crie projeto "vetclinic"

### 2. Copiar Connection String
```
postgresql://user:password@host.neon.tech:5432/vetclinic?schema=public
```

### 3. Rodar Migrations (antes do deploy)
```bash
# Localmente
export DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/vetclinic?schema=public
npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull .env
npx prisma migrate deploy
```

### 4. Seed (dados iniciais)
```bash
npx tsx backend/src/utils/seed.ts
```

---

## 📱 WHATSAPP (Evolution API - VPS/Railway)

A Evolution API **precisa rodar fora do Vercel** (não é serverless).

### Opção 1: Railway (Mais Fácil - $5/mês)
1. Acesse [railway.app](https://railway.app)
2. Deploy do template "Evolution API"
3. Configure variáveis:
   ```
   SERVER_URL=https://sua-api.railway.app
   AUTHENTICATION_API_KEY=sua-chave-secreta
   DATABASE_ENABLED=true
   DATABASE_PROVIDER=postgresql
   DATABASE_CONNECTION_URI=postgresql://user:pass@neon-host:5432/vetclinic?schema=evolution
   ```
4. Copie a URL pública (ex: `https://sua-api.up.railway.app`)

### Opção 2: VPS (DigitalOcean, Linode)
```bash
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
  -e CACHE_REDIS_ENABLED=false \
  atendai/evolution-api:latest
```

### Configurar Webhook no Evolution API
1. Acesse: `https://sua-evolution-api.com/manager`
2. Crie instância "vetclinic"
3. Vá em **Webhooks**:
   - **URL**: `https://seu-projeto.vercel.app/api/webhooks/evolution`
   - **Events**: `messages.upsert`, `connection.update`
4. Escaneie QR Code com WhatsApp Business

---

## 🏗️ ARQUITETURA COMPLETA (Hobby/Grátis)

```
┌─────────────────────────────────────────────┐
│           VERCEL (Hobby - $0)               │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │   FRONTEND      │  │    BACKEND      │   │
│  │   React + Vite  │  │   Node.js       │   │
│  │   /             │  │   /api          │   │
│  │   (Grátis)      │  │   (Grátis)      │   │
│  └─────────────────┘  └─────────────────┘   │
│           │                    │             │
│           └────────┬───────────┘             │
│                    │                          │
│         ┌──────────┴──────────┐               │
│         │   CRON (1x/dia)     │               │
│         │   03:00 - Tarefas   │               │
│         │   diárias           │               │
│         └───────────────────────┘               │
└─────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │   NEON (Grátis)     │
         │   PostgreSQL        │
         │   500MB limit       │
         └─────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───┴───┐    ┌─────┴─────┐    ┌────┴────┐
│OPENAI │    │EVOLUTION  │    │CRON-JOB │
│API     │    │API        │    │.org     │
│(Pago)  │    │(VPS $5)   │    │(Grátis) │
└────────┘    └───────────┘    └─────────┘
```

---

## 💰 CUSTO TOTAL (Plano Hobby/Grátis)

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| **Vercel** (Frontend + Backend + 1 Cron) | **Hobby** | **$0** |
| **Neon PostgreSQL** | **Free Tier** | **$0** (500MB) |
| **OpenAI API** | Pay-per-use | **~$10-50** |
| **Evolution API** | Railway/VPS | **$5-20** |
| **Cron-Job.org** (opcional) | Grátis | **$0** |
| **TOTAL** | | **$15-70/mês** |

> **Comece 100% grátis!** Só pague pela Evolution API (VPS) e uso da OpenAI.

---

## ⚡ LIMITAÇÕES DO HOBBY (e soluções)

| Limitação | Solução |
|-----------|---------|
| 1 Cron job/dia | Use Cron-Job.org (grátis, ilimitado) |
| Cold start 500ms-2s | Upgrade para Pro ($20/mês) ou aceite |
| Max execution 5 min | Quebre tarefas em partes menores |
| Payload 4.5MB | Use Supabase Storage para uploads grandes |
| 1000 req/concurrent | Suficiente para clínica veterinária |

---

## 🐛 TROUBLESHOOTING

### Erro: "Hobby accounts are limited to daily cron jobs"
**Solução**: Já resolvido! Usamos apenas 1 cron job que faz tudo.

### Erro: "Function timed out"
**Solução**: O cron job foi otimizado para rodar em < 5 minutos (limite Hobby).

### Erro: "Database connection failed"
```bash
# Verifique se o Neon permite conexões externas
# Neon Dashboard > Settings > Connection > Allow connections from anywhere
# Ou adicione o IP do Vercel na whitelist
```

### Erro: "Prisma Client could not locate the Query Engine"
```bash
# Adicione ao package.json do backend:
"postinstall": "prisma generate"
```

---

## 📞 SUPORTE

- **Vercel Docs**: https://vercel.com/docs
- **Vercel experimentalServices**: https://vercel.com/docs/concepts/monorepos
- **Neon**: https://neon.tech/docs
- **Evolution API**: https://github.com/EvolutionAPI/evolution-api
- **Prisma**: https://prisma.io/docs
- **Cron-Job.org**: https://cron-job.org
