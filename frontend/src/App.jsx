import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { connectSocket } from "./service/socket"; 

// Páginas e Componentes
import Register from "./pages/Register";
import RegisterOwner from "./pages/RegisterOwner";
import Login from "./pages/Login";
import Home from "./pages/home";
import Treinos from "./pages/Treinos";
import CriarTreino from "./Componentes/CriarTreino";
import MenuBar from "./Componentes/MenuBar";
import ExecutarTreino from "./Componentes/ExecutarTreino";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Friends from "./pages/friends";
import Academy from "./pages/academy";
import CompleteProfile from "./Componentes/CompleteProfile";

function Layout({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);

    const checkUserProfile = () => {
      const userJson = localStorage.getItem("user");
      const userRole = localStorage.getItem("role");

      if (userJson && userRole === "USER") {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        
        // Só mostra se NÃO tiver completado o onboarding
        if (!user.onboardingCompleted) {
          setShowCompleteProfile(true);
        } else {
          setShowCompleteProfile(false);
        }
      } else {
        setShowCompleteProfile(false);
      }
    };

    checkUserProfile();
    
    // Escuta mudanças no usuário (login/logout)
    window.addEventListener('storage', checkUserProfile);
    window.addEventListener('userDataUpdated', checkUserProfile);

    return () => {
      window.removeEventListener('storage', checkUserProfile);
      window.removeEventListener('userDataUpdated', checkUserProfile);
    };
  }, [location.pathname]);

  // Rotas onde o MenuBar inferior deve aparecer
  const rotasComMenu = ["/home", "/exercicio", "/perfil", "/amigos", "/academy"];
  let mostrarMenu = rotasComMenu.includes(location.pathname);
  
  if (role === "GYM_OWNER" || role === "PERSONAL") {
     if (location.pathname === "/academy") {
         mostrarMenu = false;
     }
  }

  const handleProfileComplete = (updatedUser) => {
    setCurrentUser(updatedUser);
    setShowCompleteProfile(false);
  };

  return (
    <div
      style={{
        paddingBottom: mostrarMenu ? "80px" : "0",
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        transition: "background 0.3s ease, color 0.3s ease"
      }}
    >
      {showCompleteProfile && currentUser && (
        <CompleteProfile user={currentUser} onComplete={handleProfileComplete} />
      )}
      {children}
      {mostrarMenu && <MenuBar />}
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user?.id) {
          connectSocket(user.id);
        }
      } catch (error) {
        console.error("Erro ao ler dados do usuário no App:", error);
      }
    }
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-owner" element={<RegisterOwner />} />
        <Route path="/home" element={<Home />} />
        <Route path="/exercicio" element={<Treinos />} />
        <Route path="/criar-treino" element={<CriarTreino />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/amigos" element={<Friends />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/executar-treino" element={<ExecutarTreino />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}