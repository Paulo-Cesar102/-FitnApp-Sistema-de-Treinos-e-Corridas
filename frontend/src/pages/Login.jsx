import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Certifique-se de que o CSS abaixo esteja aqui

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      setStatus({ message: "Login realizado com sucesso!", type: "success" });
      
      // Salva o token para as próximas requisições
      localStorage.setItem("token", response.data.token);

      // Redireciona para o Dashboard após 1.5s
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error) {
      const msg = error.response?.data?.message || "E-mail ou senha incorretos.";
      setStatus({ message: msg, type: "error" });
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

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.type === 'success' ? '✅ ' : '⚠️ '} {status.message}
        </div>
      )}

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
          <label>Senha Secreta</label>
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
  </div>
);
}