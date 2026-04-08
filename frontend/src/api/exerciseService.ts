import { api } from "./api";

export const getExercises = async () => {

  const response = await api.get("/exercises");

  return response.data;

};