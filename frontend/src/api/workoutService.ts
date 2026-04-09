import { api } from "./api";

// GET /exercises - Catálogo global da Home
export const getExercises = async () => {
  const response = await api.get("/exercises");
  return response.data;
};

// GET /workouts - Seus treinos salvos (Aba Treinos)
export const getWorkouts = async () => {
  const response = await api.get("/workouts");
  return response.data;
};

// POST /workouts - Criar novo treino
export const createPersonalWorkout = async (workoutData: any) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

// DELETE /workouts/:id - Deletar um treino específico
export const deleteWorkout = async (id: string) => {
  const response = await api.delete(`/workouts/${id}`);
  return response.data;
};