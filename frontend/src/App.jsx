import React, { useEffect } from "react";
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

function Layout({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  // Rotas onde o MenuBar inferior deve aparecer
  const rotasComMenu = ["/home", "/exercicio", "/perfil", "/amigos", "/academy"];
  let mostrarMenu = rotasComMenu.includes(location.pathname);
  
  if (role === "GYM_OWNER" || role === "PERSONAL") {
     if (location.pathname === "/academy") {
         mostrarMenu = false;
     }
  }

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