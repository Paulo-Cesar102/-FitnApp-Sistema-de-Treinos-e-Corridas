import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCatalogWorkouts, getUserWorkouts } from "../api/workoutService";
import { getUser } from "../api/userService";
import { notificationService } from "../api/notificationService";
import { StreakIcon } from "../Componentes/StreakIcon";
import NotificationModal from "../Componentes/NotificationModal";
import "./home.css";
import "../Componentes/NotificationModal.css";
import CustomAlert from "../Componentes/CustomAlert";

// Ícones Minimalistas Premium
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const DumbbellIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M6 15H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h2m12 6h2a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2M9 7v10m6-10v10m-6-5h6"/></svg>;
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const DEFAULT_WORKOUT_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80";

  useEffect(() => {
    async function loadData() {
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          const userDetails = await getUser(user.id);
          setUserData(userDetails);

          const notifs = await notificationService.getNotifications();
          setUnreadCount(notifs.filter(n => !n.isRead).length);
        }
        const [catalogData, personalData] = await Promise.all([
          getCatalogWorkouts(),
          getUserWorkouts()
        ]);
        setWorkouts(catalogData || []);
        setUserWorkouts(personalData || []);
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openWorkout = (workout) => {
    if (!workout?.exercises?.length) {
       setAlertConfig({
         isOpen: true,
         title: "Aviso do Sistema",
         message: "Este plano de treino está sendo configurado e ainda não possui exercícios disponíveis.",
         type: "error",
         onConfirm: () => setAlertConfig({ isOpen: false })
       });
       return;
    }
    navigate("/executar-treino", { state: { workout: JSON.parse(JSON.stringify(workout)) } });
  };

  const treinosFiltrados = workouts.filter(t => {
    const nome = (typeof t.name === "object" ? t.name?.name : t.name) || "";
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="home-premium-container">
      {/* HEADER DE ALTO IMPACTO */}
      <header className="home-header-v3">
        <div className="header-top-v3">
          <div className="user-greeting-v3">
            <span className="greeting-small">BEM-VINDO DE VOLTA</span>
            <h2 className="greeting-name">{userData?.name?.split(" ")[0] || "Atleta"}</h2>
          </div>
          <div className="header-actions-v3">
            <button className="bell-btn-v3" onClick={() => setIsNotifOpen(true)}>
               <BellIcon />
               {unreadCount > 0 && <span className="notif-badge-v3">{unreadCount}</span>}
            </button>
            <div className="avatar-v3" onClick={() => navigate("/perfil")}>
              {userData?.name ? userData.name.charAt(0) : "U"}
            </div>
          </div>
        </div>

        <div className="header-bottom-v3">
          <h1 className="app-logo-v3">Gym<span>Club</span></h1>
          <div className="streak-pill-v3">
            <StreakIcon streak={userData?.streak || 0} />
            <span className="streak-count-v3">{userData?.streak || 0}</span>
          </div>
        </div>
      </header>

      <NotificationModal 
        isOpen={isNotifOpen} 
        onClose={() => {
          setIsNotifOpen(false);
          notificationService.getNotifications().then(data => {
            setUnreadCount(data.filter(n => !n.isRead).length);
          });
        }} 
      />

      {/* PROGRESS WIDGET */}
      <section className="xp-widget-v3">
        <div className="xp-info-v3">
          <div className="xp-text-group">
            <span className="xp-label-v3">NÍVEL ATUAL</span>
            <h3 className="xp-rank-v3">{userData?.level || 1}</h3>
          </div>
          <div className="xp-stats-v3">
            <span className="xp-value-v3">{userData?.xp || 0} XP</span>
            <span className="xp-next-v3">Próximo nível em {100 - ((userData?.xp || 0) % 100)} XP</span>
          </div>
        </div>
        <div className="xp-progress-container-v3">
          <div className="xp-progress-bar-v3" style={{ width: `${(userData?.xp || 0) % 100}%` }}>
            <div className="xp-glow-v3"></div>
          </div>
        </div>
      </section>

      {/* MEUS TREINOS */}
      {!loading && userWorkouts.length > 0 && (
        <section className="home-section-v3">
          <div className="section-header-v3">
            <h3>MEUS <span>PLANOS</span></h3>
            <button className="btn-see-all-v3" onClick={() => navigate("/exercicio")}>VER TODOS</button>
          </div>
          <div className="horizontal-scroll-v3">
            {userWorkouts.map(treino => (
              <div key={treino.id} className="plan-card-v3" onClick={() => openWorkout(treino)}>
                <div className="plan-media-v3">
                  <img 
                    src={treino.exercises?.[0]?.exercise?.image || DEFAULT_WORKOUT_IMAGE} 
                    alt="" 
                    onError={(e) => { e.currentTarget.src = DEFAULT_WORKOUT_IMAGE; }}
                  />
                  <div className="plan-overlay-v3">
                    <PlayIcon />
                  </div>
                </div>
                <div className="plan-content-v3">
                  <h4>{typeof treino.name === "object" ? treino.name?.name : treino.name}</h4>
                  <span>{treino.exercises?.length || 0} EXERCÍCIOS</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BIBLIOTECA OFICIAL */}
      <section className="home-section-v3">
        <div className="section-header-v3">
          <h3>BIBLIOTECA <span>OFICIAL</span></h3>
        </div>
        
        <div className="search-bar-v3-home">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="O que vamos treinar hoje?" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="catalog-grid-v3">
          {loading ? (
            [1,2,3,4].map(n => <div key={n} className="skeleton-v3" />)
          ) : treinosFiltrados.length === 0 ? (
            <div className="empty-state-v3">
              <DumbbellIcon />
              <p>Nenhum treino disponível no momento</p>
            </div>
          ) : (
            treinosFiltrados.map(treino => {
              const name = typeof treino.name === "object" ? treino.name?.name : treino.name;
              const level = treino.exercises?.[0]?.exercise?.level || "BEGINNER";
              const thumb = treino.exercises?.[0]?.exercise?.image || DEFAULT_WORKOUT_IMAGE;

              return (
                <div key={treino.id} className="catalog-item-v3" onClick={() => openWorkout(treino)}>
                  <div className="catalog-thumb-v3">
                    <img 
                      src={thumb} 
                      alt={name} 
                      onError={(e) => { e.currentTarget.src = DEFAULT_WORKOUT_IMAGE; }}
                    />
                    <div className={`level-badge-v3 ${level.toLowerCase()}`}>
                       {level === "ADVANCED" ? "ELITE" : level === "INTERMEDIATE" ? "MÉDIO" : "INICIANTE"}
                    </div>
                  </div>
                  <div className="catalog-details-v3">
                    <h4>{name}</h4>
                    <div className="catalog-meta-v3">
                      <PlayIcon />
                      <span>{treino.exercises?.length || 0} Exercícios</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
