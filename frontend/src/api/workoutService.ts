import { api } from "./api";

// CATALOGO (Treinos prontos da academia)
export const getCatalogWorkouts = async () => {
  const response = await api.get("/workouts/catalog");
  return response.data;
};

// USUARIO (Treinos personalizados do aluno)
export const getUserWorkouts = async (userId?: string) => {
  const url = userId ? `/workouts/user/${userId}` : "/workouts/user";
  const response = await api.get(url);
  return response.data;
};

// EXERCICIOS
export const getExercises = async () => {
  const response = await api.get("/exercises");
  return response.data;
};

// CRIAR NOVO TREINO
export const createPersonalWorkout = async (workoutData: { name: string; userId?: string; exercises: any[] }) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

// CONCLUIR TREINO INTEIRO
export const completeWorkout = async (workoutId: string) => {
  const response = await api.post("/workouts/complete", { workoutId });
  return response.data;
};

// CONCLUIR APENAS UM EXERCICIO
export const completeExercise = async (workoutId: string, exerciseId: string) => {
  const response = await api.post("/workouts/complete-exercise", { 
    workoutId, 
    exerciseId 
  });
  return response.data;
};

// ESTATISTICAS: Distribuicao de grupos musculares
export const getFocusStats = async () => {
  const response = await api.get("/workouts/stats/focus");
  return response.data;
};

// ESTATISTICAS: Treinos realizados na semana
export const getWeeklyStats = async () => {
  const response = await api.get("/workouts/stats/weekly");
  return response.data;
};

// DELETE
export const deleteWorkout = async (id: string) => {
  await api.delete(`/workouts/${id}`);
};

export const workoutService = {
  getCatalogWorkouts,
  getUserWorkouts,
  getExercises,
  createPersonalWorkout,
  completeWorkout,
  completeExercise,
  getFocusStats,
  getWeeklyStats,
  deleteWorkout,
};
