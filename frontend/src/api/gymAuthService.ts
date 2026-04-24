import { api } from "./api";

export const gymAuthService = {
  // Public
  registerUserInGym: async (data: any) => {
    const response = await api.post("/auth-gym/register/user", data);
    return response.data;
  },

  registerGymOwner: async (data: any) => {
    const response = await api.post("/auth-gym/register/gym-owner", data);
    return response.data;
  },

  login: async (data: any) => {
    const response = await api.post("/auth-gym/login", data);
    return response.data;
  },

  validateGym: async (gymId: string) => {
    const response = await api.get(`/auth-gym/gym/${gymId}`);
    return response.data;
  },

  // Owner Protected
  createPersonal: async (gymId: string, data: any) => {
    const response = await api.post(`/auth-gym/owner/${gymId}/personals`, data);
    return response.data;
  },

  listPersonals: async (gymId: string) => {
    const response = await api.get(`/auth-gym/owner/${gymId}/personals`);
    return response.data;
  },

  deletePersonal: async (gymId: string, personalId: string) => {
    const response = await api.delete(`/auth-gym/owner/${gymId}/personals/${personalId}`);
    return response.data;
  },

  getStats: async (gymId: string) => {
    const response = await api.get(`/auth-gym/owner/${gymId}/stats`);
    return response.data;
  },
};
