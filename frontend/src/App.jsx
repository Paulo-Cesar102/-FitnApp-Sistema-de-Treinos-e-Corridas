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
import { getUser } from "./api/userService";

function Layout({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Função para sincronizar dados com a API
  const syncUserData = async () => {
    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userJson || !token) {
      setShowCompleteProfile(false);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      // Busca dados frescos da API
      const freshUser = await getUser(user.id);
      
      if (freshUser) {
        // Atualiza o localStorage com os dados mais recentes
        localStorage.setItem("user", JSON.stringify(freshUser));
        localStorage.setItem("role", freshUser.role);
        localStorage.setItem("userId", freshUser.id);
        setCurrentUser(freshUser);
        
        // Verifica onboarding
        if (freshUser.role === "USER" && !freshUser.onboardingCompleted) {
          setShowCompleteProfile(true);
        } else {
          setShowCompleteProfile(false);
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar dados do usuário:", error);
      // Fallback para os dados locais se a API falhar
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      if (user.role === "USER" && !user.onboardingCompleted) {
        setShowCompleteProfile(true);
      }
    }
  };

  useEffect(() => {
    const authPages = ["/register", "/register-owner"];
    const isAuthPage = authPages.includes(location.pathname);

    if (isAuthPage) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      const savedTheme = localStorage.getItem("theme") || "dark";
      document.body.setAttribute("data-theme", savedTheme);
    }

    syncUserData();
    
    // Escuta mudanças externas no storage
    window.addEventListener('storage', syncUserData);
    window.addEventListener('userDataUpdated', syncUserData);

    return () => {
      window.removeEventListener('storage', syncUserData);
      window.removeEventListener('userDataUpdated', syncUserData);
    };
  }, [location.pathname]); // Sincroniza ao mudar de página

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