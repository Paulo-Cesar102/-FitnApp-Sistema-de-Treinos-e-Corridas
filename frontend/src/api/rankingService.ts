import { api } from "./api";

export const rankingService = {
  getGeneralRanking: async () => {
    const response = await api.get("/ranking");
    return response.data;
  },
};
