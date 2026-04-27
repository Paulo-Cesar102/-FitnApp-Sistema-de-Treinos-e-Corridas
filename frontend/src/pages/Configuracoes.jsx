import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser } from "../api/userService";
import "./Configuracoes.css";
import CustomAlert from "../Componentes/CustomAlert";

const ArrowLeftIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const GymIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="M9 22H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4"/><path d="M18 22V15"/></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

export default function Configuracoes() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [userData, setUserData] = useState({ 
    name: "", 
    sex: "M", 
    weightGoal: 0, 
    defaultRest: 60,
    isPublicProfile: true,
    notificationsEnabled: true 
  });
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  useEffect(() => {
    async function loadUser() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        try {
          const details = await getUser(user.id);
          setUserData({
            name: details.name,
            sex: details.sex || "M",
            weightGoal: details.weightGoal || 0,
            defaultRest: user.defaultRest || 60,
            isPublicProfile: details.isPublicProfile !== false,
            notificationsEnabled: details.notificationsEnabled !== false
          });
        } catch (err) {
          console.error(err);
        }
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
      await updateUser(user.id, {
        name: userData.name,
        sex: userData.sex,
        weightGoal: userData.weightGoal
      });
      
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

  const handleToggle = async (field, currentValue) => {
    const newValue = !currentValue;
    setUserData(prev => ({ ...prev, [field]: newValue }));
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await updateUser(user.id, { [field]: newValue });
      
      // Atualiza localmente também
      const updatedLocal = { ...user, [field]: newValue };
      localStorage.setItem("user", JSON.stringify(updatedLocal));
    } catch (err) {
      console.error(`Erro ao atualizar ${field}:`, err);
      // Reverte em caso de erro
      setUserData(prev => ({ ...prev, [field]: currentValue }));
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
        localStorage.removeItem("role");
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
          <h3 className="config-group-title">Meu Perfil</h3>
          <div className="config-card">
            <div className="input-group-config">
              <label>Nome Completo</label>
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
                step="0.1"
                value={userData.weightGoal} 
                onChange={e => setUserData({...userData, weightGoal: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="input-group-config">
              <label>Descanso Padrão (segundos)</label>
              <input 
                type="number" 
                value={userData.defaultRest} 
                onChange={e => setUserData({...userData, defaultRest: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </section>

        <section className="config-group">
          <h3 className="config-group-title">Minha Academia</h3>
          <div className="config-item-row" onClick={() => navigate("/academy")}>
            <div className="config-item-info">
              <div className="config-icon-box">
                <GymIcon />
              </div>
              <div className="config-text">
                <h4>Unidade Vinculada</h4>
                <p>Ver detalhes da sua academia</p>
              </div>
            </div>
          </div>
        </section>

        <section className="config-group">
          <h3 className="config-group-title">Notificações e Privacidade</h3>
          
          <div className="config-item-row" style={{ marginBottom: '10px' }} onClick={() => handleToggle('notificationsEnabled', userData.notificationsEnabled)}>
            <div className="config-item-info">
              <div className="config-icon-box">
                <BellIcon />
              </div>
              <div className="config-text">
                <h4>Lembretes de Treino</h4>
                <p>Receber avisos diários</p>
              </div>
            </div>
            <div className={`theme-switch-pill ${userData.notificationsEnabled ? 'light' : 'dark'}`}>
               <div className="switch-dot"></div>
            </div>
          </div>

          <div className="config-item-row" onClick={() => handleToggle('isPublicProfile', userData.isPublicProfile)}>
            <div className="config-item-info">
              <div className="config-icon-box">
                <ShieldIcon />
              </div>
              <div className="config-text">
                <h4>Perfil Público</h4>
                <p>Permitir que amigos vejam seu progresso</p>
              </div>
            </div>
            <div className={`theme-switch-pill ${userData.isPublicProfile ? 'light' : 'dark'}`}>
               <div className="switch-dot"></div>
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
            <div className={`theme-switch-pill ${theme === 'light' ? 'light' : 'dark'}`}>
               <div className="switch-dot"></div>
            </div>
          </div>
        </section>

        <section className="config-group">
          <h3 className="config-group-title">Sobre</h3>
          <div className="config-item-row" onClick={() => setAlertConfig({ isOpen: true, title: "GymClub", message: "Versão 3.1.0\nFocado em performance.", type: "info" })}>
            <div className="config-item-info">
              <div className="config-icon-box">
                <InfoIcon />
              </div>
              <div className="config-text">
                <h4>Informações</h4>
                <p>Versão do app e suporte</p>
              </div>
            </div>
          </div>
          
          <div className="config-item-row danger" style={{ marginTop: '10px' }} onClick={handleLogout}>
            <div className="config-item-info">
              <div className="config-icon-box danger">
                <LogoutIcon />
              </div>
              <div className="config-text">
                <h4 className="danger-text">Sair da Conta</h4>
                <p>Desconectar com segurança</p>
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
