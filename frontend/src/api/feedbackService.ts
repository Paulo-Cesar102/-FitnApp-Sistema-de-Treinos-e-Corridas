import { api } from "./api";

export const sendFeedback = async (data: any) => {

  const response = await api.post("/feedback", data);

  return response.data;

};