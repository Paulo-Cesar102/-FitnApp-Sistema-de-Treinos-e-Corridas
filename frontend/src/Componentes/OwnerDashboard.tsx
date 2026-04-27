import React, { useState, useEffect } from "react";
import { socket } from "../service/socket";
import { gymAuthService } from "../api/gymAuthService";
import { gymService } from "../api/gymService";
import { workoutService } from "../api/workoutService";
import "./OwnerDashboard.css";

interface Personal {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  bio: string;
  students?: any[];
}

interface GymStats {
  gym: {
    id: string;
    name: string;
    inviteCode: string;
  };
  stats: {
    totalMembers: number;
    totalPersonals: number;
    todayCheckIns: number;
  };
  topRanking: any[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  createdAt: string;
}

interface OwnerDashboardProps {
  gymId: string;
  gymName: string;
  token: string;
  onLogout: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  gymId,
  gymName,
  token,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "personals" | "announcements" | "members">("overview");
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [stats, setStats] = useState<GymStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreatePersonal, setShowCreatePersonal] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [error, setError] = useState("");
  const [selectedPersonalId, setSelectedPersonalId] = useState<string | null>(null);
  const [personalWorkouts, setPersonalWorkouts] = useState<any[]>([]);

  const [newPersonal, setNewPersonal] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    bio: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isUrgent: false,
  });

  useEffect(() => {
    loadStats();
    loadPersonals();
    if (activeTab === "announcements") loadAnnouncements();
    if (activeTab === "members") loadMembers();

    if (socket && gymId) {
      socket.emit("join_gym_room", gymId);

      const handleUpdate = (data: any) => {
        if (data.gymId === gymId) {
          loadStats();
          if (activeTab === "personals") loadPersonals();
          if (activeTab === "announcements") loadAnnouncements();
        }
      };

      socket.on("ranking_updated", handleUpdate);
      socket.on("personal_updated", handleUpdate);
      socket.on("announcement_updated", handleUpdate);

      return () => {
        socket.off("ranking_updated", handleUpdate);
        socket.off("personal_updated", handleUpdate);
        socket.off("announcement_updated", handleUpdate);
        socket.emit("leave_gym_room", gymId);
      };
    }
  }, [gymId, activeTab]);

  const loadStats = async () => {
    try {
      const data = await gymAuthService.getStats(gymId);
      setStats(data);
    } catch (err) {
      setError("Erro ao carregar estatísticas");
    }
  };

  const loadPersonals = async () => {
    try {
      const data = await gymAuthService.listPersonals(gymId);
      setPersonals(data.personals || []);
    } catch (err) {
      setError("Erro ao carregar personals");
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await gymService.getGymAnnouncements(gymId);
      setAnnouncements(data.announcements || []);
    } catch (err) {
      setError("Erro ao carregar anúncios");
    }
  };

  const loadMembers = async (search?: string) => {
    try {
      const data = await gymAuthService.listMembers(gymId, search);
      setMembers(data.members || []);
    } catch (err) {
      setError("Erro ao carregar membros");
    }
  };

  const handleMemberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers(memberSearch);
  };

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gymAuthService.createPersonal(gymId, newPersonal);

      setNewPersonal({
        name: "",
        email: "",
        password: "",
        specialization: "",
        bio: "",
      });
      setShowCreatePersonal(false);
      loadPersonals();
      loadStats();

      if (socket) {
        socket.emit("personal_updated", { gymId });
      }

    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeletePersonal = async (personalId: string) => {
    if (!confirm("Tem certeza que deseja deletar este personal?")) return;

    try {
      await gymAuthService.deletePersonal(gymId, personalId);
      loadPersonals();
      loadStats();
      
      if (socket) {
        socket.emit("personal_updated", { gymId });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gymService.createAnnouncement({ ...newAnnouncement, gymId });
      setNewAnnouncement({ title: "", content: "", isUrgent: false });
      setShowCreateAnnouncement(false);
      loadAnnouncements();
      
      if (socket) {
        socket.emit("announcement_updated", { gymId });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Deletar este comunicado?")) return;
    try {
      await gymService.deleteAnnouncement(id);
      loadAnnouncements();
      if (socket) {
        socket.emit("announcement_updated", { gymId });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const loadPersonalWorkouts = async (userId: string) => {
    if (selectedPersonalId === userId) {
      setSelectedPersonalId(null);
      setPersonalWorkouts([]);
      return;
    }
    
    try {
      const data = await workoutService.getUserWorkouts(userId);
      setPersonalWorkouts(data);
      setSelectedPersonalId(userId);
    } catch (err) {
      setError("Erro ao carregar treinos do personal");
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm("Deletar este treino do personal?")) return;
    try {
      await workoutService.deleteWorkout(workoutId);
      setPersonalWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="owner-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🏢</div>
          <h2>{gymName}</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="icon">📊</span> Visão Geral
          </button>
          <button
            className={`nav-item ${activeTab === "personals" ? "active" : ""}`}
            onClick={() => setActiveTab("personals")}
          >
            <span className="icon">👨‍🏫</span> Personals
          </button>
          <button
            className={`nav-item ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            <span className="icon">📢</span> Avisos
          </button>
          <button
            className={`nav-item ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <span className="icon">👥</span> Membros
          </button>
        </nav>

        <div className="sidebar-footer">
            <div className="gym-code-box">
                <p>Código da Academia</p>
                <strong>{stats?.gym?.inviteCode || "---"}</strong>
            </div>
            <button onClick={onLogout} className="logout-btn">
                Sair do Sistema
            </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {error && <div className="error-toast">{error}</div>}

        {activeTab === "overview" && stats && (
          <div className="fade-in">
            <div className="content-header">
              <h1>Dashboard Executivo</h1>
              <p>Métricas e desempenho em tempo real</p>
            </div>

            <div className="metrics-grid">
              <div className="metric-card glass">
                <div className="metric-icon members">👥</div>
                <div className="metric-data">
                  <span className="label">Total de Membros</span>
                  <span className="value">{stats.stats.totalMembers}</span>
                </div>
              </div>

              <div className="metric-card glass">
                <div className="metric-icon personals">👨‍🏫</div>
                <div className="metric-data">
                  <span className="label">Equipe Personal</span>
                  <span className="value">{stats.stats.totalPersonals}</span>
                </div>
              </div>

              <div className="metric-card glass">
                <div className="metric-icon checkin">✅</div>
                <div className="metric-data">
                  <span className="label">Check-ins Hoje</span>
                  <span className="value">{stats.stats.todayCheckIns}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-row">
                <div className="ranking-panel glass">
                    <div className="panel-header">
                        <h3>🏆 Top 10 Alunos</h3>
                        <p>Líderes de engajamento</p>
                    </div>
                    <div className="ranking-table">
                        {stats.topRanking.map((user, index) => (
                            <div key={index} className="ranking-row">
                                <div className="user-pos">#{index + 1}</div>
                                <div className="user-name">{user.user.name}</div>
                                <div className="user-score">{user.totalXpGained} XP</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="activity-panel glass">
                    <div className="panel-header">
                        <h3>📈 Atividade Recente</h3>
                    </div>
                    <div className="empty-panel-msg">
                        Nenhuma atividade recente registrada.
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === "personals" && (
          <div className="fade-in">
            <div className="content-header flex-header">
              <div>
                <h1>Gestão da Equipe</h1>
                <p>Cadastre e gerencie seus instrutores</p>
              </div>
              <button
                className="add-btn neon-glow"
                onClick={() => setShowCreatePersonal(!showCreatePersonal)}
              >
                {showCreatePersonal ? "Fechar" : "+ Novo Personal"}
              </button>
            </div>

            {showCreatePersonal && (
              <div className="form-container glass slide-down">
                <h3>Novo Cadastro de Instrutor</h3>
                <form onSubmit={handleCreatePersonal} className="personal-form">
                  <div className="form-grid">
                    <div className="input-group">
                        <label>Nome Completo</label>
                        <input
                            type="text"
                            value={newPersonal.name}
                            onChange={(e) => setNewPersonal({ ...newPersonal, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>E-mail Profissional</label>
                        <input
                            type="email"
                            value={newPersonal.email}
                            onChange={(e) => setNewPersonal({ ...newPersonal, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Senha Provisória</label>
                        <input
                            type="password"
                            value={newPersonal.password}
                            onChange={(e) => setNewPersonal({ ...newPersonal, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Especialização</label>
                        <input
                            type="text"
                            placeholder="Ex: Musculação, Yoga..."
                            value={newPersonal.specialization}
                            onChange={(e) => setNewPersonal({ ...newPersonal, specialization: e.target.value })}
                            required
                        />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Bio / Experiência</label>
                    <textarea
                        value={newPersonal.bio}
                        onChange={(e) => setNewPersonal({ ...newPersonal, bio: e.target.value })}
                        rows={3}
                    />
                  </div>
                  <button type="submit" className="submit-btn neon-glow">
                    Confirmar Cadastro
                  </button>
                </form>
              </div>
            )}

            <div className="personals-list-grid">
              {personals.length === 0 ? (
                <div className="empty-state glass">
                    <p>Sua equipe de personals está vazia.</p>
                </div>
              ) : (
                personals.map((personal) => (
                  <div key={personal.id} className="personal-card-new glass">
                    <div className="card-header">
                        <div className="avatar">{personal.name.charAt(0)}</div>
                        <div className="header-info">
                            <h3>{personal.name}</h3>
                            <span className="spec-tag">{personal.specialization}</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <p className="email">✉ {personal.email}</p>
                        <p className="bio">{personal.bio || "Sem descrição disponível."}</p>
                    </div>
                    <div className="card-footer">
                        <span className="student-count">👥 {personal.students?.length || 0} alunos</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            className="workouts-btn"
                            onClick={() => loadPersonalWorkouts(personal.userId)}
                          >
                            Treinos
                          </button>
                          <button
                              className="delete-icon-btn"
                              onClick={() => handleDeletePersonal(personal.id)}
                              title="Remover Personal"
                          >
                              🗑
                          </button>
                        </div>
                    </div>
                    {selectedPersonalId === personal.userId && (
                      <div className="personal-workouts-list slide-down" style={{ marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--accent-neon)' }}>Treinos do Personal</h4>
                        {personalWorkouts.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Nenhum treino criado.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {personalWorkouts.map(w => (
                              <li key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span>{w.name} ({w.exercises?.length || 0} exerc.)</span>
                                <button 
                                  onClick={() => handleDeleteWorkout(w.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                >
                                  X
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="fade-in">
            <div className="content-header flex-header">
              <div>
                <h1>Comunicados</h1>
                <p>Mantenha seus alunos informados</p>
              </div>
              <button
                className="add-btn neon-glow"
                onClick={() => setShowCreateAnnouncement(!showCreateAnnouncement)}
              >
                {showCreateAnnouncement ? "Fechar" : "+ Novo Aviso"}
              </button>
            </div>

            {showCreateAnnouncement && (
              <div className="form-container glass slide-down">
                <h3>Criar Novo Comunicado</h3>
                <form onSubmit={handleCreateAnnouncement} className="personal-form">
                  <div className="input-group">
                    <label>Título</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Conteúdo</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="input-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newAnnouncement.isUrgent}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isUrgent: e.target.checked })}
                      />
                      Marcar como Urgente
                    </label>
                  </div>
                  <button type="submit" className="submit-btn neon-glow">
                    Publicar Aviso
                  </button>
                </form>
              </div>
            )}

            <div className="announcements-grid">
              {announcements.length === 0 ? (
                <div className="empty-state glass">
                  <p>Nenhum comunicado publicado ainda.</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className={`announcement-card glass ${ann.isUrgent ? 'urgent' : ''}`}>
                    <div className="card-header">
                      <h3>{ann.title}</h3>
                      {ann.isUrgent && <span className="urgent-badge">URGENTE</span>}
                    </div>
                    <div className="card-body">
                      <p>{ann.content}</p>
                      <span className="date">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="card-footer">
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="delete-btn">
                        Deletar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="fade-in">
            <div className="content-header">
              <h1>Gestão de Membros</h1>
              <p>Visualize e busque por alunos ativos</p>
            </div>

            <div className="search-bar-container glass">
              <form onSubmit={handleMemberSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">🔍 Buscar</button>
              </form>
            </div>

            <div className="members-list glass">
              {members.length === 0 ? (
                <div className="empty-panel-msg">Nenhum membro encontrado.</div>
              ) : (
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Atleta</th>
                      <th>E-mail</th>
                      <th>Nível / XP</th>
                      <th>Streak</th>
                      <th>Último Treino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="member-name-cell">
                          <div className="mini-avatar">{member.name.charAt(0)}</div>
                          {member.name}
                        </td>
                        <td>{member.email}</td>
                        <td>
                          <span className="level-tag">Lvl {member.level}</span>
                          <span className="xp-text">{member.xp} XP</span>
                        </td>
                        <td>🔥 {member.streak} dias</td>
                        <td>{member.lastActivityDate ? new Date(member.lastActivityDate).toLocaleDateString() : "---"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
