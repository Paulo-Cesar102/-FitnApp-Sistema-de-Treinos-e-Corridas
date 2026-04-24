# 🧪 Guia de Testes - Academia FitnApp

## 🚀 Como Testar as Funcionalidades

### ✅ Pré-requisitos
- Backend rodando em `http://localhost:3000`
- Frontend rodando em `http://localhost:5173` (ou a porta do Vite)
- Usuário logado (com `userId` e `token` no localStorage)

---

## 📍 1. TESTAR CHECK-IN

**Acesso:** Menu → Academia → Aba "Check-in"

### Passo a Passo:
1. Cole um **ID de Academia** válido (ex: id de gym criada)
2. Clique em **"📍 Fazer Check-in"**
3. Veja a mensagem de sucesso
4. Aguarde carregar:
   - 🔥 Sequência de dias
   - 📊 Check-ins deste mês
   - 📜 Histórico (últimos 5)

### Testes Esperados:
- ✅ Primeira vez: streak = 1, XP = 10
- ✅ Segunda vez no mesmo dia: erro "Já fez check-in"
- ✅ Dia seguinte: streak = 2, XP = 15
- ✅ Dia N: streak = N, XP = 10 + (5*N)

---

## 🏆 2. TESTAR RANKING

**Acesso:** Menu → Academia → Aba "Ranking"

### Passo a Passo:
1. Cole **ID da Academia**
2. Clique em **"🔍 Carregar"**
3. Veja as estatísticas:
   - 👥 Total de membros
   - ✅ Total de check-ins
   - ⭐ Total XP ganhado
4. Veja **Sua Posição**
   - Número da posição
   - Seu total de check-ins
   - Seu total de XP
5. Clique em **"▲ Ver Top 10"** para expandir ranking

### Testes Esperados:
- ✅ Ranking atualizado após cada check-in
- ✅ Posição muda conforme XP
- ✅ Ordem por XP (decrescente)
- ✅ Medalhas 🥇 🥈 🥉 para top 3

---

## 📢 3. TESTAR AVISOS

**Acesso:** Menu → Academia → Aba "Avisos"

### Passo a Passo:
1. Cole **ID da Academia**
2. Clique em **"🔍 Carregar"**
3. Veja avisos existentes
4. Clique em **"➕ Novo Aviso"**
5. Preencha:
   - **Título:** "Manutenção dos equipamentos"
   - **Conteúdo:** "Academia fechada no domingo"
   - **Prioridade:** Normal / Importante / Urgente
6. Clique em **"💾 Criar"**
7. Veja o novo aviso na lista

### Testes Esperados:
- ✅ Avisos criados com sucesso
- ✅ Ordenação por prioridade (urgente primeiro)
- ✅ Paginação (próxima/anterior)
- ✅ Cores diferentes por prioridade
- ✅ Data/hora de criação

---

## 💪 4. TESTAR PERSONALS

**Acesso:** Menu → Academia → Aba "Personals"

### Passo a Passo:
1. Cole **ID da Academia**
2. Clique em **"🔍 Carregar"**
3. Veja personals existentes
4. Clique em **"➕ Novo Personal"**
5. Preencha:
   - **ID do Usuário:** ID válido de um usuário
   - **Especialização:** "Musculação"
   - **Bio:** "Especialista em ganho de massa"
6. Clique em **"💾 Criar"**
7. Novo personal aparece na lista

### Testes Esperados:
- ✅ Personal criado com sucesso
- ✅ Mostra número de alunos
- ✅ Mostra número de chats
- ✅ Pode deletar personal (✖️)
- ✅ Role do usuário muda para PERSONAL

---

## 🔗 ENDPOINTS PARA TESTAR COM POSTMAN/INSOMNIA

### Check-in
```
POST /api/gym/checkin
{
  "userId": "user123",
  "gymId": "gym456"
}

GET /api/gym/checkin/:userId/:gymId
GET /api/gym/checkin/streak/:userId/:gymId
GET /api/gym/checkin/monthly/:userId/:gymId
```

### Ranking
```
GET /api/gym/ranking/:gymId
GET /api/gym/ranking/:gymId/top10
GET /api/gym/ranking/:userId/:gymId
GET /api/gym/ranking/:gymId/stats
```

### Avisos
```
POST /api/gym/announcement
GET /api/gym/announcement/gym/:gymId?page=1&pageSize=10
POST /api/gym/announcement/:announcementId (DELETE)
```

### Personals
```
POST /api/gym/personal/create
GET /api/gym/gym/:gymId/personals
DELETE /api/gym/personal/:personalId
```

---

## 📊 DADOS DE TESTE RECOMENDADOS

### Academia (criar via POST /api/gym/register)
```json
{
  "name": "Academia Teste",
  "description": "Academia para testes",
  "address": "Rua Teste, 123",
  "email": "teste@academia.com",
  "pixKey": "12345678901234567890123456",
  "pixType": "CPF"
}
```

### Criar Multiple Check-ins para Testa Ranking
```
Dia 1: fazer check-in → XP = 10, Streak = 1
Dia 2: fazer check-in → XP = 15, Streak = 2
Dia 3: fazer check-in → XP = 20, Streak = 3
Dia 4: fazer check-in → XP = 25, Streak = 4
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Selecione uma academia"
- Cole um ID válido de academia (UUID)

### Erro: "Você já fez check-in hoje"
- Normal! Só 1 check-in por dia por usuário
- Teste amanhã ou com outro usuário

### Erro 401 Unauthorized
- Faça login primeiro
- Verifique se o token está no localStorage

### Erro 404 "Academia não encontrada"
- Verifique se a academia existe
- ID deve estar correto (UUID)

### Dados não aparecem
- Aguarde carregar os dados (botão verde)
- Verifique o console do navegador para erros

---

## 📱 FLUXO COMPLETO DE TESTE

```
1. Criar Academia (POST /api/gym/register)
2. Criar Personal (POST /api/gym/personal/create)
3. Fazer Check-in (POST /api/gym/checkin)
4. Ver Ranking (GET /api/gym/ranking/:gymId)
5. Criar Aviso (POST /api/gym/announcement)
6. Fazer mais Check-ins com usuários diferentes
7. Verificar ranking atualizado
8. Criar mais avisos com prioridades diferentes
```

---

## ✨ Pronto para Testar!

Acesse: `http://localhost:5173/academy`

Divirta-se! 🚀
