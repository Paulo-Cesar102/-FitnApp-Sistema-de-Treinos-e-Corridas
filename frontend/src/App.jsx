import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register"; // Verifique se o caminho está certo
import Login from "./pages/Login";       // Verifique se o caminho está certo

function App() {
  return (
    <Router>
      <Routes>
        {/* Quando abrir o site, ele joga direto pro Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Define a rota de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Define a rota de Registro */}
        <Route path="/register" element={<Register />} />
        
        {/* Rota para o Dashboard (que você vai criar) */}
        <Route path="/dashboard" element={<div style={{color: 'white'}}>Logado com sucesso!</div>} />
      </Routes>
    </Router>
  );
}

export default App;