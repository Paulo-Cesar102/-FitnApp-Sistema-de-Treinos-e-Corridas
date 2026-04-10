import { api } from "./api";

// 🔥 CATÁLOGO
export const getCatalogWorkouts = async () => {
  const response = await api.get("/workouts/catalog");
  return response.data;
};

// 🔥 USUÁRIO
export const getUserWorkouts = async () => {
  const response = await api.get("/workouts/user");
  return response.data;
};

// 🔥 EXERCÍCIOS (FALTAVA ESSE)
export const getExercises = async () => {
  const response = await api.get("/exercises");
  return response.data;
};

// 🔥 CRIAR
export const createPersonalWorkout = async (workoutData: any) => {
  const response = await api.post("/workouts", workoutData);
  return response.data;
};

// 🔥 DELETE
export const deleteWorkout = async (id: string) => {
  const response = await api.delete(`/workouts/${id}`);
  return response.data;
};