import { api } from "./api";

// 🔥 CATÁLOGO (Treinos prontos da academia)
export const getCatalogWorkouts = async () => {
  const response = await api.get("/workouts/catalog");
  return response.data;
};

// 🔥 USUÁRIO (Treinos personalizados do aluno)
export const getUserWorkouts = async () => {
  const response = await api.get("/workouts/user");
  return response.data;
};

// 🔥 EXERCÍCIOS
export const getExercises = async () => {
  const response = await api.get("/exercises");
  return response.data;
};

// 🔥 CRIAR NOVO TREINO
export const createPersonalWorkout = async (workoutData: { name: string; exercises: any[] }) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

// 🔥 CONCLUIR TREINO INTEIRO (O que faz o foguinho subir!)
export const completeWorkout = async (workoutId: string) => {
  const response = await api.post("/workouts/complete", { workoutId });
  // Retorna { message, xpGained, newXp, newLevel, streak, newBadges }
  return response.data;
};

// 🔥 CONCLUIR APENAS UM EXERCÍCIO
export const completeExercise = async (workoutId: string, exerciseId: string) => {
  const response = await api.post("/workouts/complete-exercise", { 
    workoutId, 
    exerciseId 
  });
  return response.data;
};

// 🔥 ESTATÍSTICAS: Distribuição de grupos musculares (Gráfico de Pizza)
export const getFocusStats = async () => {
  const response = await api.get("/workouts/stats/focus");
  return response.data;
};

// 🔥 ESTATÍSTICAS: Treinos realizados na semana (Gráfico de Barras)
export const getWeeklyStats = async () => {
  const response = await api.get("/workouts/stats/weekly");
  return response.data;
};

// 🔥 DELETE
export const deleteWorkout = async (id: string) => {
  // Nota: No seu controller, o delete retorna 204 (No Content), 
  // então não haverá response.data aqui.
  await api.delete(`/workouts/${id}`);
};