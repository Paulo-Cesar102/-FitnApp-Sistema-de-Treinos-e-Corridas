# 📱 FitnApp - Sistema de Gerenciamento de Academia

## 🎯 Visão Geral das Novas Funcionalidades

Este documento descreve todas as novas funcionalidades implementadas para permitir que academias gerenciem seus personals, alunos, check-ins, rankings e comunicados.

---

## ✨ Funcionalidades Implementadas

### 1️⃣ **Gestão de Personals da Academia**

**Objetivo:** Permitir que academias cadastrem e gerenciem seus personals.

#### Modelos de Dados
- `GymPersonal` - Perfil do personal vinculado à academia
- `GymPersonalStudent` - Relação entre personal e alunos
- `GymPersonalChat` - Chats de suporte do personal

#### Endpoints Principais
```
POST   /api/gym/personal/create              - Criar novo personal
GET    /api/gym/personal/:personalId         - Obter dados do personal
GET    /api/gym/personal/user/:userId        - Obter personal por usuário
GET    /api/gym/gym/:gymId/personals         - Listar personals da academia
PUT    /api/gym/personal/:personalId         - Atualizar perfil do personal
DELETE /api/gym/personal/:personalId         - Deletar personal
```

#### Funcionalidades
- ✅ Criar perfil com especialização e certificações
- ✅ Gerenciar alunos atribuídos ao personal
- ✅ Criar chats de suporte com alunos
- ✅ Visualizar histórico de comunicação

---

### 2️⃣ **Sistema de Check-in**

**Objetivo:** Registrar presença dos membros na academia e gerar rankings.

#### Modelos de Dados
- `CheckIn` - Registro de presença com timestamps e bonificação de XP

#### Endpoints Principais
```
POST   /api/gym/checkin                     - Realizar check-in
GET    /api/gym/checkin/:userId/:gymId      - Histórico de check-ins
GET    /api/gym/checkin/gym/:gymId          - Check-ins da academia
GET    /api/gym/checkin/count/:gymId        - Contagem de check-ins hoje
GET    /api/gym/checkin/streak/:userId/:gymId - Streak/sequência
GET    /api/gym/checkin/monthly/:userId/:gymId - Check-ins do mês
```

#### Funcionalidades
- ✅ Um check-in por usuário por dia
- ✅ Sistema de streak (sequência de dias)
- ✅ Bonificação de XP por check-in (10 XP + 5 por dia de streak)
- ✅ Atualização automática de ranking

---

### 3️⃣ **Sistema de Avisos/Comunicados (Announcements)**

**Objetivo:** Permitir que personals/admins enviem avisos gerais para a academia.

#### Modelos de Dados
- `GymAnnouncement` - Avisos com prioridade (0=normal, 1=importante, 2=urgente)

#### Endpoints Principais
```
POST   /api/gym/announcement                     - Criar aviso
GET    /api/gym/announcement/:announcementId     - Obter aviso específico
GET    /api/gym/announcement/gym/:gymId          - Listar avisos (paginado)
PUT    /api/gym/announcement/:announcementId     - Atualizar aviso
DELETE /api/gym/announcement/:announcementId     - Deletar aviso
GET    /api/gym/announcement/urgent/:gymId       - Listar avisos urgentes
```

#### Funcionalidades
- ✅ 3 níveis de prioridade
- ✅ Suporte a imagem
- ✅ Paginação
- ✅ Ordenação por prioridade e data
- ✅ Filtro de avisos urgentes

---

### 4️⃣ **Sistema de Ranking da Academia**

**Objetivo:** Criar um ranking dos membros mais ativos na academia.

#### Modelos de Dados
- `GymRanking` - Posição, XP ganhado e check-ins por membro

#### Endpoints Principais
```
GET    /api/gym/ranking/:gymId                  - Ranking completo
GET    /api/gym/ranking/:gymId/top10            - Top 10
GET    /api/gym/ranking/:userId/:gymId          - Dados do usuário
GET    /api/gym/ranking/:userId/:gymId/position - Posição do usuário
GET    /api/gym/ranking/:gymId/stats            - Estatísticas gerais
```

#### Funcionalidades
- ✅ Atualização automática após check-in
- ✅ Ordenação por XP total
- ✅ Rastreamento de último check-in
- ✅ Estatísticas gerais da academia

---

## 🏗️ Arquitetura

```
Backend Structure:
├── src/
│   ├── controller/
│   │   ├── GymPersonalController.ts
│   │   ├── CheckInController.ts
│   │   ├── GymAnnouncementController.ts
│   │   └── GymRankingController.ts
│   ├── services/
│   │   ├── GymPersonalService.ts
│   │   ├── CheckInService.ts
│   │   ├── GymAnnouncementService.ts
│   │   └── GymRankingService.ts
│   ├── repository/
│   │   ├── GymPersonalRepository.ts
│   │   ├── CheckInRepository.ts
│   │   ├── GymAnnouncementRepository.ts
│   │   └── GymRankingRepository.ts
│   └── routes/
│       └── GymRoutes.ts (expandido)
└── prisma/
    ├── schema.prisma (atualizado)
    └── migrations/
        └── 20260424035415_add_gym_management_features
```

---

## 🔄 Fluxo de Operações

### Fluxo de Check-in
```
1. Usuário realiza check-in
   ↓
2. Sistema verifica se já fez check-in hoje
   ↓
3. Calcula streak (dias consecutivos)
   ↓
4. Calcula XP bonus (10 + 5 * diasDeStreak)
   ↓
5. Cria registro de CheckIn
   ↓
6. Atualiza GymRanking
   ↓
7. Atualiza XP do usuário
   ↓
8. Reposiciona ranking
```

### Fluxo de Gerenciamento de Personal
```
1. Dono de academia cria personal
   ↓
2. Role do usuário muda para PERSONAL
   ↓
3. Personal pode gerenciar alunos
   ↓
4. Personal pode criar chats de suporte
   ↓
5. Sistema rastreia comunicação
```

---

## 📝 Exemplo de Uso Prático

### Criar um Personal
```bash
POST /api/gym/personal/create
{
  "userId": "user123",
  "gymId": "gym456",
  "specialization": "Musculação",
  "bio": "Sou especialista em ganho de massa",
  "certifications": ["CREF-123", "Crossfit Level 1"]
}
```

### Atribuir Aluno ao Personal
```bash
POST /api/gym/personal/student/assign
{
  "personalId": "personal123",
  "studentId": "student456"
}
```

### Realizar Check-in
```bash
POST /api/gym/checkin
{
  "userId": "user123",
  "gymId": "gym456"
}

Resposta:
{
  "message": "Check-in realizado com sucesso!",
  "checkIn": {
    "id": "checkin123",
    "userId": "user123",
    "gymId": "gym456",
    "checkedInAt": "2026-04-24T10:30:00Z",
    "streakBonus": 20  // 10 (base) + 5 (1º dia) + 5 (2º dia)
  }
}
```

### Criar Aviso
```bash
POST /api/gym/announcement
{
  "title": "Manutenção dos equipamentos",
  "content": "A academia estará fechada no domingo para manutenção",
  "gymId": "gym456",
  "createdBy": "personal123",
  "priority": 2,  // Urgente
  "imageUrl": "https://..."
}
```

### Obter Ranking Top 10
```bash
GET /api/gym/ranking/gym456/top10

Resposta:
[
  {
    "position": 1,
    "user": { "name": "João", "level": 15 },
    "checkInCount": 45,
    "totalXpGained": 2250,
    "lastCheckedIn": "2026-04-24T08:00:00Z"
  },
  // ... mais 9 usuários
]
```

---

## 🔐 Autenticação e Permissões

- ✅ Todos os endpoints requerem `authMiddleware`
- ✅ Personals só podem gerenciar seus próprios alunos
- ✅ Admins da academia podem criar avisos e personals
- ✅ Usuários podem ver apenas seu próprio ranking

---

## 📊 Banco de Dados

### Novas Tabelas
- `GymPersonal` - Perfis de personals
- `GymPersonalStudent` - Relação N:N entre personals e alunos
- `GymPersonalChat` - Associação entre chats e personals
- `CheckIn` - Registros de presença
- `GymAnnouncement` - Avisos da academia
- `GymRanking` - Ranking dos membros

---

## 🚀 Próximos Passos

1. **Integração com API Externa** (ver `INTEGRATION_GUIDE.md`)
2. **Notificações em Tempo Real** (WebSockets)
3. **Sistema de Badges** (baseado em check-ins)
4. **Relatórios de Frequência**
5. **Integração com Pagamentos**

---

## 🛠️ Desenvolvimento Local

### Preparar Ambiente
```bash
cd backend
npm install
npx prisma migrate dev --name "add_gym_management_features"
```

### Testar Endpoints
```bash
# Com Postman/Insomnia
- Usar base URL: http://localhost:3000/api/gym
- Adicionar header: Authorization: Bearer <token>
```

---

## 📚 Referências

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Desenvolvido em:** 24 de Abril de 2026  
**Versão:** 1.0.0
