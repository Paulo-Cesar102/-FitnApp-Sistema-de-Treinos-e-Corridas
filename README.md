# Projeto Final

# 🏃‍♂️ Fitness App - Sistema de Treinos e Corridas

Aplicação completa focada em treinos, corridas e interação social entre usuários.
O projeto permite que usuários acompanhem sua evolução, participem de corridas e interajam com amigos dentro da plataforma.

---

##  Funcionalidades

### Usuário

* ✅ Cadastro e login com autenticação JWT
* ✅ Senhas criptografadas com bcrypt
* Perfil com estatísticas de treino
* Sistema de experiência (XP)
* Sistema de badges (conquistas)
* Acompanhamento de progresso

### Corridas

* 🚧 Sistema de corridas em desenvolvimento
* Será implementado na versão mobile com React Native
* Futuro suporte a:

  * Rastreamento por GPS
  * Ranking por dia, semana e mês
  * Histórico de corridas

### Treinos

* Criação de rotinas personalizadas
* Sistema onde o usuário pode montar seus próprios treinos
* Lista de exercícios por categoria
* Organização completa de treinos

###  Sistema de Amizades

* Enviar solicitação de amizade
* Aceitar / Recusar pedidos
* Listar amigos
* Listar pedidos pendentes

###  Social (Planejado)

* Chat em tempo real entre usuários
* Envio de treinos personalizados para amigos (futuro)

---

##  Tecnologias Utilizadas

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT (autenticação)
* Bcrypt (criptografia de senha)

### Frontend (em evolução)

* React / React Native
* Zustand (gerenciamento de estado)

---

## Estrutura do Projeto

```id="3x9eho"
backend/
 ├── src/
 │   ├── controllers/
 │   ├── routes/
 │   ├── services/
 │   └── server.ts
 ├── prisma/
 │   ├── schema.prisma
 │   └── seed.js
```

---

##  Instalação e Execução

###  Pré-requisitos

* Node.js instalado
* Banco de dados PostgreSQL configurado
* npm ou yarn

### Clonar o projeto

```id="1b9rsy"
git clone https://github.com/seu-usuario/seu-repo.git
```

### Instalar dependências

```id="r89oqh"
cd backend
npm install
```

### Configurar banco (Prisma)

```id="v4k6v5"
npx prisma migrate dev
```

### Rodar seed

```id="h2h7o6"
node prisma/seed.js
```

### Rodar servidor

```id="t5r9vd"
npm run dev
```

---

## Rotas da API (Amizades)

| Método | Rota             | Descrição           |
| ------ | ---------------- | ------------------- |
| POST   | /friends/request | Enviar solicitação  |
| POST   | /friends/accept  | Aceitar solicitação |
| POST   | /friends/reject  | Recusar solicitação |
| GET    | /friends         | Listar amigos       |
| GET    | /friends/pending | Listar pendentes    |

---

## Conceitos Aplicados

* Arquitetura em camadas (Controller, Service)
* ORM com Prisma
* Banco de dados relacional (PostgreSQL)
* Autenticação com JWT
* Criptografia de senhas com bcrypt
* Gerenciamento de estado com Zustand
* Separação entre frontend e backend
* Sistema relacional (usuários, amigos, exercícios)

---

## Funcionalidades Futuras

* 📍 Sistema de GPS para rastreamento de corridas em tempo real
* 🏆 Torneios com premiação
* 🧑‍🤝‍🧑 Corridas em equipe (modo Duo)
* 💰 Sistema de pagamentos
* 📊 Dashboard com gráficos
* 🌙 Tema dark/light
* 📱 App mobile completo (React Native)
* 💬 Compartilhamento de treinos entre amigos via chat
* 🥇 Ranking por XP:

  * Semanal
  * Mensal
  * Anual

---

## Autor

Desenvolvido por:

Paulo César(Frontend e Backend)
Lucas (Backend)
Fernando(Frontend)
Gabriel(Frontend)
---

## Status do Projeto

Em desenvolvimento

---

## Observações

O sistema de corridas será implementado na fase mobile utilizando React Native, aproveitando recursos nativos como GPS para rastreamento preciso.

A autenticação já está implementada utilizando JWT e bcrypt, garantindo segurança no acesso dos usuários.

O sistema de progressão com XP e badges será utilizado para aumentar o engajamento dos usuários, com rankings competitivos planejados para diferentes períodos.

Este projeto faz parte da evolução prática em desenvolvimento full stack, com foco em aplicações reais e escaláveis.

---
