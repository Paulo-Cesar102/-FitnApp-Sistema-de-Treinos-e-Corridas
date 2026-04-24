import { api } from "./api";

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