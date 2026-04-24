# Guia de Integração com API Externa de Treinos

## Visão Geral
Este guia explica como integrar treinos de uma API externa com o sistema da FitnApp.

## Estrutura Recomendada

### 1. Criar Interface para API Externa
```typescript
// src/services/ExternalWorkoutService.ts

export interface ExternalWorkoutDTO {
  id: string;
  name: string;
  description?: string;
  exercises: ExternalExerciseDTO[];
  category?: string;
}

export interface ExternalExerciseDTO {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: string;
}

export class ExternalWorkoutService {
  private apiUrl = process.env.EXTERNAL_WORKOUT_API_URL;
  private apiKey = process.env.EXTERNAL_WORKOUT_API_KEY;

  async fetchWorkoutById(workoutId: string): Promise<ExternalWorkoutDTO> {
    // Implementar chamada à API externa
  }

  async fetchWorkoutsByCategory(category: string): Promise<ExternalWorkoutDTO[]> {
    // Implementar chamada à API externa
  }

  async importWorkout(externalWorkout: ExternalWorkoutDTO, personalId: string): Promise<void> {
    // Mapear para treino local e salvar
  }
}
```

### 2. Adicionar Variáveis de Ambiente
```env
# .env
EXTERNAL_WORKOUT_API_URL=https://api.externa.com/workouts
EXTERNAL_WORKOUT_API_KEY=sua_chave_api
```

### 3. Endpoint para Importar Treino
```typescript
// Em PersonalService ou novo ImportService

async importExternalWorkout(externalWorkoutId: string, personalId: string) {
  // 1. Fetch workout da API externa
  // 2. Mapear exercises
  // 3. Criar UserWorkout no banco
  // 4. Associar ao personal
  // 5. Retornar workout criado
}
```

### 4. Route para Importação
```typescript
// Em GymRoutes.ts
gymRoutes.post(
  "/personal/:personalId/import-workout/:externalWorkoutId",
  authMiddleware,
  gymPersonalController.importExternalWorkout
);
```

## Exemplo de Integração (com API fictícia)

```typescript
import axios from "axios";

export class ExternalWorkoutService {
  private client = axios.create({
    baseURL: process.env.EXTERNAL_WORKOUT_API_URL,
    headers: {
      Authorization: `Bearer ${process.env.EXTERNAL_WORKOUT_API_KEY}`,
    },
  });

  async fetchWorkoutById(id: string) {
    const response = await this.client.get(`/workouts/${id}`);
    return response.data;
  }

  async searchWorkouts(query: string) {
    const response = await this.client.get("/workouts/search", {
      params: { q: query },
    });
    return response.data;
  }
}
```

## Mapeamento de Treinos

Quando receber dados da API externa:

1. **Criar exercícios locais** (se não existirem)
2. **Criar UserWorkout** com os exercícios
3. **Associar ao Personal** via GymPersonal

## Exemplo Completo

```typescript
async importWorkoutToGym(
  externalWorkoutId: string,
  personalId: string
): Promise<UserWorkout> {
  // 1. Obter dados da API externa
  const externalWorkout = await this.externalService.fetchWorkoutById(
    externalWorkoutId
  );

  // 2. Criar exercícios locais
  const exerciseIds = await Promise.all(
    externalWorkout.exercises.map((ex) =>
      this.createOrGetExercise({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
      })
    )
  );

  // 3. Criar treino
  const personal = await this.getPersonal(personalId);
  const workout = await this.workoutRepository.create({
    name: externalWorkout.name,
    userId: personal.userId,
    gymId: personal.gymId,
    exercises: exerciseIds,
  });

  return workout;
}
```

## Configuração Necessária

1. Instalar axios (se ainda não estiver): `npm install axios`
2. Adicionar variáveis de ambiente no `.env`
3. Implementar classe `ExternalWorkoutService`
4. Integrar ao `GymPersonalService` ou criar `ImportWorkoutService`
5. Adicionar rotas de importação

## Notas Importantes

- **Validação**: Sempre validar dados da API externa
- **Error Handling**: Tratar erros de conexão e dados inválidos
- **Rate Limiting**: Respeitar limites de requisições da API
- **Cache**: Considerar cachear treinos frequentemente usados
- **Autenticação**: Manter credenciais seguras em variáveis de ambiente
