
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Hook para navegar entre páginas
import "./Register.css";

export default function Register() {
  const navigate = useNavigate(); // Inicializa o redirecionador
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: ""
  });

  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação de senhas
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ message: "As senhas não coincidem", type: "error" });
    }

    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        sex: formData.gender === "male" ? "M" : "F"
      };

      // CONEXÃO COM A SUA API
      await axios.post("http://localhost:3000/users/register", payload);

      setStatus({ message: "Usuário cadastrado com sucesso! Redirecionando...", type: "success" });
      
      // Limpa os campos
      setFormData({ name: "", email: "", password: "", confirmPassword: "", gender: "" });

      // REDIRECIONAMENTO: Espera 2 segundos para o usuário ver o sucesso e pula pro login
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao conectar com o servidor";
      setStatus({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <header className="header">
          <h2>Criar Conta</h2>
          <p>Acesse ao nosso portal de Treinos</p>
        </header>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              name="name"
              placeholder="Digite seu nome"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label>Confirmar</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gênero</label>
            <select
              name="gender"
              className="select-input"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
        </form>

        <footer className="register-footer">
          Já tem uma conta? <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Faça Login</a>
        </footer>
      </div>
    </div>
  );
}