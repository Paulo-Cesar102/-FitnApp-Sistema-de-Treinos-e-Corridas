import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { gymAuthService } from "../api/gymAuthService";
import { registerUser, validateGym } from "../api/userService";
import { RegisterOwnerForm } from "../Componentes/RegisterOwnerForm";
import CustomAlert from "../Componentes/CustomAlert";
import "./AuthHub.css";
import "./Login.css"; // Reaproveita estilos de form e logo

// Ícones
const AtletaIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10l-6-5-6 5v10" /><path d="M9 20v-5h6v5" /><circle cx="12" cy="9" r="2" />
    </svg>
);

const AcademyIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default function AuthHub() {
    const [mode, setMode] = useState("login"); // login | choice | register-user | register-owner
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false });
    const navigate = useNavigate();

    // Login State
    const [loginData, setLoginData] = useState({ email: "", password: "" });

    // Register User State
    const [regStep, setRegStep] = useState("gym"); // gym | details
    const [regData, setRegData] = useState({
        name: "", email: "", password: "", confirmPassword: "", gender: "", gymId: ""
    });
    const [foundGym, setFoundGym] = useState(null);

    const showAlert = (title, message, type, onConfirm) => {
        setAlertConfig({
            isOpen: true, title, message, type,
            onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
        });
    };

    const handleAuthSuccess = (response) => {
        localStorage.setItem("token", response.token);
        const user = response.user;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        localStorage.setItem("userId", user.id);

        showAlert("Acesso Autorizado", `Bem-vindo, ${user.name}!`, "success", () => {
            setAlertConfig({ isOpen: false });
            navigate(user.role === "GYM_OWNER" ? "/academy" : "/home");
        });
    };

    // --- LOGIC: LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await gymAuthService.login(loginData);
            handleAuthSuccess(response);
        } catch (error) {
            showAlert("Erro", error.response?.data?.message || "Falha no login", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: REGISTER USER ---
    const handleValidateGym = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const gym = await validateGym(regData.gymId);
            setFoundGym(gym);
            setRegStep("details");
        } catch (err) {
            showAlert("Academia", "ID da academia não encontrado.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterUser = async (e) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) {
            return showAlert("Aviso", "As senhas não coincidem.", "error");
        }
        try {
            setLoading(true);
            await registerUser({
                name: regData.name,
                email: regData.email,
                password: regData.password,
                sex: regData.gender === "male" ? "M" : "F",
                gymId: regData.gymId,
                role: "PERSONAL"
            });
            showAlert("Sucesso!", "Sua conta de Personal foi criada. Agora faça login.", "success", () => {
                setAlertConfig({ isOpen: false });
                setMode("login");
            });
        } catch (err) {
            showAlert("Erro", err.response?.data?.message || "Falha no cadastro", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderLogin = () => (
        <form onSubmit={handleLogin} className="fade-in">
            <div className="form-group">
                <label>E-mail</label>
                <input type="email" placeholder="atleta@dominio.com" required 
                    value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Senha</label>
                <input type="password" placeholder="••••••••" required 
                    value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "AUTENTICANDO..." : "ENTRAR NO TIME"}
            </button>
            <div className="social-login-separator"><span>ou continue com</span></div>
            <div className="google-login-wrapper">
                <GoogleLogin 
                    onSuccess={r => gymAuthService.googleLogin(r.credential).then(handleAuthSuccess)}
                    onError={() => showAlert("Erro", "Falha no Google Login", "error")}
                    theme="filled_black" shape="pill" width="320"
                />
            </div>
        </form>
    );

    const renderChoice = () => (
        <div className="portal-selection fade-in">
            <div className="portal-card" onClick={() => setMode("register-user")}>
                <div className="portal-icon"><AtletaIcon /></div>
                <h3>Sou Personal</h3>
                <p>Quero gerir meus alunos e treinos na minha academia.</p>
            </div>
            <div className="portal-card" onClick={() => setMode("register-owner")}>
                <div className="portal-icon"><AcademyIcon /></div>
                <h3>Sou Academia</h3>
                <p>Quero gerir meu time e potencializar resultados.</p>
            </div>
        </div>
    );

    const renderRegisterUser = () => (
        <div className="fade-in">
            <button className="back-to-choice" onClick={() => { setMode("choice"); setRegStep("gym"); }}>
                ← Voltar para escolha
            </button>
            {regStep === "gym" ? (
                <form onSubmit={handleValidateGym}>
                    <div className="form-group">
                        <label>ID da Academia</label>
                        <input type="text" placeholder="Ex: GYMPRO2026" required 
                            value={regData.gymId} onChange={e => setRegData({...regData, gymId: e.target.value})} />
                        <p className="hint" style={{fontSize: '0.7rem', marginTop: '5px', color: 'var(--text-muted)'}}>
                            Solicite o código à sua unidade parceira.
                        </p>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "VALIDANDO..." : "PRÓXIMO PASSO"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleRegisterUser}>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" placeholder="Seu nome" required 
                            value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="email" placeholder="seu@email.com" required 
                            value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                    </div>
                    <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Senha</label>
                            <input type="password" placeholder="••••••" required 
                                value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Confirmar</label>
                            <input type="password" placeholder="••••••" required 
                                value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Gênero</label>
                        <select className="select-input" style={{width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-card-alt)', color: 'var(--text-main)', border: '1px solid var(--border-color)'}}
                            value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} required>
                            <option value="">Selecione</option>
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>FINALIZAR CADASTRO</button>
                </form>
            )}
        </div>
    );

    return (
        <div className="auth-hub-container">
            <div className={`auth-hub-card ${mode === 'choice' || mode === 'register-owner' ? 'wide' : ''}`}>
                <header className="header">
                    <div className="app-logo">Gym<span>Club</span></div>
                    <h2>{mode === "login" ? "Conecte-se" : "Novo por aqui?"}</h2>
                    <p>{mode === "login" ? "Acesse seu painel de performance" : "Escolha como quer começar sua jornada"}</p>
                </header>

                <div className="auth-mode-selector">
                    <button className={`mode-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode("login")}>ACESSAR</button>
                    <button className={`mode-btn ${mode !== 'login' ? 'active' : ''}`} onClick={() => setMode("choice")}>CADASTRAR</button>
                </div>

                {mode === "login" && renderLogin()}
                {mode === "choice" && renderChoice()}
                {mode === "register-user" && renderRegisterUser()}
                {mode === "register-owner" && (
                    <div className="fade-in">
                        <button className="back-to-choice" onClick={() => setMode("choice")}>← Voltar para escolha</button>
                        <RegisterOwnerForm 
                            onRegister={async (d) => {
                                try {
                                    setLoading(true);
                                    await gymAuthService.registerGymOwner(d);
                                    showAlert("Sucesso!", "Academia registrada. Faça login.", "success", () => {
                                        setAlertConfig({ isOpen: false });
                                        setMode("login");
                                    });
                                } catch (e) { showAlert("Erro", e.message, "error"); }
                                finally { setLoading(false); }
                            }}
                            onToggleLogin={() => setMode("login")}
                            onToggleUserRegister={() => setMode("register-user")}
                        />
                    </div>
                )}
            </div>
            <CustomAlert config={alertConfig} />
        </div>
    );
}
