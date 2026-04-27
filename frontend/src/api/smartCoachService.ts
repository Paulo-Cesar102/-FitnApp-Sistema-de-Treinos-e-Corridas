import { api } from "./api";

export const askSmartCoach = async (question: string) => {
  const response = await api.post("/smart-coach/ask", { question });
  return response.data;
};
