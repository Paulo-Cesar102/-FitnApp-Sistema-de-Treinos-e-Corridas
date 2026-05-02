import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CoachDrawer.css";

const RobotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);

export default function CoachDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const navigate = useNavigate();

  const checkEnabled = () => {
    const userJson = sessionStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      // Padrão é true se o campo ainda não existir no cache local
      setIsEnabled(user.isCoachEnabled !== false);
    }
  };

  useEffect(() => {
    checkEnabled();
    // Escuta atualizações de perfil vindo de outros componentes
    window.addEventListener("userDataUpdated", checkEnabled);
    return () => window.removeEventListener("userDataUpdated", checkEnabled);
  }, []);

  if (!isEnabled) return null;

  const handleAction = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      navigate("/smart-coach");
      setIsOpen(false);
    }
  };

  return (
    <div className={`coach-drawer-wrapper ${isOpen ? "open" : ""}`}>
      {isOpen && <div className="drawer-overlay" onClick={() => setIsOpen(false)} />}
      
      <div className="drawer-container">
        <button className="drawer-trigger" onClick={handleAction}>
          <div className="trigger-icon">
            <RobotIcon />
          </div>
          <span className="trigger-text">SMART COACH</span>
        </button>
      </div>
    </div>
  );
}
