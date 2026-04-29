import React, { useState } from "react";
import "./RegisterOwnerForm.css";

interface RegisterOwnerProps {
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    gymName: string;
    gymDescription: string;
    gymAddress: string;
    pixKey: string;
    pixType: string;
  }) => void;
  onToggleLogin: () => void;
  onToggleUserRegister: () => void;
}

type PixType = "cpf" | "cnpj" | "email" | "phone";

export const RegisterOwnerForm: React.FC<RegisterOwnerProps> = ({
  onRegister,
  onToggleLogin,
  onToggleUserRegister,
}) => {
  const [step, setStep] = useState<"owner" | "gym">("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymDescription, setGymDescription] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState<PixType>("cpf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    setError("");
    setStep("gym");
  };

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onRegister({
        name,
        email,
        password,
        gymName,
        gymDescription,
        gymAddress,
        pixKey,
        pixType,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao criar academia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-owner-content">
        {step === "owner" ? (
          <form onSubmit={handleOwnerSubmit} className="owner-form">
            <div className="form-group">
              <label htmlFor="gymName">Nome da Academia</label>
              <input
                id="gymName"
                type="text"
                placeholder="Ex: Power Gym Central"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Nome do Proprietário</label>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Profissional</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
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
                <label htmlFor="confirmPassword">Confirmar</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="submit-btn primary">
              PRÓXIMO PASSO
            </button>
          </form>
        ) : (
          <form onSubmit={handleGymSubmit} className="owner-form">
            <div className="form-group">
              <label htmlFor="gymDescription">Descrição / Slogan</label>
              <textarea
                id="gymDescription"
                placeholder="Conte um pouco sobre sua academia..."
                value={gymDescription}
                onChange={(e) => setGymDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gymAddress">Endereço Completo</label>
              <input
                id="gymAddress"
                type="text"
                placeholder="Rua, Número, Bairro, Cidade"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="pixType">Tipo de Chave Pix</label>
                <select
                  id="pixType"
                  value={pixType}
                  onChange={(e) => setPixType(e.target.value as PixType)}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pixKey">Chave Pix</label>
                <input
                  id="pixKey"
                  type="text"
                  placeholder="Sua chave para pagamentos"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="btn-row">
              <button
                type="button"
                onClick={() => setStep("owner")}
                className="submit-btn secondary"
              >
                VOLTAR
              </button>
              <button type="submit" className="submit-btn primary" disabled={loading}>
                {loading ? "PROCESSANDO..." : "FINALIZAR CADASTRO"}
              </button>
            </div>
          </form>
        )}
    </div>
  );
};
