# GUIA DE DEPLOY

## Deploy com Docker (Recomendado)

### 1. Preparação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vetclinic-ai.git
cd vetclinic-ai

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais

# Configure o frontend
cp frontend/.env.example frontend/.env
```

### 2. Iniciar os serviços
```bash
docker-compose up -d
```

### 3. Executar migrations
```bash
docker-compose exec backend npx prisma migrate dev
```

### 4. Criar usuário admin e dados iniciais
```bash
docker-compose exec backend npx tsx src/utils/seed.ts
```

### 5. Configurar WhatsApp (Evolution API)
1. Acesse http://localhost:8080/manager
2. Crie uma nova instância com nome "vetclinic"
3. Configure o webhook para http://backend:3000/api/webhooks/evolution
4. Escaneie o QR Code com seu WhatsApp

### 6. Acessar o sistema
- **Painel Admin**: http://localhost
- **API**: http://localhost:3000
- **Evolution API**: http://localhost:8080

## Deploy em Produção (VPS/Cloud)

### Requisitos
- Ubuntu 20.04+ ou similar
- Docker e Docker Compose
- 2GB+ RAM
- 20GB+ disco

### Passos
1. Clone o repositório na VPS
2. Configure SSL com Let's Encrypt (certbot)
3. Configure o domínio no DNS
4. Atualize as variáveis de ambiente para produção
5. Execute `docker-compose up -d`
6. Configure o firewall (UFW)

### SSL com Nginx
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Backup Automático
O backup automático já está configurado via cron job no backend.
Para restaurar:
```bash
docker-compose exec backend npx tsx src/utils/restore.ts [backup-id]
```

## Variáveis de Ambiente Importantes

### Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/vetclinic
REDIS_URL=redis://host:6379
OPENAI_API_KEY=sk-...
JWT_SECRET=super-secret-key
EVOLUTION_API_URL=http://evolution:8080
EVOLUTION_API_KEY=your-key
```

### Frontend
```env
VITE_API_URL=https://api.seu-dominio.com/api
```

## Monitoramento
- Logs: `docker-compose logs -f backend`
- Status: `docker-compose ps`
- Restart: `docker-compose restart backend`
