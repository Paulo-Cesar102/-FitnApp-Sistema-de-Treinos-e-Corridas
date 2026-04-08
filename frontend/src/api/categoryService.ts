import { api } from "./api";

export const getCategories = async () => {

  const response = await api.get("/categories");

  return response.data;

};

export const getCategoryExercises = async (id: string) => {

  const response = await api.get(`/categories/${id}/exercises`);

  return response.data;

};