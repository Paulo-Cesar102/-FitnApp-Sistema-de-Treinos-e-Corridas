import { api } from "./api";

// GET /exercises - Lista exercícios para o catálogo da Home
export const getExercises = async () => {
  const response = await api.get("/exercises");
  return response.data;
};

// GET /exercises/:id/suggestion - Obtém sugestão de carga
export const getExerciseSuggestion = async (id: string) => {
  const response = await api.get(`/exercises/${id}/suggestion`);
  return response.data;
};

// GET /workouts - Lista os treinos do usuário (Troféu)
export const getWorkouts = async () => {
  const response = await api.get("/workouts");
  return response.data;
};

// POST /workouts - Cria um novo treino
export const createPersonalWorkout = async (workoutData: any) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

// DELETE /workouts/:id - Deleta um treino
export const deleteWorkout = async (id: string) => {
  const response = await api.delete(`/workouts/${id}`);
  return response.data;
};