import { api } from "./api";

export const gymService = {
  // Gym Core
  registerGym: async (data: any) => {
    const response = await api.post("/gym/register", data);
    return response.data;
  },

  joinGym: async (identifier: string) => {
    const response = await api.post("/gym/join", { identifier });
    return response.data;
  },

  searchGyms: async (identifier: string) => {
    const response = await api.get(`/gym/search?identifier=${identifier}`);
    return response.data;
  },

  // Personal Trainers
  getGymPersonals: async (gymId: string) => {
    const response = await api.get(`/gym/gym/${gymId}/personals`);
    return response.data;
  },

  getPersonalById: async (personalId: string) => {
    const response = await api.get(`/gym/personal/${personalId}`);
    return response.data;
  },

  getPersonalByUserId: async (userId: string) => {
    const response = await api.get(`/gym/personal/user/${userId}`);
    return response.data;
  },

  assignStudent: async (personalId: string, studentId: string) => {
    const response = await api.post("/gym/personal/student/assign", { personalId, studentId });
    return response.data;
  },

  removeStudent: async (personalId: string, studentId: string) => {
    const response = await api.delete(`/gym/personal/${personalId}/student/${studentId}`);
    return response.data;
  },

  getPersonalStudents: async (personalId: string) => {
    const response = await api.get(`/gym/personal/${personalId}/students`);
    return response.data;
  },

  createSupportChat: async (personalId: string, studentIds: string[], chatName: string) => {
    const response = await api.post("/gym/personal/chat/support", { personalId, studentIds, chatName });
    return response.data;
  },

  getSupportChats: async (personalId: string) => {
    const response = await api.get(`/gym/personal/${personalId}/chats`);
    return response.data;
  },

  // Check-ins
  performCheckIn: async (gymId: string) => {
    const response = await api.post("/gym/checkin", { gymId });
    return response.data;
  },

  getUserCheckIns: async (userId: string, gymId: string) => {
    const response = await api.get(`/gym/checkin/${userId}/${gymId}`);
    return response.data;
  },

  getGymCheckIns: async (gymId: string) => {
    const response = await api.get(`/gym/checkin/gym/${gymId}`);
    return response.data;
  },

  getTodayCheckInCount: async (gymId: string) => {
    const response = await api.get(`/gym/checkin/count/${gymId}`);
    return response.data;
  },

  getCheckInStreak: async (userId: string, gymId: string) => {
    const response = await api.get(`/gym/checkin/streak/${userId}/${gymId}`);
    return response.data;
  },

  getMonthlyCheckInCount: async (userId: string, gymId: string) => {
    const response = await api.get(`/gym/checkin/monthly/${userId}/${gymId}`);
    return response.data;
  },

  // Announcements
  createAnnouncement: async (data: any) => {
    const response = await api.post("/gym/announcement", data);
    return response.data;
  },

  getGymAnnouncements: async (gymId: string, page = 1, pageSize = 10) => {
    const response = await api.get(`/gym/announcement/gym/${gymId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getUrgentAnnouncements: async (gymId: string) => {
    const response = await api.get(`/gym/announcement/urgent/${gymId}`);
    return response.data;
  },

  updateAnnouncement: async (id: string, data: any) => {
    const response = await api.put(`/gym/announcement/${id}`, data);
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await api.delete(`/gym/announcement/${id}`);
    return response.data;
  },

  // Gym Rankings
  getGymRanking: async (gymId: string) => {
    const response = await api.get(`/gym/ranking/${gymId}`);
    return response.data;
  },

  getTop10Ranking: async (gymId: string) => {
    const response = await api.get(`/gym/ranking/${gymId}/top10`);
    return response.data;
  },

  getUserRank: async (userId: string, gymId: string) => {
    const response = await api.get(`/gym/ranking/${userId}/${gymId}`);
    return response.data;
  },

  getUserRankPosition: async (userId: string, gymId: string) => {
    const response = await api.get(`/gym/ranking/${userId}/${gymId}/position`);
    return response.data;
  },

  getRankingStats: async (gymId: string) => {
    const response = await api.get(`/gym/ranking/${gymId}/stats`);
    return response.data;
  },
};
