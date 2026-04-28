import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { gymAuthService } from "../api/gymAuthService";
import "./Login.css"; 
import CustomAlert from "../Componentes/CustomAlert";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const handleAuthSuccess = (response) => {
    localStorage.setItem("token", response.token);
    const user = response.user;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);

    const gymId = user.gymId || user.gym?.id;
    const gymName = user.gymName || user.gym?.name || "";

    localStorage.setItem("gymId", gymId);
    localStorage.setItem("gymName", gymName);
    localStorage.setItem("userId", user.id);

    showAlert(
      "Acesso Autorizado",
      "Bem-vindo de volta ao seu centro de treinamento.",
      "success",
      () => {
        setAlertConfig({ isOpen: false });
        if (user.role === "GYM_OWNER") {
          navigate("/academy");
        } else {
          navigate("/home");
        }
      }
    );
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await gymAuthService.googleLogin(credentialResponse.credential);
      handleAuthSuccess(response);
    } catch (error) {
      console.error("ERRO GOOGLE LOGIN:", error);
      const msg = error.response?.data?.error || "Falha na autenticação externa.";
      showAlert("Erro na Autenticação", msg, "error");
    } finally {
      setLoading(false);
    }
  };

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
      const response = await gymAuthService.login(formData);
      handleAuthSuccess(response);
    } catch (error) {
      console.error("ERRO LOGIN:", error);
      const msg = error.response?.data?.message || "Credenciais inválidas. Verifique seus dados.";
      showAlert("Falha no Login", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="header">
          <div className="app-logo">
            Gym<span>Club</span>
          </div>
          <h2>Conecte-se</h2>
          <p>Acesse seu painel de performance</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="atleta@dominio.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "PROCESSANDO..." : "AUTENTICAR AGORA"}
          </button>
        </form>

        <div className="social-login-separator">
          <span>ou continue com</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => showAlert("Erro", "Falha na conexão com Google", "error")}
            theme="filled_black"
            shape="pill"
            width="320px"
          />
        </div>

        <footer className="login-footer">
          Ainda não possui uma conta?
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            CADASTRE-SE NO TIME
          </a>
        </footer>
      </div>

      <CustomAlert config={alertConfig} />
    </div>
  );
}