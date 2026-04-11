import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 
import CustomAlert from "../Componentes/CustomAlert";


export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Chamando sua rota de auth
      const response = await axios.post("http://localhost:3000/auth/login", formData);

      // Salva o token para as próximas requisições
      localStorage.setItem("token", response.data.token);

      showAlert("Acesso Liberado", "Login realizado com sucesso!", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });

    } catch (error) {
      const msg = error.response?.data?.message || "E-mail ou senha incorretos.";
      showAlert("Falha no Login", msg, "error");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="login-container">
    <div className="login-card">
      <header className="header">
        <div className="logo-icon">🔥</div>
        <h2>Acesse sua Força</h2>
        <p>Entre para esmagar as metas de hoje</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>E-mail de Atleta</label>
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              placeholder="atleta@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Senha</label>
          <div className="input-wrapper">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loader-text">Validando DNA...</span>
          ) : (
            "ACESSAR SISTEMA"
          )}
        </button>
      </form>

      <footer className="login-footer">
        Ainda não faz parte do time? 
        <a href="/register" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
           Criar minha conta
        </a>
      </footer>
    </div>

    <CustomAlert config={alertConfig} />
  </div>
);
}