import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import GymCheckIn from "../Componentes/GymCheckIn";
import GymRanking from "../Componentes/GymRanking";
import GymAnnouncements from "../Componentes/GymAnnouncements";
import GymPersonals from "../Componentes/GymPersonals";
import JoinGym from "../Componentes/JoinGym";
import { OwnerDashboard } from "../Componentes/OwnerDashboard";
import { PersonalDashboard } from "../Componentes/PersonalDashboard";
import "./academy.css";

// --- Ícones Institucionais ---
const InfoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const ShoppingBagIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const AwardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const CreditCardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

// Ícones de Facilidades
const ShowerIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16"/><path d="M20 15v1"/><path d="M16 15v1"/><path d="M12 15v1"/><path d="M8 15v1"/><path d="M4 15v1"/><path d="M12 4v7a4 4 0 0 1-4 4H4"/><path d="M12 11h8a4 4 0 0 1 4 4v2"/></svg>;
const AirVentIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M20 12h2"/><path d="M2 12h2"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 19.07l-1.41-1.41"/><path d="M6.34 6.34l-1.41-1.41"/></svg>;
const ParkingIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>;
const CoffeeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>;

export default function Academy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(sessionStorage.getItem("role"));
  const [gymId, setGymId] = useState(sessionStorage.getItem("gymId"));
  const [gymName, setGymName] = useState(sessionStorage.getItem("gymName") || "Minha Academia");
  const [token] = useState(sessionStorage.getItem("token"));
  
  // Inicializa na aba correta se houver redirecionamento via estado (ex: notificações)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "info");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const syncLocalStorage = () => {
      setRole(sessionStorage.getItem("role"));
      setGymId(sessionStorage.getItem("gymId"));
      setGymName(sessionStorage.getItem("gymName") || "Minha Academia");
    };

    syncLocalStorage();
    window.addEventListener('storage', syncLocalStorage);
    window.addEventListener('userDataUpdated', syncLocalStorage);

    return () => {
      window.removeEventListener('storage', syncLocalStorage);
      window.removeEventListener('userDataUpdated', syncLocalStorage);
    };
  }, []);

  const tabs = [
    { id: "info", label: "Unidade", icon: <InfoIcon /> },
    { id: "news", label: "Atualizações", icon: <BellIcon /> },
    { id: "shop", label: "Loja", icon: <ShoppingBagIcon /> },
    { id: "plans", label: "Planos", icon: <CreditCardIcon /> },
    { id: "ranking", label: "Ranking", icon: <AwardIcon /> },
  ];

  const handleJoined = (newGymId) => {
    setGymId(newGymId);
    sessionStorage.setItem("gymId", newGymId);
  };

  const handleLeaveGym = () => {
    if (window.confirm("Deseja realmente sair desta unidade? Seus dados de ranking local serão perdidos.")) {
      sessionStorage.removeItem("gymId");
      sessionStorage.removeItem("gymName");
      setGymId(null);
      // Aqui você poderia chamar um endpoint para remover o gymId do usuário no banco
      window.dispatchEvent(new Event("userDataUpdated"));
    }
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair da sua conta?")) {
      googleLogout();
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("gymId");
      sessionStorage.removeItem("gymName");
      sessionStorage.removeItem("userId");
      navigate("/login");
    }
  };

  // ÁREA DE GESTÃO (SEPARADA TOTALMENTE)
  if (role === "GYM_OWNER") {
    return <OwnerDashboard gymId={gymId} gymName={gymName} token={token} onLogout={handleLogout} />;
  }

  if (role === "PERSONAL") {
    return <PersonalDashboard gymId={gymId} gymName={gymName} onLogout={handleLogout} />;
  }

  // ÁREA DO USUÁRIO - VINCULAÇÃO (Se não tiver academia)
  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <JoinGym onJoined={handleJoined} />;
  }

  // ÁREA DO USUÁRIO - PÁGINA INSTITUCIONAL
  return (
    <div className="academy-user-portal fade-in">
      <header className="portal-header">
        <div className="gym-brand">
          <div className="gym-avatar-large">{gymName.charAt(0)}</div>
          <div className="gym-info-title">
            <h1>{gymName}</h1>
            <div className="status-row">
               <span className="gym-status-badge">Unidade Ativa</span>
               <span className="gym-id-label">ID: {gymId?.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <button className="btn-leave-gym" onClick={handleLeaveGym} title="Sair da Unidade">
             <LogoutIcon />
          </button>
        </div>
      </header>

      <div className="portal-nav-pills">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-pill ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="portal-content-area">
        {activeTab === "info" && (
           <div className="institutional-view animated-up">
              <section className="info-card-v4">
                  <div className="section-header">
                     <InfoIcon />
                     <h3>Sobre a Unidade</h3>
                  </div>
                  <p className="description-text">Bem-vindo à {gymName}. Nossa infraestrutura foi projetada para oferecer a melhor experiência em treinamento e bem-estar, com ambientes climatizados e equipamentos de alta performance.</p>
                  <div className="gym-features-list">
                    <div className="feat-item"><ShowerIcon /><span>Vestiários</span></div>
                    <div className="feat-item"><AirVentIcon /><span>Climatização</span></div>
                    <div className="feat-item"><ParkingIcon /><span>Estacionamento</span></div>
                    <div className="feat-item"><CoffeeIcon /><span>Conveniência</span></div>
                  </div>
              </section>
              
              <section className="info-card-v4">
                  <div className="section-header">
                     <AwardIcon />
                     <h3>Equipe Técnica</h3>
                  </div>
                  <GymPersonals />
              </section>

              <section className="info-card-v4">
                  <div className="section-header">
                     <CreditCardIcon />
                     <h3>Check-in de Frequência</h3>
                  </div>
                  <GymCheckIn />
              </section>
           </div>
        )}

        {activeTab === "news" && (
           <div className="news-view animated-up">
              <GymAnnouncements gymId={gymId} />
           </div>
        )}

        {activeTab === "shop" && (
           <div className="shop-view animated-up">
              <div className="empty-shop-state">
                  <div className="empty-icon-box">
                    <ShoppingBagIcon />
                  </div>
                  <h3>Loja Oficial</h3>
                  <p>A vitrine de produtos e suplementos está sendo preparada para sua unidade.</p>
                  <span className="status-tag-soon">EM BREVE</span>
              </div>
           </div>
        )}

        {activeTab === "plans" && (
           <div className="plans-view animated-up">
              <div className="plan-card-v4 featured">
                  <div className="plan-tag">RECOMENDADO</div>
                  <div className="plan-header-box">
                    <h4>Plano Black</h4>
                    <span className="plan-subtitle">Acesso Ilimitado</span>
                  </div>
                  <div className="price">R$ 119<span className="currency-period">/mês</span></div>
                  <ul className="plan-perks">
                    <li>Acesso total a todas as áreas</li>
                    <li>Treinamento de musculação e cardio</li>
                    <li>Isenção de taxa de cancelamento</li>
                    <li>Acesso a eventos exclusivos</li>
                  </ul>
                  <button className="btn-buy-plan" disabled>INDISPONÍVEL NO MOMENTO</button>
              </div>
           </div>
        )}

        {activeTab === "ranking" && (
           <div className="ranking-view animated-up">
              <GymRanking />
           </div>
        )}
      </div>
    </div>
  );
}
