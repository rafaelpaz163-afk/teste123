# DEPLOY NO VERCEL - MONOREPO (experimentalServices)

## 🎯 NOVO: Vercel experimentalServices

O Vercel agora suporta **múltiplos serviços** em um único projeto usando `experimentalServices` no `vercel.json` raiz.

Isso permite:
- ✅ Frontend e Backend no **mesmo projeto Vercel**
- ✅ Rotas automáticas (`/` → frontend, `/api` → backend)
- ✅ Deploy único para todo o sistema
- ✅ Compartilhamento de variáveis de ambiente

---

## 📁 Estrutura do Projeto (Monorepo)

```
vet-clinic-ai/
├── vercel.json          ← Configuração raiz (experimentalServices)
├── package.json         ← Workspaces config
├── frontend/            ← React + Vite
│   ├── vercel.json      ← (não necessário, herda do raiz)
│   ├── package.json
│   └── src/
└── backend/             ← Node.js + Express
    ├── vercel.json      ← Configuração do serviço
    ├── package.json
    └── src/
        ├── server-vercel.ts
        └── api/
            └── cron.ts
```

---

## 🚀 DEPLOY EM 3 PASSOS

### Passo 1: Preparar o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vetclinic-ai.git
cd vet-clinic-ai

# Instalar dependências do monorepo
npm install

# Configurar backend para Vercel
cd backend
mv package-vercel.json package.json
mv src/server-vercel.ts src/server.ts
mv src/services/aiService-vercel.ts src/services/aiService.ts
mv src/services/whatsappService-vercel.ts src/services/whatsappService.ts
cd ..

# Configurar frontend
# Já está configurado com VITE_API_URL=/api (relativo)
```

### Passo 2: Configurar Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings > Environment Variables**:

```env
# === BANCO DE DADOS ===
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/vetclinic?schema=public

# === OPENAI ===
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4o-mini

# === JWT ===
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres

# === WHATSAPP (Evolution API - rodando em VPS separado) ===
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

# === FRONTEND ===
VITE_API_URL=/api
```

### Passo 3: Deploy

```bash
# Deploy único do monorepo
vercel --prod
```

O Vercel vai:
1. Detectar o `vercel.json` raiz com `experimentalServices`
2. Fazer build do frontend (Vite) em `/`
3. Fazer build do backend (Node.js) em `/api`
4. Configurar rotas automáticas

---

## 🔧 COMO FUNCIONA O experimentalServices

### vercel.json (Raiz)
```json
{
  "version": 2,
  "experimentalServices": {
    "frontend": {
      "root": "frontend",        // Pasta do frontend
      "routePrefix": "/",        // Acessível em /
      "framework": "vite"        // Framework detectado
    },
    "backend": {
      "root": "backend",         // Pasta do backend
      "routePrefix": "/api"      // Acessível em /api
    }
  }
}
```

### Rotas Automáticas
| URL | Serviço | Descrição |
|-----|---------|-----------|
| `https://seu-projeto.vercel.app/` | Frontend | React App |
| `https://seu-projeto.vercel.app/dashboard` | Frontend | Dashboard |
| `https://seu-projeto.vercel.app/api/health` | Backend | Health check |
| `https://seu-projeto.vercel.app/api/auth/login` | Backend | Login |
| `https://seu-projeto.vercel.app/api/webhooks/evolution` | Backend | Webhook WhatsApp |

---

## 🗄️ BANCO DE DADOS (Neon PostgreSQL)

### 1. Criar conta gratuita
- Acesse [neon.tech](https://neon.tech)
- Crie um projeto
- Copie a **Connection String**

### 2. Rodar Migrations
```bash
# Localmente (com DATABASE_URL apontando para Neon)
npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull .env
npx prisma migrate deploy
```

### 3. Seed (dados iniciais)
```bash
npx tsx backend/src/utils/seed.ts
```

---

## 📱 WHATSAPP (Evolution API)

A Evolution API **precisa rodar fora do Vercel** (não é serverless).

### Opção 1: Railway (Mais Fácil - $5/mês)
1. Acesse [railway.app](https://railway.app)
2. Deploy do template Evolution API
3. Configure variáveis de ambiente
4. Copie a URL pública

### Opção 2: VPS (DigitalOcean, Linode, AWS)
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

### Configurar Webhook
1. Acesse o painel: `http://seu-vps:8080/manager`
2. Crie instância "vetclinic"
3. Configure webhook:
   - **URL**: `https://seu-projeto.vercel.app/api/webhooks/evolution`
   - **Events**: `messages.upsert`, `connection.update`
4. Escaneie QR Code com WhatsApp

---

## 💰 CUSTOS (Monorepo Vercel)

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| **Vercel** (Frontend + Backend) | **Hobby (Free)** | **$0** |
| **Neon PostgreSQL** | **Free Tier** | **$0** (até 500MB) |
| **OpenAI API** | Pay-per-use | **~$10-50** |
| **Evolution API** | VPS/Railway | **$5-20** |
| **TOTAL** | | **$15-70/mês** |

> **Dica**: Comece 100% grátis! Só pague pela Evolution API (VPS) e uso da OpenAI.

---

## ⚡ LIMITAÇÕES DO VERCEL (Hobby/Free)

| Métrica | Hobby | Pro ($20/mês) |
|---------|-------|---------------|
| Cold starts | 500ms-2s | 100ms |
| Max execution | 5 min | 13 min |
| Payload max | 4.5MB | 4.5MB |
| Concurrent | 1000 | Ilimitado |
| Bandwidth | 100GB/mês | 1TB/mês |
| Cron jobs | ❌ Não | ✅ Sim |

> **Nota**: Cron jobs (backup automático, verificação de leads) só funcionam no plano Pro. No Hobby, você precisa executar manualmente ou usar serviço externo.

---

## 🔄 ALTERNATIVA SEM CRON (Hobby)

Se estiver no plano Hobby (sem cron jobs), você pode:

### 1. Executar manualmente via API
```bash
# Verificar leads sem resposta
curl https://seu-projeto.vercel.app/api/cron?type=no-response

# Verificar leads perdidos
curl https://seu-projeto.vercel.app/api/cron?type=lost-leads

# Limpar conversas inativas
curl https://seu-projeto.vercel.app/api/cron?type=cleanup
```

### 2. Usar serviço externo de cron
- [Cron-Job.org](https://cron-job.org) (Grátis)
- [UptimeRobot](https://uptimerobot.com) (Grátis)
- Configurar para chamar seus endpoints a cada 6 horas

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@prisma/client'"
```bash
# Adicionar ao package.json do backend:
"postinstall": "prisma generate"
```

### Erro: "Database connection timeout"
- Verifique se a DATABASE_URL está correta
- No Neon, vá em **Settings > Connection** e habilite "Allow connections from anywhere"
- Adicione `?connect_timeout=30` na URL

### Erro: "Function timed out"
- Aumente no Vercel: **Settings > Functions > Function Max Duration**
- Ou upgrade para Pro (13 min)

### Erro: "Payload too large"
- Vercel limita uploads a 4.5MB
- Para arquivos maiores, use Supabase Storage ou S3

---

## 📞 SUPORTE

- **Vercel Docs**: https://vercel.com/docs
- **Vercel experimentalServices**: https://vercel.com/docs/concepts/monorepos
- **Neon**: https://neon.tech/docs
- **Evolution API**: https://github.com/EvolutionAPI/evolution-api
- **Prisma**: https://prisma.io/docs
