# FLUXO DE ATENDIMENTO - DOCUMENTAÇÃO

## 1. Início do Atendimento

### Cliente envia primeira mensagem
```
Cliente: "Oi, boa tarde!"
```

### IA responde com saudação
```
IA: "Olá! Seja bem-vindo(a) à nossa clínica veterinária. 
Como posso ajudar você e seu pet hoje?"
```

## 2. Identificação da Necessidade

### Consulta de preço
```
Cliente: "Quanto custa a consulta?"
IA: "A consulta clínica possui valor de R$ 120,00. 
Caso deseje, posso iniciar seu pré-cadastro para agendamento."
```

### Vacinação
```
Cliente: "Quero vacinar meu cachorro"
IA: "Perfeito! Temos disponíveis:
- Vacina V8/V10: R$ 85,00
- Vacina Antirrábica: R$ 60,00

Qual vacina você deseja aplicar?"
```

### Emergência
```
Cliente: "Meu cachorro foi atropelado e não consegue levantar"
IA: "Seu caso pode exigir atendimento veterinário imediato. 
Recomendamos procurar uma clínica ou hospital veterinário 
o mais rápido possível."

[ALERTA ENVIADO PARA GRUPO DE RECEPCIONISTAS]
```

## 3. Pré-Cadastro para Agendamento

### Coleta de dados do tutor
```
IA: "Para realizar o pré-cadastro, preciso de alguns dados:

Nome completo: _____
CPF: _____
Telefone: _____
Email: _____"
```

### Coleta de dados do pet
```
IA: "Agora os dados do seu pet:

Nome: _____
Espécie (cão/gato): _____
Raça: _____
Sexo: _____
Idade: _____"
```

### Confirmação
```
IA: "Perfeito! Recebemos seu cadastro. Nossa equipe já foi 
notificada e em breve um recepcionista entrará em contato 
para finalizar seu agendamento."
```

## 4. Notificação para Equipe

### Mensagem no grupo de recepcionistas
```
🚨 NOVO AGENDAMENTO PENDENTE

📌 Dados do Tutor
Nome: João Silva
CPF: 123.456.789-00
Telefone: (11) 99999-9999

🐾 Dados do Pet
Nome: Rex
Espécie: Cão
Raça: Labrador

📅 Atendimento
Serviço Desejado: Consulta
Melhor Horário: Tarde

Status: AGUARDANDO CONTATO DA RECEPÇÃO
Data e Hora do Cadastro: 08/06/2026 14:30
```

## 5. Intervenção Humana

### Recepcionista assume atendimento
```
[Recepcionista clica "Assumir Atendimento" no painel]

IA: "Vou transferir você para um de nossos recepcionistas. 
Um momento, por favor..."

Recepcionista: "Olá! Sou a Maria, recepcionista da clínica. 
Vi que você quer agendar uma consulta para o Rex. 
Temos disponibilidade amanhã às 10h ou 15h. Qual prefere?"
```

### Devolver para IA
```
[Recepcionista clica "Devolver para IA"]

IA: "Olá novamente! Posso ajudar com mais alguma informação?"
```

## 6. Casos de Emergência

### Detecção automática
Palavras-chave que ativam emergência:
- "não está respirando"
- "atropelado"
- "convulsão"
- "sangramento intenso"
- "envenenamento"
- "não consegue levantar"
- "desmaiou"
- "inconsciente"
- "dificuldade para respirar"

### Resposta da IA
```
IA: "Seu caso pode exigir atendimento veterinário imediato. 
Recomendamos procurar uma clínica ou hospital veterinário 
o mais rápido possível."
```

### Alerta automático
- Mensagem enviada para grupo de emergências
- Notificação push para recepcionistas online
- Marcação no painel como "EMERGÊNCIA"

## 7. Classificação de Leads

### Interessado
- Solicita informações
- Pergunta valores
- Demonstra interesse geral

### Pronto para Agendar
- Solicita horários
- Aceita orçamento
- Solicita cadastro
- Status: "PRONTO PARA AGENDAMENTO"

### Sem Resposta
- Não responde após 48h (configurável)
- Adicionado em lista de acompanhamento

### Perdido
- Recebeu orçamento
- Não agendou
- Não respondeu posteriormente
- Adicionado em lista de recuperação

## 8. Limitações do Agente

O agente NUNCA pode:
- ❌ Fazer diagnósticos médicos
- ❌ Prescrever medicamentos
- ❌ Indicar dosagens
- ❌ Alterar prontuários
- ❌ Garantir horários específicos
- ❌ Inventar preços ou serviços
- ❌ Inventar informações médicas
- ❌ Prometer resultados de tratamentos

Sempre encaminha casos complexos para um humano.
