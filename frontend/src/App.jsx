import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { socket, connectSocket } from "./service/socket"; 

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
import AuthHub from "./pages/AuthHub";
import SmartCoach from "./Componentes/SmartCoach";
import CoachDrawer from "./Componentes/CoachDrawer";
import CompleteProfile from "./Componentes/CompleteProfile";
import CustomAlert from "./Componentes/CustomAlert"; 
import { getUser } from "./api/userService";

function Layout({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  
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

        // Garante que gymId e gymName estejam sincronizados
        const gId = freshUser.gymId || freshUser.gym?.id || "";
        const gName = freshUser.gymName || freshUser.gym?.name || "";
        localStorage.setItem("gymId", gId);
        localStorage.setItem("gymName", gName);

        setCurrentUser(freshUser);
        
        // Verifica onboarding
        if (freshUser.role === "USER" && !freshUser.onboardingCompleted) {
          setShowCompleteProfile(true);
        } else {
          setShowCompleteProfile(false);
        }

        // Avisa outros componentes que os dados foram atualizados
        window.dispatchEvent(new Event('userDataUpdated'));
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
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);

    syncUserData();
    
    // Escuta mudanças externas no storage
    window.addEventListener('storage', syncUserData);
    window.addEventListener('userDataUpdated', syncUserData);

    return () => {
      window.removeEventListener('storage', syncUserData);
      window.removeEventListener('userDataUpdated', syncUserData);
    };
  }, [location.pathname]); // Sincroniza ao mudar de página

  // --- ESCUTADORES GLOBAIS DE SOCKET ---
  useEffect(() => {
    if (!socket) return;

    const handleBadgeEarned = (badge) => {
      setAlertConfig({
        isOpen: true,
        title: "Nova Conquista!",
        message: `Parabéns! Você desbloqueou a medalha: ${badge.name}`,
        type: "success",
        confirmText: "Ok",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    };

    const handleFriendRequest = (data) => {
      setAlertConfig({
        isOpen: true,
        title: "Nova Solicitação",
        message: `${data.senderName} quer ser seu amigo no sistema!`,
        type: "info",
        confirmText: "Ver Pedidos",
        onConfirm: () => {
          setAlertConfig({ isOpen: false });
        },
        cancelText: "Fechar",
        onCancel: () => setAlertConfig({ isOpen: false })
      });
    };

    const handleWorkoutCompleted = (data) => {
      setAlertConfig({
        isOpen: true,
        title: "Treino Finalizado!",
        message: `${data.message} XP Ganhos: ${data.xpGained}. Sequência: ${data.streak} dias!`,
        type: "success",
        confirmText: "Continuar",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    };

    const handleExerciseCompleted = (data) => {
      console.log("Exercício concluído:", data);
    };

    socket.on("badge:earned", handleBadgeEarned);
    socket.on("friend:new_request", handleFriendRequest);
    socket.on("workout:completed", handleWorkoutCompleted);
    socket.on("exercise:completed", handleExerciseCompleted);

    return () => {
      socket.off("badge:earned", handleBadgeEarned);
      socket.off("friend:new_request", handleFriendRequest);
      socket.off("workout:completed", handleWorkoutCompleted);
      socket.off("exercise:completed", handleExerciseCompleted);
    };
  }, []);

  // Rotas onde o MenuBar inferior deve aparecer
  const rotasComMenu = ["/home", "/exercicio", "/perfil", "/amigos", "/academy", "/smart-coach"];
  let mostrarMenu = rotasComMenu.includes(location.pathname);
  
  // Rotas de autenticação onde o onboarding e o Drawer NÃO devem aparecer
  const authRoutes = ["/login", "/register", "/register-owner", "/", "/auth", "/academy"];
  const isAuthRoute = authRoutes.includes(location.pathname);
  const isExecutarTreino = location.pathname === "/executar-treino";
  
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
      <CustomAlert config={alertConfig} />
      
      {!isAuthRoute && showCompleteProfile && currentUser && (
        <CompleteProfile user={currentUser} onComplete={handleProfileComplete} />
      )}

      {/* Menu Gaveta Lateral para o Coach - Oculto na execução de treino para evitar conflito */}
      {!isAuthRoute && !isExecutarTreino && <CoachDrawer />}

      {children}
      {mostrarMenu && <MenuBar />}
    </div>
  );
}

const AppContent = React.memo(() => {
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
  }, []); // Só roda ao montar o App inicial

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthHub />} />
        
        {/* Fallbacks para compatibilidade ou redirecionamento direto */}
        <Route path="/login" element={<Navigate to="/auth" />} />
        <Route path="/register" element={<Navigate to="/auth" />} />
        <Route path="/register-owner" element={<Navigate to="/auth" />} />

        <Route path="/home" element={<Home />} />
        <Route path="/exercicio" element={<Treinos />} />
        <Route path="/criar-treino" element={<CriarTreino />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/amigos" element={<Friends />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/smart-coach" element={<SmartCoach />} />
        <Route path="/executar-treino" element={<ExecutarTreino />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Layout>
  );
});

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}