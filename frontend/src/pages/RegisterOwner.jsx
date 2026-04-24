import React from "react";
import { useNavigate } from "react-router-dom";
import { RegisterOwnerForm } from "../Componentes/RegisterOwnerForm";
import { gymAuthService } from "../api/gymAuthService";

export default function RegisterOwner() {
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    try {
      await gymAuthService.registerGymOwner(data);
      alert("Academia e proprietário criados com sucesso! Faça login.");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || "Erro ao criar academia");
    }
  };

  return (
    <RegisterOwnerForm 
      onRegister={handleRegister}
      onToggleLogin={() => navigate("/login")}
      onToggleUserRegister={() => navigate("/register")}
    />
  );
}