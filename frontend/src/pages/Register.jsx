
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import CustomAlert from "../Componentes/CustomAlert";

const FlameIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return showAlert("Atenção", "As senhas informadas não coincidem.", "error");
    }

    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        sex: formData.gender === "male" ? "M" : "F"
      };

      await axios.post("http://localhost:3000/users/register", payload);

      setFormData({ name: "", email: "", password: "", confirmPassword: "", gender: "" });

      showAlert("Conta Criada", "Usuário cadastrado com sucesso! Faça login para continuar.", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/login");
      });

    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao conectar com o servidor";
      showAlert("Erro no Cadastro", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <header className="header">
          <div className="logo-icon" style={{ color: "#ff4500" }}><FlameIcon /></div>
          <h2>Criar Conta</h2>
          <p>Acesse ao nosso portal de Treinos</p>
        </header>

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

      <CustomAlert config={alertConfig} />
    </div>
  );
}