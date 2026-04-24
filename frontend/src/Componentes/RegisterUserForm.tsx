import React, { useState } from "react";
import "../styles/Auth.css";

interface RegisterUserProps {
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    gymId: string;
  }) => void;
  onToggleLogin: () => void;
  onValidateGym: (gymId: string) => Promise<any>;
}

export const RegisterUserForm: React.FC<RegisterUserProps> = ({
  onRegister,
  onToggleLogin,
  onValidateGym,
}) => {
  const [step, setStep] = useState<"gym" | "user">("gym");
  const [gymId, setGymId] = useState("");
  const [gymnasiumData, setGymnasiumData] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const gym = await onValidateGym(gymId);
      setGymnasiumData(gym);
      setStep("user");
    } catch (err: any) {
      setError(err.message || "Academia não encontrada");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      setLoading(false);
      return;
    }

    try {
      await onRegister({
        name,
        email,
        password,
        gymId,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  if (step === "gym") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Bem-vindo!</h1>
            <p>Encontre sua academia</p>
          </div>

          <form onSubmit={handleValidateGym} className="auth-form">
            <div className="form-group">
              <label htmlFor="gymId">ID ou Nome da Academia</label>
              <input
                id="gymId"
                type="text"
                placeholder="Digite o ID ou nome da sua academia"
                value={gymId}
                onChange={(e) => setGymId(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Procurando..." : "Próximo"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Já tem uma conta?</p>
            <button onClick={onToggleLogin} className="btn-link">
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Cadastro em {gymnasiumData?.gym?.name}</h1>
          <p>Preencha seus dados</p>
        </div>

        <form onSubmit={handleRegisterUser} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <button
            type="button"
            onClick={() => setStep("gym")}
            className="btn-secondary"
          >
            Voltar
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta?</p>
          <button onClick={onToggleLogin} className="btn-link">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
