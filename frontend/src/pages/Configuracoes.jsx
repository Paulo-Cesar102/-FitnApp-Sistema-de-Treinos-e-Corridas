import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser } from "../api/userService";
import "./Configuracoes.css";
import CustomAlert from "../Componentes/CustomAlert";

const ArrowLeftIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function Configuracoes() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [userData, setUserData] = useState({ name: "", sex: "M", weightGoal: 0 });
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  useEffect(() => {
    async function loadUser() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        const details = await getUser(user.id);
        setUserData({
          name: details.name,
          sex: details.sex || "M",
          weightGoal: details.weightGoal || 0
        });
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await updateUser(user.id, userData);
      localStorage.setItem("user", JSON.stringify({ ...user, ...userData }));
      
      setAlertConfig({
        isOpen: true,
        title: "Sucesso",
        message: "Configurações atualizadas!",
        type: "success",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Sair da Conta",
      message: "Deseja realmente desconectar?",
      type: "error",
      onConfirm: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    });
  };

  return (
    <div className="config-container fade-in">
      <header className="config-header">
        <button className="btn-back-config" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </button>
        <h2>Ajustes</h2>
        <button className="btn-save-top" onClick={handleUpdate} disabled={loading}>
          {loading ? "..." : "Salvar"}
        </button>
      </header>

      <main className="config-content">
        <section className="config-group">
          <h3 className="config-group-title">Perfil</h3>
          <div className="config-card">
            <div className="input-group-config">
              <label>Nome</label>
              <input 
                type="text" 
                value={userData.name} 
                onChange={e => setUserData({...userData, name: e.target.value})}
              />
            </div>
            <div className="input-group-config">
              <label>Sexo</label>
              <select 
                value={userData.sex} 
                onChange={e => setUserData({...userData, sex: e.target.value})}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div className="input-group-config">
              <label>Meta de Peso (kg)</label>
              <input 
                type="number" 
                value={userData.weightGoal} 
                onChange={e => setUserData({...userData, weightGoal: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </section>

        <section className="config-group">
          <h3 className="config-group-title">Aparência</h3>
          <div className="config-item-row" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <div className="config-item-info">
              <div className="config-icon-box">
                {theme === "dark" ? <MoonIcon /> : <SunIcon />}
              </div>
              <div className="config-text">
                <h4>Tema {theme === "dark" ? "Escuro" : "Claro"}</h4>
                <p>Toque para alternar o visual</p>
              </div>
            </div>
            <div className={`theme-switch-pill ${theme}`}>
               <div className="switch-dot"></div>
            </div>
          </div>
        </section>

        <section className="config-group">
          <h3 className="config-group-title">Conta</h3>
          <div className="config-item-row danger" onClick={handleLogout}>
            <div className="config-item-info">
              <div className="config-icon-box danger">
                <LogoutIcon />
              </div>
              <div className="config-text">
                <h4 className="danger-text">Sair da Conta</h4>
                <p>Desconectar deste dispositivo</p>
              </div>
            </div>
          </div>
        </section>

        <section className="config-footer-info">
            <p>GymClub v3.1.0</p>
            <p>Desenvolvido com Rigor Premium</p>
        </section>
      </main>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
