import { api } from "./api";

export const getUserBadges = async () => {
  const response = await api.get("/badges/me");
  return response.data;
};