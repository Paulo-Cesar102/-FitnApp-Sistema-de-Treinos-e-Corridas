import { api } from "./api";

// REGISTRAR USUÁRIO
export const registerUser = async (data: any) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// BUSCAR DADOS DO USUÁRIO PELO ID
export const getUser = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ATUALIZAR PERFIL (Nome, Sexo, Meta de Peso, etc.)
export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};  