# 🐾 VetClinic AI - Agente de IA para Clínica Veterinária via WhatsApp

Sistema completo de atendimento automatizado via WhatsApp para clínica veterinária, com IA integrada, painel administrativo, gestão de leads, identificação de emergências e muito mais.

## 🚀 DEPLOY RÁPIDO (3 PASSOS - 100% GRÁTIS)

```bash
# 1. Clone e configure
git clone https://github.com/seu-usuario/vetclinic-ai.git
cd vet-clinic-ai
npm install

# 2. Configure variáveis no Vercel Dashboard
# (Neon DB, OpenAI, JWT, Evolution API)

# 3. Deploy (1 comando!)
vercel --prod
```

---

## ✨ Funcionalidades

### 🤖 Atendimento Automatizado (IA)
- **Saudação inicial** personalizada
- **Respostas inteligentes** com base de conhecimento
- **Orçamentos automáticos** com tabela de preços
- **Pré-cadastro** de tutores e pets
- **Identificação de emergências** (20+ palavras-chave)
- **Classificação de leads** automática
- **Fallback humano** quando não sabe responder

### 📱 Painel Administrativo (Web)
- **Dashboard** em tempo real
- **Gestão de conversas** (assumir, devolver, encerrar)
- **Cadastro de tutores e pets**
- **Agendamentos** com notificação automática
- **Base de conhecimento** (upload + treinamento manual)
- **Relatórios** exportáveis (Excel, CSV, PDF)
- **Leads e recuperação** de vendas
- **Alertas de emergência**
- **Modo supervisor** com score de qualidade
- **Backup automático**
- **Logs de auditoria**
- **Controle de acesso** (Admin/Recepcionista)

---

## 🏗️ Arquitetura (Vercel Hobby - Grátis)

```
┌─────────────────────────────────────────────┐
│           VERCEL (Hobby - $0)               │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │   FRONTEND      │  │    BACKEND      │   │
│  │   React + Vite  │  │   Node.js       │   │
│  │   /             │  │   /api          │   │
│  └─────────────────┘  └─────────────────┘   │
│           │                    │             │
│           └────────┬───────────┘             │
│         ┌──────────┴──────────┐               │
│         │   CRON (1x/dia)     │               │
│         │   03:00 - Tarefas   │               │
│         └─────────────────────┘               │
└─────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │   NEON (Grátis)     │
         │   PostgreSQL        │
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

## 📁 Estrutura do Projeto

```
vet-clinic-ai/
├── vercel.json              ← Monorepo config (experimentalServices)
├── package.json             ← Workspaces
├── frontend/                ← React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/           ← Dashboard, Conversas, Tutores...
│   │   ├── components/      ← Layout, Sidebar, Chat...
│   │   ├── hooks/           ← React Query hooks
│   │   ├── store/           ← Zustand auth
│   │   ├── services/        ← API client
│   │   └── types/           ← TypeScript types
│   └── package.json
├── backend/                 ← Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/     ← Lógica dos endpoints
│   │   ├── routes/          ← Definição de rotas
│   │   ├── services/        ← IA, WhatsApp, Backup...
│   │   ├── middleware/      ← Auth, logs, erros
│   │   ├── utils/           ← Validadores, seed...
│   │   └── server-vercel.ts ← Entry point serverless
│   ├── prisma/
│   │   └── schema.prisma    ← Modelo de dados
│   └── package.json
└── docs/                    ← Documentação completa
    ├── DEPLOY_VERCEL_HOBBY.md  ⭐ GUIA COMPLETO (recomendado)
    ├── DEPLOY.md               ← Docker completo
    ├── API.md                  ← Documentação da API
    ├── FLUXO_ATENDIMENTO.md    ← Fluxo completo
    └── ESPECIFICACAO_TECNICA.md
```

---

## 🚀 Deploy Options

### ⭐ Opção 1: Vercel Monorepo Hobby (Recomendado - GRÁTIS)
- Frontend + Backend no mesmo projeto
- 1 cron job por dia (consolidado)
- Veja `docs/DEPLOY_VERCEL_HOBBY.md` ⭐

### Opção 2: Docker Completo
- Tudo em containers (Redis, filas, backup)
- Veja `docs/DEPLOY.md`

---

## 💰 Custo Estimado (Vercel Hobby)

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| **Vercel** (Frontend + Backend + Cron) | **Hobby** | **$0** |
| **Neon PostgreSQL** | **Free Tier** | **$0** (500MB) |
| **OpenAI API** | Pay-per-use | **~$10-50** |
| **Evolution API** | Railway/VPS | **$5-20** |
| **Cron-Job.org** (opcional) | Grátis | **$0** |
| **TOTAL** | | **$15-70/mês** |

> Comece 100% grátis! Só pague pela Evolution API (VPS) e uso da OpenAI.

---

## 📝 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para clínicas veterinárias**
