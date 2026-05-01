# GymClub - Sistema Inteligente de Alta Performance

O **GymClub** é uma plataforma full-stack avançada projetada para transformar a experiência de treinamento e gestão de academias. Combinando inteligência artificial, gamificação e ferramentas de gestão B2B, o sistema oferece uma solução completa para alunos, instrutores e proprietários de unidades fitness.

---

## Diferenciais Estratégicos

*   **Smart Coach AI:** Integração com inteligência artificial para análise biomecânica em tempo real, fornecendo instruções técnicas de execução, segurança e posicionamento.
*   **Analytics de Precisão:** Gráficos detalhados de distribuição de foco por grupos musculares primários, evolução de carga e métricas semanais de constância.
*   **Gamificação V3:** Sistema de progressão com XP, níveis dinâmicos, conquistas (badges) raras e rankings competitivos entre membros da mesma unidade.
*   **Ecossistema Gym Management:** Ferramentas dedicadas para donos de academia e personais, incluindo check-ins automatizados, anúncios da unidade e prescrição remota de treinos.

---

## Funcionalidades Principais

### Para o Aluno (User Experience)
*   **Execução de Treino V3:** Interface otimizada para mobile com suporte a gestos (swipe), cronômetros circulares inteligentes e navegação intuitiva.
*   **Evolução e Perfil:** Dashboard completo com histórico de peso, meta de objetivos e galeria de conquistas.
*   **Social Hub:** Sistema de amizades, chat em tempo real via WebSockets e compartilhamento instantâneo de rotinas de treino.

### Para a Academia (B2B Features)
*   **Gestão de Check-ins:** Controle de frequência com sistema de bônus de XP por sequência (streaks).
*   **Comunicação Direta:** Mural de avisos e comunicados da academia com priorização de mensagens.
*   **Suporte de Personais:** Chat dedicado para suporte entre instrutores e alunos matriculados.

---

## Roadmap e Visão de Futuro

O projeto está em constante evolução, com as seguintes funcionalidades em fase de planejamento e desenvolvimento:

### Expansão Mobile & Outdoor
*   **Rastreamento via GPS:** Sistema nativo para monitoramento de corridas e atividades ao ar livre em tempo real.
*   **Modo Duo e Equipes:** Funcionalidades sociais avançadas para treinos e corridas em conjunto.
*   **Integração com Wearables:** Suporte para smartwatches e dispositivos de monitoramento cardíaco.

### Competição e Economia
*   **Torneios e Eventos:** Organização de competições internas entre alunos da mesma academia com premiações automatizadas.
*   **Sistema de Pagamentos:** Integração de gateway para mensalidades e marketplace de produtos da unidade.
*   **Rankings Expandidos:** Filtros globais, regionais e por categoria de XP (Semanal, Mensal e Anual).

---

## Tech Stack

### Backend (Core)
*   **Linguagem:** Node.js com TypeScript
*   **Framework:** Express
*   **ORM:** Prisma
*   **Banco de Dados:** PostgreSQL
*   **Real-time:** Socket.io (Eventos e Chat)
*   **Segurança:** JWT (Stateless Auth) & Bcrypt

### Frontend (Web)
*   **Linguagem:** React (JavaScript/TypeScript)
*   **Estilização:** Vanilla CSS (Custom Properties & Glassmorphism)
*   **Gráficos:** Recharts (Data Visualization)
*   **Comunicação:** Axios

---

## Arquitetura e Padrões

*   **Service Layer Pattern:** Lógica de negócio isolada para reaproveitamento entre controllers.
*   **Repository Pattern:** Abstração da camada de dados para facilitar testes e trocas de ORM/Banco.
*   **Responsive Design:** Foco absoluto em "Mobile First", garantindo experiência fluida em qualquer dispositivo.
*   **Real-time Synchronization:** Sincronização de estado entre cliente e servidor via WebSockets.

---

## Guia de Instalação

### Pré-requisitos
*   Node.js (v18+)
*   Docker (ou instância local do PostgreSQL)

### Passos Rápidos
1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/seu-usuario/fitnapp-gymclub.git
    ```
2.  **Configuração de Ambiente:**
    Crie um arquivo `.env` na pasta `backend/` seguindo o modelo `.env.example`.
3.  **Instale as Dependências:**
    ```bash
    npm install
    ```
4.  **Banco de Dados:**
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
5.  **Inicie o Servidor:**
    ```bash
    npm run dev
    ```

---

## Equipe de Desenvolvimento

*   Paulo César, Lucas, Fernando, Gabriel.

---

## Status do Projeto
**Fase Atual:** Expansão das capacidades de Inteligência Artificial e estruturação do módulo de GPS.

---
*Este projeto demonstra competências avançadas em desenvolvimento Full Stack, UI/UX Design e integração de Inteligência Artificial em produtos digitais.*
