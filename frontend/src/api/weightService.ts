import { api } from "./api";

export const addWeightLog = async (weight: number) => {
  const response = await api.post("/weight", { weight });
  return response.data;
};

export const getWeightLogs = async () => {
  const response = await api.get("/weight");
  return response.data;
};