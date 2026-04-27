import { api } from "./api";

export const rankingService = {
  getGeneralRanking: async () => {
    const response = await api.get("/ranking");
    return response.data;
  },

  getGymRanking: async (gymId, limit = 50, offset = 0) => {
    const response = await api.get(`/gym/ranking/${gymId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  getTop10Gym: async (gymId) => {
    const response = await api.get(`/gym/ranking/${gymId}/top10`);
    return response.data;
  },

  getUserRankPosition: async (userId, gymId) => {
    const response = await api.get(`/gym/ranking/${userId}/${gymId}/position`);
    return response.data;
  },

  getGymRankingStats: async (gymId) => {
    const response = await api.get(`/gym/ranking/${gymId}/stats`);
    return response.data;
  }
};
