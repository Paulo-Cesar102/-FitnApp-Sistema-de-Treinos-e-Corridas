import React, { useState } from "react";
import "./Register.css";

export default function Register() {

  const [formData, setFormData] = useState({
<<<<<<< HEAD
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: ""
  });

  const [status, setStatus] = useState({
    message: "",
    type: ""
=======
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sexo: 'true' 
>>>>>>> 2a035b22841ea822c46be2d6451a4d4ec5ec6436
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function validateForm() {

    if (!formData.name || !formData.email || !formData.password) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (formData.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "As senhas não coincidem.";
    }

    // gênero é opcional na API, mas se preenchido deve ser válido
    if (
      formData.gender &&
      !["male", "female", "other"].includes(formData.gender)
    ) {
      return "Gênero inválido.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      setStatus({
        message: error,
        type: "error"
      });
      return;
    }

    try {
      setLoading(true);

      // monta payload compatível com o backend (/users)
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // somente envia sex se o usuário escolheu masculino ou feminino;
        // no banco o default é "M" quando o campo não é enviado, portanto
        // "other" ou vazio resultam em M também
        sex:
          formData.gender === "male"
            ? "M"
            : formData.gender === "female"
            ? "F"
            : undefined
      };

      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar.");
      }

      setStatus({
        message: "Conta criada com sucesso!",
        type: "success"
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: ""
      });

    } catch (error) {

      setStatus({
        message: "Erro ao registrar usuário.",
        type: "error"
      });

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">

      <div className="register-card">

        <div className="header">
          <h2>Criar Conta</h2>
          <p>Preencha seus dados para começar</p>
        </div>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="******"
            />
          </div>

          <div className="form-row">

            <div className="form-group half">
              <label>Idade</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="18"
              />
            </div>

            <div className="form-group half">
              <label>Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="select-input"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>

        </form>

        <div className="register-footer">
          Já possui conta? <a href="/login">Entrar</a>
        </div>

      </div>

    </div>
  );
}