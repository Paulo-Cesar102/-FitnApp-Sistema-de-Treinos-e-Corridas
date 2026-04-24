import React, { useState } from "react";
import "../styles/Auth.css";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onToggleRegister: () => void;
  isRegistering: boolean;
}

export const LoginForm: React.FC<AuthScreenProps> = ({
  onLogin,
  onToggleRegister,
  isRegistering,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>FitnApp</h1>
          <p>Sistema de Treinos e Academias</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem uma conta?</p>
          <button onClick={onToggleRegister} className="btn-link">
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};
