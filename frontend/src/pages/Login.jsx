import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { gymAuthService } from "../api/gymAuthService";
import "./Login.css"; 
import CustomAlert from "../Componentes/CustomAlert";

const FlameIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const handleAuthSuccess = (response) => {
    // 🔥 SALVA TOKEN
    localStorage.setItem("token", response.token);

    // 🔥 SALVA USUÁRIO E DADOS EXTRAS
    const user = response.user;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);

    const gymId = user.gymId || user.gym?.id;
    const gymName = user.gymName || user.gym?.name || "";

    localStorage.setItem("gymId", gymId);
    localStorage.setItem("gymName", gymName);
    localStorage.setItem("userId", user.id);

    showAlert(
      "Acesso Liberado",
      "Login realizado com sucesso!",
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
      const msg = error.response?.data?.error || "Falha na autenticação com Google.";
      showAlert("Erro Google", msg, "error");
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

      console.log("RESPOSTA LOGIN:", response);
      handleAuthSuccess(response);

    } catch (error) {
      console.error("ERRO LOGIN:", error);

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "E-mail ou senha incorretos.";

      showAlert("Falha no Login", msg, "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="header">
          <div className="app-logo" style={{ marginBottom: '20px' }}>
            Gym<span>Club</span>
          </div>
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

        <div className="social-login-separator">
          <span>OU ENTRE COM</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => showAlert("Erro", "Falha no Login com Google", "error")}
            useOneTap
            theme="filled_black"
            shape="pill"
            width="100%"
          />
        </div>

        <footer className="login-footer">
          Ainda não faz parte do time?
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            <br />Criar minha conta
          </a>
        </footer>
      </div>

      <CustomAlert config={alertConfig} />
    </div>
  );
}