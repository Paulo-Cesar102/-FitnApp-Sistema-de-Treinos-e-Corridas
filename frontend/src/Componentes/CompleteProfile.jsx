import React, { useState } from "react";
import { weightService } from "../api/weightService";
import { updateUser } from "../api/userService";
import "./CompleteProfile.css";

export default function CompleteProfile({ user, onComplete }) {
  const [formData, setFormData] = useState({
    weight: "",
    weightGoal: "",
    height: "",
    goalType: "HIPERTROFIA",
    experience: "BEGINNER"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Utilitário para tratar números decimais (substitui vírgula por ponto)
  const parseDecimal = (value) => {
    if (!value) return 0;
    const normalized = value.toString().replace(",", ".");
    return parseFloat(normalized);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const weight = parseDecimal(formData.weight);
    const weightGoal = parseDecimal(formData.weightGoal);
    const height = parseDecimal(formData.height);

    // Validação rigorosa
    if (!weight || !weightGoal || !height || weight <= 0 || weightGoal <= 0 || height <= 0) {
      setError("Por favor, preencha todos os campos com valores válidos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!user?.id) {
        throw new Error("ID do usuário não encontrado. Tente fazer login novamente.");
      }

      // 1. Registrar o peso inicial no log
      await weightService.addWeightLog(weight);

      // 2. Atualizar o perfil do usuário no backend com os novos campos
      const updatedUser = await updateUser(user.id, {
        weightGoal: weightGoal, // Já é número (parseFloat)
        height: height,         // Já é número (parseFloat)
        goalType: formData.goalType,
        experienceLevel: formData.experience,
        onboardingCompleted: true, 
        name: user.name
      });

      // 3. Marcar como completo no localStorage para sincronia imediata
      const newUserLocal = { 
        ...user, 
        ...updatedUser,
        onboardingCompleted: true 
      };
      localStorage.setItem("user", JSON.stringify(newUserLocal));
      
      onComplete(newUserLocal);
    } catch (err) {
      console.error("Erro ao completar perfil:", err);
      setError("Erro ao salvar dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-overlay">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="app-logo" style={{ marginBottom: "20px", justifyContent: "center" }}>
            Gym<span>Club</span>
          </div>
          <h2>Quase lá!</h2>
          <p>Configure seu perfil para que possamos calcular suas métricas e objetivos.</p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-row-dual">
            <div className="form-group-premium">
              <label>Peso Atual</label>
              <div className="input-premium-wrapper">
                <input
                  name="weight"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
                <span className="input-unit-label">kg</span>
              </div>
            </div>
            <div className="form-group-premium">
              <label>Meta de Peso</label>
              <div className="input-premium-wrapper">
                <input
                  name="weightGoal"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={formData.weightGoal}
                  onChange={handleChange}
                  required
                />
                <span className="input-unit-label">kg</span>
              </div>
            </div>
          </div>

          <div className="form-group-premium">
            <label>Altura</label>
            <div className="input-premium-wrapper">
              <input
                name="height"
                type="text"
                inputMode="decimal"
                placeholder="Ex: 175"
                value={formData.height}
                onChange={handleChange}
                required
              />
              <span className="input-unit-label">cm</span>
            </div>
          </div>

          <div className="form-group-premium">
            <label>Objetivo Principal</label>
            <div className="input-premium-wrapper">
              <select name="goalType" value={formData.goalType} onChange={handleChange}>
                <option value="EMAGRECIMENTO">Emagrecimento / Definição</option>
                <option value="HIPERTROFIA">Ganho de Massa Muscular</option>
                <option value="SAUDE">Saúde e Longevidade</option>
                <option value="PERFORMANCE">Performance em Atleta</option>
              </select>
            </div>
          </div>

          <div className="form-group-premium">
            <label>Nível de Experiência</label>
            <div className="input-premium-wrapper">
              <select name="experience" value={formData.experience} onChange={handleChange}>
                <option value="BEGINNER">Iniciante (Nunca treinei / parado)</option>
                <option value="INTERMEDIATE">Intermediário (Treino regular)</option>
                <option value="ADVANCED">Avançado (Atleta / anos de treino)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-complete-onboarding" disabled={loading}>
            {loading ? "Salvando..." : "Começar a Treinar"}
          </button>
        </form>
      </div>
    </div>
  );
}
