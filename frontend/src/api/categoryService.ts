import { api } from "./api";

export const getCategories = async () => {

  const response = await api.get("/categories");

  return response.data;

};

export const getExercises = async (id: string) => { // Mudei aqui
  const response = await api.get(`/categories/${id}/exercises`);
  return response.data;
};