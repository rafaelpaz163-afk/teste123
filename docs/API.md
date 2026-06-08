# DOCUMENTAÇÃO DA API

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Todas as rotas (exceto login) requerem Bearer Token no header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /auth/login` - Login
- `POST /auth/register` - Registrar usuário (Admin)
- `GET /auth/me` - Dados do usuário logado
- `POST /auth/logout` - Logout
- `GET /auth/users` - Listar usuários (Admin)
- `PUT /auth/users/:id` - Atualizar usuário (Admin)

### Conversas
- `GET /conversations` - Listar conversas
- `GET /conversations/stats` - Estatísticas
- `GET /conversations/:id` - Detalhes da conversa
- `POST /conversations/:id/messages` - Enviar mensagem
- `POST /conversations/:id/takeover` - Assumir atendimento
- `POST /conversations/:id/return-ai` - Devolver para IA
- `POST /conversations/:id/close` - Encerrar conversa

### Tutores
- `GET /tutors` - Listar tutores
- `GET /tutors/:id` - Detalhes do tutor
- `POST /tutors` - Criar tutor
- `PUT /tutors/:id` - Atualizar tutor
- `DELETE /tutors/:id` - Remover tutor (Admin)

### Pets
- `GET /pets` - Listar pets
- `POST /pets` - Criar pet
- `PUT /pets/:id` - Atualizar pet
- `DELETE /pets/:id` - Remover pet (Admin)

### Agendamentos
- `GET /appointments` - Listar agendamentos
- `GET /appointments/stats` - Estatísticas
- `POST /appointments` - Criar agendamento
- `PUT /appointments/:id` - Atualizar status

### Base de Conhecimento
- `GET /knowledge-base` - Listar itens
- `POST /knowledge-base` - Criar item manual
- `POST /knowledge-base/upload` - Upload de arquivo
- `PUT /knowledge-base/:id` - Atualizar item
- `DELETE /knowledge-base/:id` - Remover item (Admin)

### Serviços
- `GET /services` - Listar serviços
- `POST /services` - Criar serviço (Admin)
- `PUT /services/:id` - Atualizar serviço (Admin)
- `DELETE /services/:id` - Remover serviço (Admin)

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais

### Configurações da IA
- `GET /ai-config/status` - Status da IA
- `PUT /ai-config/status` - Atualizar configurações
- `POST /ai-config/toggle` - Ligar/Desligar IA

### Relatórios
- `GET /reports/conversations` - Relatório de conversas
- `GET /reports/appointments` - Relatório de agendamentos
- `GET /reports/performance` - Performance da IA

### Leads
- `GET /leads` - Listar leads
- `GET /leads/export` - Exportar leads (CSV)
- `POST /leads/:id/recover` - Recuperar lead

### Emergências
- `GET /emergencies` - Listar emergências
- `POST /emergencies/:id/resolve` - Resolver emergência

### Backups
- `GET /backups` - Listar backups
- `POST /backups` - Criar backup
- `POST /backups/:id/restore` - Restaurar backup

### Webhooks
- `POST /webhooks/evolution` - Webhook Evolution API
- `POST /webhooks/evolution/status` - Status webhook

### WhatsApp
- `GET /whatsapp/status` - Status da conexão
- `POST /whatsapp/send` - Enviar mensagem
- `POST /whatsapp/send-group` - Enviar para grupo
