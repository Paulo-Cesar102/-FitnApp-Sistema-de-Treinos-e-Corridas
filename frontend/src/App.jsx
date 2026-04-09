import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/home";
import Treinos from "./pages/Treinos"; 
import CriarTreino from "./Componentes/CriarTreino"; 
import MenuBar from "./Componentes/MenuBar";

function Layout({ children }) {
  const location = useLocation();
  // Incluído '/exercicio' para o menu aparecer na aba de treinos
  const rotasComMenu = ["/home", "/exercicio", "/perfil"]; 
  const mostrarMenu = rotasComMenu.includes(location.pathname);

  return (
    <div style={{ paddingBottom: mostrarMenu ? "80px" : "0", minHeight: "100vh", background: "#000", color: "#fff" }}>
      {children}
      {mostrarMenu && <MenuBar />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/exercicio" element={<Treinos />} />
          <Route path="/criar-treino" element={<CriarTreino />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Layout>
    </Router>
  );
}